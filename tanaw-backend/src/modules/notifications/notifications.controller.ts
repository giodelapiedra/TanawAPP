import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { ListNotificationsQueryDto } from './notifications.schema';
import * as notificationsService from './notifications.service';

type NotifReq = Request<{ id: string }>;

export async function listNotifications(req: Request, res: Response) {
  const query = req.query as unknown as ListNotificationsQueryDto;
  const data = await notificationsService.listForUser(req.user!.userId, query);
  sendSuccess(res, data, 'Notifications retrieved');
}

export async function getUnreadCount(req: Request, res: Response) {
  const data = await notificationsService.getUnreadCount(req.user!.userId);
  sendSuccess(res, data, 'Unread count retrieved');
}

export async function markAsRead(req: NotifReq, res: Response) {
  const data = await notificationsService.markAsRead(req.user!.userId, req.params.id);
  sendSuccess(res, data, 'Notification marked as read');
}

export async function markAllAsRead(req: Request, res: Response) {
  const data = await notificationsService.markAllAsRead(req.user!.userId);
  sendSuccess(res, data, 'All notifications marked as read');
}
