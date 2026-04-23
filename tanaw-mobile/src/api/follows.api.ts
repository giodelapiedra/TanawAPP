import apiClient from './client';
import { Paginated, UserCard } from '../types/post.types';

export async function follow(userId: string): Promise<{ following: boolean; alreadyFollowing: boolean }> {
  const res = await apiClient.post(`/follows/${userId}`);
  return res.data.data;
}

export async function unfollow(userId: string): Promise<{ following: boolean; removed: boolean }> {
  const res = await apiClient.delete(`/follows/${userId}`);
  return res.data.data;
}

export async function myFollowing(
  params: { cursor?: string; limit?: number } = {}
): Promise<Paginated<UserCard>> {
  const res = await apiClient.get('/follows/me/following', { params });
  return res.data.data;
}

export async function myFollowers(
  params: { cursor?: string; limit?: number } = {}
): Promise<Paginated<UserCard>> {
  const res = await apiClient.get('/follows/me/followers', { params });
  return res.data.data;
}

export async function getCounts(userId: string): Promise<{ followers: number; following: number }> {
  const res = await apiClient.get(`/follows/users/${userId}/counts`);
  return res.data.data;
}
