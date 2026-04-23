import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { createPublicPostSchema, discoverUsersQuerySchema, listQuerySchema } from './feed.schema';
import * as feedService from './feed.service';

export async function createPost(req: Request, res: Response) {
  const body = createPublicPostSchema.parse(req.body);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const data = await feedService.createPublicPost(req.user!.userId, body, files);
  sendSuccess(res, data, 'Post created', 201);
}

export async function myFeed(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const data = await feedService.listMyFeed(req.user!.userId, query);
  sendSuccess(res, data, 'Feed retrieved');
}

export async function discoverUsers(req: Request, res: Response) {
  const query = discoverUsersQuerySchema.parse(req.query);
  const data = await feedService.discoverUsers(req.user!.userId, query);
  sendSuccess(res, data, 'Users retrieved');
}
