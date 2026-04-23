import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createCommentSchema, createPostSchema, updatePostSchema } from './groups.schema';
import * as groupsController from './groups.controller';

export const groupsRouter = Router();

groupsRouter.use(authMiddleware);

// My group
groupsRouter.get('/mine', groupsController.getMyGroup);

// Specific /posts and /comments routes must be registered before /:code/posts
// so Express doesn't treat "posts" or "comments" as a barangay code.
groupsRouter.get('/posts/:postId', groupsController.getPostById);
groupsRouter.patch('/posts/:postId', validate(updatePostSchema), groupsController.updatePost);
groupsRouter.delete('/posts/:postId', groupsController.deletePost);
groupsRouter.post('/posts/:postId/like', groupsController.toggleLike);
groupsRouter.get('/posts/:postId/comments', groupsController.listComments);
groupsRouter.post('/posts/:postId/comments', validate(createCommentSchema), groupsController.createComment);

groupsRouter.delete('/comments/:commentId', groupsController.deleteComment);

// Posts within a barangay group (must come last)
groupsRouter.get('/:code/posts', groupsController.listPosts);
groupsRouter.post('/:code/posts', validate(createPostSchema), groupsController.createPost);
