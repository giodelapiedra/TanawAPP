import apiClient from './client';
import {
  Comment,
  MyGroup,
  Paginated,
  Post,
  ToggleLikeResult,
} from '../types/post.types';

export async function getMyGroup(): Promise<MyGroup> {
  const res = await apiClient.get('/groups/mine');
  return res.data.data;
}

export async function listPosts(
  code: string,
  params: { cursor?: string; limit?: number } = {}
): Promise<Paginated<Post>> {
  const res = await apiClient.get(`/groups/${code}/posts`, { params });
  return res.data.data;
}

export async function getPostById(postId: string): Promise<Post> {
  const res = await apiClient.get(`/groups/posts/${postId}`);
  return res.data.data;
}

export async function createPost(code: string, content: string): Promise<Post> {
  const res = await apiClient.post(`/groups/${code}/posts`, { content });
  return res.data.data;
}

export async function updatePost(postId: string, content: string): Promise<Post> {
  const res = await apiClient.patch(`/groups/posts/${postId}`, { content });
  return res.data.data;
}

export async function deletePost(postId: string): Promise<{ deleted: boolean }> {
  const res = await apiClient.delete(`/groups/posts/${postId}`);
  return res.data.data;
}

export async function toggleLike(postId: string): Promise<ToggleLikeResult> {
  const res = await apiClient.post(`/groups/posts/${postId}/like`);
  return res.data.data;
}

export async function listComments(
  postId: string,
  params: { cursor?: string; limit?: number } = {}
): Promise<Paginated<Comment>> {
  const res = await apiClient.get(`/groups/posts/${postId}/comments`, { params });
  return res.data.data;
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  const res = await apiClient.post(`/groups/posts/${postId}/comments`, { content });
  return res.data.data;
}

export async function deleteComment(commentId: string): Promise<{ deleted: boolean }> {
  const res = await apiClient.delete(`/groups/comments/${commentId}`);
  return res.data.data;
}
