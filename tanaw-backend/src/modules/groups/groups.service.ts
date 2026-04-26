import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { AUTHOR_SELECT } from '../../utils/prisma-selects.util';
import { POST_IMAGES_SELECT, mapPostShape, mapPostShapes } from '../../utils/post-shape.util';
import { resolveAuthorPhoto, resolveAuthorPhotos } from '../../utils/user-photo.util';
import { CreateCommentDto, CreatePostDto, ListQueryDto, UpdatePostDto } from './groups.schema';
import * as notificationsService from '../notifications/notifications.service';
import * as storageService from '../storage/storage.service';

async function requireUserBarangay(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { barangayId: true, barangay: { select: { id: true, code: true, name: true } } },
  });
  if (!user || !user.barangayId || !user.barangay) {
    throw new AppError('You are not assigned to a barangay group', 403);
  }
  return { barangayId: user.barangayId, barangay: user.barangay };
}

// Ensures the viewer is allowed to see/interact with a post regardless of visibility.
// COMMUNITY post → viewer must share the author's barangay.
// PUBLIC post → viewer must be the author OR follow the author.
async function requirePostVisibleToMe(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, barangayId: true, visibility: true },
  });
  if (!post) throw new AppError('Post not found', 404);

  if (post.visibility === 'COMMUNITY') {
    const { barangayId } = await requireUserBarangay(userId);
    if (!post.barangayId || post.barangayId !== barangayId) {
      throw new AppError('You can only access your own barangay group', 403);
    }
    return post;
  }

  // PUBLIC
  if (post.authorId === userId) return post;
  const follows = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: post.authorId } },
    select: { id: true },
  });
  if (!follows) throw new AppError('You need to follow this user to view this post', 403);
  return post;
}

async function getBarangayByCode(code: string) {
  const barangay = await prisma.barangay.findUnique({
    where: { code },
    select: { id: true, code: true, name: true },
  });
  if (!barangay) throw new AppError('Barangay group not found', 404);
  return barangay;
}

function assertMember(userBarangayId: string, groupBarangayId: string) {
  if (userBarangayId !== groupBarangayId) {
    throw new AppError('You can only access your own barangay group', 403);
  }
}

export async function getMyGroup(userId: string) {
  const { barangay } = await requireUserBarangay(userId);
  const [memberCount, postCount] = await Promise.all([
    prisma.user.count({ where: { barangayId: barangay.id } }),
    prisma.post.count({ where: { barangayId: barangay.id } }),
  ]);
  return {
    code: barangay.code,
    name: barangay.name,
    memberCount,
    postCount,
  };
}

export async function listPosts(userId: string, code: string, query: ListQueryDto) {
  const { barangayId } = await requireUserBarangay(userId);
  const group = await getBarangayByCode(code);
  assertMember(barangayId, group.id);

  const posts = await prisma.post.findMany({
    where: { barangayId: group.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
  const items = await mapPostShapes(posts.slice(0, query.limit));

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function getPostById(userId: string, postId: string) {
  await requirePostVisibleToMe(userId, postId);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: { comments: true, likes: true } },
      likes: { where: { userId }, select: { id: true } },
      images: POST_IMAGES_SELECT,
    },
  });
  if (!post) throw new AppError('Post not found', 404);

  return mapPostShape(post);
}

export async function createPost(userId: string, code: string, dto: CreatePostDto) {
  const { barangayId } = await requireUserBarangay(userId);
  const group = await getBarangayByCode(code);
  assertMember(barangayId, group.id);

  const post = await prisma.post.create({
    data: {
      barangayId: group.id,
      authorId: userId,
      content: dto.content,
    },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: { comments: true, likes: true } },
      // No `likes` include — a brand-new post has none for the author either way.
      // mapPostShape reads `post.likes` so we pass an empty list explicitly below.
      images: POST_IMAGES_SELECT,
    },
  });

  return mapPostShape({ ...post, likes: [] });
}

export async function updatePost(userId: string, postId: string, dto: UpdatePostDto) {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, barangayId: true },
  });
  if (!existing) throw new AppError('Post not found', 404);
  if (existing.authorId !== userId) throw new AppError('You can only edit your own posts', 403);

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { content: dto.content },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: { comments: true, likes: true } },
      likes: { where: { userId }, select: { id: true } },
      images: POST_IMAGES_SELECT,
    },
  });

  return mapPostShape(updated);
}

export async function deletePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      authorId: true,
      images: { select: { objectKey: true } },
    },
  });
  if (!post) throw new AppError('Post not found', 404);
  if (post.authorId !== userId) throw new AppError('You can only delete your own posts', 403);

  await prisma.post.delete({ where: { id: postId } });

  // Best-effort R2 cleanup — post row and its PostImage rows are already gone
  // (onDelete: Cascade), so orphaned bucket objects are the only leak risk.
  if (post.images.length > 0) {
    await Promise.all(
      post.images.map((img) =>
        storageService.deleteObject(img.objectKey).catch(() => undefined)
      )
    );
  }

  return { deleted: true };
}

export async function toggleLike(userId: string, postId: string) {
  await requirePostVisibleToMe(userId, postId);

  const { liked, likeCount } = await prisma.$transaction(async (tx) => {
    const existing = await tx.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    });

    if (existing) {
      await tx.postLike.delete({ where: { id: existing.id } });
    } else {
      await tx.postLike.create({ data: { postId, userId } });
    }

    const count = await tx.postLike.count({ where: { postId } });
    return { liked: !existing, likeCount: count };
  });

  return { liked, likeCount };
}

export async function listComments(userId: string, postId: string, query: ListQueryDto) {
  await requirePostVisibleToMe(userId, postId);

  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    include: { author: { select: AUTHOR_SELECT } },
  });

  const hasMore = comments.length > query.limit;
  const pageComments = comments.slice(0, query.limit);
  const items = await resolveAuthorPhotos(pageComments);

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function createComment(userId: string, postId: string, dto: CreateCommentDto) {
  const post = await requirePostVisibleToMe(userId, postId);

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.postComment.create({
      data: { postId, authorId: userId, content: dto.content },
      include: { author: { select: AUTHOR_SELECT } },
    });

    await notificationsService.createNotification({
      userId: post.authorId,
      actorId: userId,
      type: 'POST_COMMENT',
      postId,
      commentId: created.id,
      tx,
    });

    return created;
  });

  return resolveAuthorPhoto(comment);
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.authorId !== userId) throw new AppError('You can only delete your own comments', 403);

  await prisma.postComment.delete({ where: { id: commentId } });
  return { deleted: true };
}
