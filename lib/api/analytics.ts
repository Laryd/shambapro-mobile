import apiClient from './client';
import { Analytics } from '@/types';

export async function getAnalytics(): Promise<Analytics> {
  const { data } = await apiClient.get('/api/analytics');
  return data.data;
}
