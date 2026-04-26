import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { AUTHOR_SELECT as ACTOR_SELECT } from '../../utils/prisma-selects.util';
import { resolveActorPhotos } from '../../utils/user-photo.util';
import { ListNotificationsQueryDto } from './notifications.schema';

interface CreateNotificationInput {
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string | null;
  commentId?: string | null;
  tx?: Prisma.TransactionClient;
}

export async function createNotification(input: CreateNotificationInput) {
  if (input.userId === input.actorId) return null;

  const client = input.tx ?? prisma;
  return client.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      postId: input.postId ?? null,
      commentId: input.commentId ?? null,
    },
  });
}

export async function listForUser(userId: string, query: ListNotificationsQueryDto) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: query.limit + 1,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    include: { actor: { select: ACTOR_SELECT } },
  });

  const hasMore = rows.length > query.limit;
  const pageRows = rows.slice(0, query.limit);
  const items = await resolveActorPhotos(pageRows);

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

export async function markAsRead(userId: string, notificationId: string) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true, isRead: true },
  });
  if (!existing) throw new AppError('Notification not found', 404);
  if (existing.userId !== userId) throw new AppError('Forbidden', 403);
  if (existing.isRead) return { updated: false };

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return { updated: true };
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
}
