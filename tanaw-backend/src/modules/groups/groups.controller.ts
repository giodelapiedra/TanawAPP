import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response.util';
import { ListQueryDto } from './groups.schema';
import * as groupsService from './groups.service';

type CodeReq = Request<{ code: string }>;
type PostReq = Request<{ postId: string }>;
type CommentReq = Request<{ commentId: string }>;

export async function getMyGroup(req: Request, res: Response) {
  const data = await groupsService.getMyGroup(req.user!.userId);
  sendSuccess(res, data, 'Group retrieved');
}

export async function listPosts(req: CodeReq, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await groupsService.listPosts(req.user!.userId, req.params.code, query);
  sendSuccess(res, data, 'Posts retrieved');
}

export async function createPost(req: CodeReq, res: Response) {
  const data = await groupsService.createPost(req.user!.userId, req.params.code, req.body);
  sendSuccess(res, data, 'Post created', 201);
}

export async function getPostById(req: PostReq, res: Response) {
  const data = await groupsService.getPostById(req.user!.userId, req.params.postId);
  sendSuccess(res, data, 'Post retrieved');
}

export async function updatePost(req: PostReq, res: Response) {
  const data = await groupsService.updatePost(req.user!.userId, req.params.postId, req.body);
  sendSuccess(res, data, 'Post updated');
}

export async function deletePost(req: PostReq, res: Response) {
  const data = await groupsService.deletePost(req.user!.userId, req.params.postId);
  sendSuccess(res, data, 'Post deleted');
}

export async function toggleLike(req: PostReq, res: Response) {
  const data = await groupsService.toggleLike(req.user!.userId, req.params.postId);
  sendSuccess(res, data, 'Like toggled');
}

export async function listComments(req: PostReq, res: Response) {
  const query = req.query as unknown as ListQueryDto;
  const data = await groupsService.listComments(req.user!.userId, req.params.postId, query);
  sendSuccess(res, data, 'Comments retrieved');
}

export async function createComment(req: PostReq, res: Response) {
  const data = await groupsService.createComment(req.user!.userId, req.params.postId, req.body);
  sendSuccess(res, data, 'Comment created', 201);
}

export async function deleteComment(req: CommentReq, res: Response) {
  const data = await groupsService.deleteComment(req.user!.userId, req.params.commentId);
  sendSuccess(res, data, 'Comment deleted');
}
