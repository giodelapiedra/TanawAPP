import apiClient from './client';
import { User } from '../types/user.types';

interface RegisterResidentDto {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  barangayCode: string;
  street?: string;
  houseNo?: string;
}

interface RegisterBarangayDto extends RegisterResidentDto {
  position: string;
}

interface RegisterEmployeeDto extends RegisterResidentDto {
  employeeCode: string;
  department: string;
  position: string;
}

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

export async function registerBarangay(dto: RegisterBarangayDto): Promise<User> {
  const res = await apiClient.post('/auth/register/barangay', dto);
  return res.data.data;
}

export async function registerEmployee(dto: RegisterEmployeeDto): Promise<User> {
  const res = await apiClient.post('/auth/register/employee', dto);
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
