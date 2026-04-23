import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadManyImages } from '../../middleware/upload.middleware';
import * as feedController from './feed.controller';

export const feedRouter = Router();

feedRouter.use(authMiddleware);

feedRouter.get('/', feedController.myFeed);
feedRouter.get('/discover/users', feedController.discoverUsers);
feedRouter.post('/posts', uploadManyImages('images', 4), feedController.createPost);
