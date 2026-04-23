import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as followsController from './follows.controller';

export const followsRouter = Router();

followsRouter.use(authMiddleware);

followsRouter.get('/me/following', followsController.myFollowing);
followsRouter.get('/me/followers', followsController.myFollowers);

followsRouter.get('/users/:userId/following', followsController.userFollowing);
followsRouter.get('/users/:userId/followers', followsController.userFollowers);
followsRouter.get('/users/:userId/counts', followsController.counts);

followsRouter.post('/:userId', followsController.follow);
followsRouter.delete('/:userId', followsController.unfollow);
