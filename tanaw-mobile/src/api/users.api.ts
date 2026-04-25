import apiClient from './client';
import { User, DigitalIdData } from '../types/user.types';
import { PublicUserProfile } from '../types/public-profile.types';
import { PickedImage, toFormDataFile } from '../utils/imagePicker.util';

interface UpdateProfileDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  street?: string;
  houseNo?: string;
}

export async function getProfile(): Promise<User> {
  const res = await apiClient.get('/users/me');
  return res.data.data;
}

export async function updateProfile(dto: UpdateProfileDto): Promise<User> {
  const res = await apiClient.patch('/users/me', dto);
  return res.data.data;
}

export async function updateProfilePhoto(image: PickedImage): Promise<User> {
  const form = new FormData();
  form.append('photo', toFormDataFile(image) as unknown as Blob);
  const res = await apiClient.post('/users/me/profile-photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
    timeout: 60000,
  });
  return res.data.data;
}

export async function getDigitalIdData(): Promise<DigitalIdData> {
  const res = await apiClient.get('/users/me/digital-id');
  return res.data.data;
}

export async function acceptCommunityRules(): Promise<User> {
  const res = await apiClient.post('/users/me/accept-community-rules');
  return res.data.data;
}

export async function registerDeviceToken(
  token: string,
  platform: 'ios' | 'android'
): Promise<{ registered: boolean }> {
  const res = await apiClient.post('/users/device-token', { token, platform });
  return res.data.data;
}

export async function getPublicProfile(userId: string): Promise<PublicUserProfile> {
  const res = await apiClient.get(`/users/${userId}/public-profile`);
  return res.data.data;
}
