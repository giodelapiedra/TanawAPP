import apiClient from './client';
import { User } from '../types/user.types';
import type { RegisterResidentDto } from '../schemas/auth.schema';

interface LoginDto {
  identifier: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function registerResident(dto: RegisterResidentDto): Promise<User> {
  const res = await apiClient.post('/auth/register/resident', dto);
  return res.data.data;
}

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const res = await apiClient.post('/auth/login', dto);
  return res.data.data;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const res = await apiClient.post('/auth/refresh', { refreshToken });
  return res.data.data;
}
