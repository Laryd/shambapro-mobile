import apiClient from './client';
import { Transaction } from '@/types';

export async function getTransactions(params?: {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Transaction[]> {
  const { data } = await apiClient.get('/api/transactions', { params });
  return data.data;
}
