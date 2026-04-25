import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { CreatePublicPostDto, DiscoverUsersQueryDto, ListQueryDto } from './feed.schema';
import * as feedService from './feed.service';

export async function createPost(req: Request, res: Response) {
  const body = req.body as CreatePublicPostDto;
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const data = await feedService.createPublicPost(req.user!.userId, body, files);
  sendSuccess(res, data, 'Post created', 201);
}

export async function myFeed(req: Request, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await feedService.listMyFeed(req.user!.userId, query);
  sendSuccess(res, data, 'Feed retrieved');
}

export async function discoverUsers(req: Request, res: Response) {
  const query = req.query as unknown as DiscoverUsersQueryDto;
  const data = await feedService.discoverUsers(req.user!.userId, query);
  sendSuccess(res, data, 'Users retrieved');
}
