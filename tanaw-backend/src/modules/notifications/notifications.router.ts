import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { listNotificationsQuerySchema } from './notifications.schema';
import * as notificationsController from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get('/', validate(listNotificationsQuerySchema, 'query'), notificationsController.listNotifications);
notificationsRouter.get('/unread-count', notificationsController.getUnreadCount);
notificationsRouter.post('/read-all', notificationsController.markAllAsRead);
notificationsRouter.post('/:id/read', notificationsController.markAsRead);
