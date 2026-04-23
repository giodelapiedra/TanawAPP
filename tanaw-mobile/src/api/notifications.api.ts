import apiClient from './client';
import { Notification } from '../types/notification.types';
import { Paginated } from '../types/post.types';

export async function listNotifications(
  params: { cursor?: string; limit?: number } = {}
): Promise<Paginated<Notification>> {
  const res = await apiClient.get('/notifications', { params });
  return res.data.data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const res = await apiClient.get('/notifications/unread-count');
  return res.data.data;
}

export async function markAsRead(id: string): Promise<{ updated: boolean }> {
  const res = await apiClient.post(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllAsRead(): Promise<{ updated: number }> {
  const res = await apiClient.post('/notifications/read-all');
  return res.data.data;
}
