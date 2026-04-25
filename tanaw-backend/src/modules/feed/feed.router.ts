import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadManyImages } from '../../middleware/upload.middleware';
import { createPublicPostSchema, discoverUsersQuerySchema, listQuerySchema } from './feed.schema';
import * as feedController from './feed.controller';

export const feedRouter = Router();

feedRouter.use(authMiddleware);

feedRouter.get('/', validate(listQuerySchema, 'query'), feedController.myFeed);
feedRouter.get('/discover/users', validate(discoverUsersQuerySchema, 'query'), feedController.discoverUsers);
feedRouter.post('/posts', uploadManyImages('images', 4), validate(createPublicPostSchema), feedController.createPost);
