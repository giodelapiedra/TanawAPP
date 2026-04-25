import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { listQuerySchema } from './follows.schema';
import * as followsController from './follows.controller';

export const followsRouter = Router();

followsRouter.use(authMiddleware);

followsRouter.get('/me/following', validate(listQuerySchema, 'query'), followsController.myFollowing);
followsRouter.get('/me/followers', validate(listQuerySchema, 'query'), followsController.myFollowers);

followsRouter.get('/users/:userId/following', validate(listQuerySchema, 'query'), followsController.userFollowing);
followsRouter.get('/users/:userId/followers', validate(listQuerySchema, 'query'), followsController.userFollowers);
followsRouter.get('/users/:userId/counts', followsController.counts);

followsRouter.post('/:userId', followsController.follow);
followsRouter.delete('/:userId', followsController.unfollow);
