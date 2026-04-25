import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { AUTHOR_SELECT, USER_CARD_SELECT } from '../../utils/prisma-selects.util';
import { POST_IMAGES_SELECT, mapPostShape, mapPostShapes } from '../../utils/post-shape.util';
import * as storageService from '../storage/storage.service';
import { CreatePublicPostDto, DiscoverUsersQueryDto, ListQueryDto } from './feed.schema';

export async function createPublicPost(
  userId: string,
  dto: CreatePublicPostDto,
  files: Express.Multer.File[] = []
) {
  const content = dto.content.trim();

  if (!content && files.length === 0) {
    throw new AppError('Post content or at least one image is required', 422);
  }

  if (files.length > 4) {
    throw new AppError('Max 4 images per post', 422);
  }

  const imageKeys: string[] = [];
  for (const file of files) {
    const key = storageService.buildObjectKey('posts', userId, file.mimetype);
    imageKeys.push(key);
  }

  try {
    await Promise.all(
      files.map((file, i) => storageService.uploadBuffer(imageKeys[i], file.buffer, file.mimetype))
    );
  } catch (err) {
    console.error('[feed.createPublicPost] image upload failed', {
      userId,
      fileCount: files.length,
      mimeTypes: files.map((file) => file.mimetype),
      imageKeys,
    });
    await Promise.all(imageKeys.map((k) => storageService.deleteObject(k).catch(() => undefined)));
    throw err;
  }

  try {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content,
        visibility: 'PUBLIC',
        barangayId: null,
        images: {
          create: imageKeys.map((key, position) => ({ objectKey: key, position })),
        },
      },
      include: {
        author: { select: AUTHOR_SELECT },
        _count: { select: { comments: true, likes: true } },
        likes: { where: { userId }, select: { id: true } },
        images: POST_IMAGES_SELECT,
      },
    });
    return mapPostShape(post);
  } catch (err) {
    await Promise.all(imageKeys.map((k) => storageService.deleteObject(k).catch(() => undefined)));
    throw err;
  }
}

export async function listMyFeed(userId: string, query: ListQueryDto) {
  // Single-query feed: own posts + posts whose author the viewer follows.
  // Avoids materializing every followingId into an IN clause — scales to
  // users who follow thousands without blowing up the query plan.
  const posts = await prisma.post.findMany({
    where: {
      visibility: 'PUBLIC',
      OR: [
        { authorId: userId },
        { author: { followers: { some: { followerId: userId } } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: { comments: true, likes: true } },
      likes: { where: { userId }, select: { id: true } },
      images: POST_IMAGES_SELECT,
    },
  });

  const hasMore = posts.length > query.limit;
  const pagePosts = posts.slice(0, query.limit);
  const items = await mapPostShapes(pagePosts);

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function discoverUsers(viewerId: string, query: DiscoverUsersQueryDto) {
  const search = query.q?.trim();
  const where: Prisma.UserWhereInput = {
    id: { not: viewerId },
    status: 'ACTIVE',
    ...(search
      ? {
          OR: [
            { tanawId: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: USER_CARD_SELECT,
  });

  const hasMore = users.length > query.limit;
  const pageUsers = users.slice(0, query.limit);

  const myFollows = await prisma.follow.findMany({
    where: {
      followerId: viewerId,
      followingId: { in: pageUsers.map((u) => u.id) },
    },
    select: { followingId: true },
  });
  const followedSet = new Set(myFollows.map((f) => f.followingId));

  const items = await Promise.all(
    pageUsers.map(async (u) => ({
      ...u,
      profilePhoto: await storageService.resolvePublicUrlIfPresent(u.profilePhoto),
      isFollowedByMe: followedSet.has(u.id),
      isSelf: false,
    }))
  );

  return {
    items,
    nextCursor: hasMore ? pageUsers[pageUsers.length - 1].id : null,
  };
}
