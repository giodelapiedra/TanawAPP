import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { ListQueryDto } from './follows.schema';
import * as followsService from './follows.service';

type UserIdReq = Request<{ userId: string }>;

export async function follow(req: UserIdReq, res: Response) {
  const data = await followsService.follow(req.user!.userId, req.params.userId);
  sendSuccess(res, data, 'Followed', 201);
}

export async function unfollow(req: UserIdReq, res: Response) {
  const data = await followsService.unfollow(req.user!.userId, req.params.userId);
  sendSuccess(res, data, 'Unfollowed');
}

export async function myFollowing(req: Request, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await followsService.listFollowing(req.user!.userId, req.user!.userId, query);
  sendSuccess(res, data, 'Following retrieved');
}

export async function myFollowers(req: Request, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await followsService.listFollowers(req.user!.userId, req.user!.userId, query);
  sendSuccess(res, data, 'Followers retrieved');
}

export async function userFollowing(req: UserIdReq, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await followsService.listFollowing(req.params.userId, req.user!.userId, query);
  sendSuccess(res, data, 'Following retrieved');
}

export async function userFollowers(req: UserIdReq, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await followsService.listFollowers(req.params.userId, req.user!.userId, query);
  sendSuccess(res, data, 'Followers retrieved');
}

export async function counts(req: UserIdReq, res: Response) {
  const data = await followsService.getCounts(req.params.userId);
  sendSuccess(res, data, 'Counts retrieved');
}
