import apiClient from './client';
import { Paginated, Post, UserCard } from '../types/post.types';
import { PickedImage, toFormDataFile } from '../utils/imagePicker.util';

export async function listMyFeed(
  params: { cursor?: string; limit?: number } = {}
): Promise<Paginated<Post>> {
  const res = await apiClient.get('/feed', { params });
  return res.data.data;
}

export async function createPublicPost(content: string, images: PickedImage[] = []): Promise<Post> {
  const form = new FormData();
  form.append('content', content);
  for (const img of images) {
    form.append('images', toFormDataFile(img) as unknown as Blob);
  }
  const res = await apiClient.post('/feed/posts', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });
  return res.data.data;
}

export async function discoverUsers(
  params: { q?: string; cursor?: string; limit?: number } = {}
): Promise<Paginated<UserCard>> {
  const res = await apiClient.get('/feed/discover/users', { params });
  return res.data.data;
}
