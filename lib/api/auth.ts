import apiClient from './client';
import { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post('/api/mobile/auth/login', payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post('/api/mobile/auth/register', payload);
  return data.data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get('/api/mobile/auth/me');
  return data.data;
}

export async function googleAuth(accessToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/api/mobile/auth/google', { accessToken });
  return data.data;
}

export async function updateLanguage(language: 'en' | 'sw'): Promise<void> {
  await apiClient.patch('/api/user/language', { language });
}
