import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { USER_CARD_SELECT } from '../../utils/prisma-selects.util';
import { ListQueryDto } from './follows.schema';

async function requireUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function follow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError('You cannot follow yourself', 400);
  }
  await requireUser(followingId);

  try {
    await prisma.follow.create({
      data: { followerId, followingId },
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return { following: true, alreadyFollowing: true };
    }
    throw err;
  }
  return { following: true, alreadyFollowing: false };
}

export async function unfollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError('Invalid operation', 400);
  }
  const result = await prisma.follow.deleteMany({
    where: { followerId, followingId },
  });
  return { following: false, removed: result.count > 0 };
}

export async function listFollowing(userId: string, viewerId: string, query: ListQueryDto) {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    include: { following: { select: USER_CARD_SELECT } },
  });

  const hasMore = rows.length > query.limit;
  const pageRows = rows.slice(0, query.limit);

  const followedByViewer = viewerId
    ? await prisma.follow.findMany({
        where: {
          followerId: viewerId,
          followingId: { in: pageRows.map((r) => r.following.id) },
        },
        select: { followingId: true },
      })
    : [];
  const followedSet = new Set(followedByViewer.map((f) => f.followingId));

  const items = pageRows.map((r) => ({
    ...r.following,
    isFollowedByMe: viewerId === r.following.id ? false : followedSet.has(r.following.id),
    isSelf: viewerId === r.following.id,
  }));

  return {
    items,
    nextCursor: hasMore ? pageRows[pageRows.length - 1].id : null,
  };
}

export async function listFollowers(userId: string, viewerId: string, query: ListQueryDto) {
  const rows = await prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    include: { follower: { select: USER_CARD_SELECT } },
  });

  const hasMore = rows.length > query.limit;
  const pageRows = rows.slice(0, query.limit);

  const followedByViewer = viewerId
    ? await prisma.follow.findMany({
        where: {
          followerId: viewerId,
          followingId: { in: pageRows.map((r) => r.follower.id) },
        },
        select: { followingId: true },
      })
    : [];
  const followedSet = new Set(followedByViewer.map((f) => f.followingId));

  const items = pageRows.map((r) => ({
    ...r.follower,
    isFollowedByMe: viewerId === r.follower.id ? false : followedSet.has(r.follower.id),
    isSelf: viewerId === r.follower.id,
  }));

  return {
    items,
    nextCursor: hasMore ? pageRows[pageRows.length - 1].id : null,
  };
}

export async function getCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) return false;
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });
  return !!row;
}
