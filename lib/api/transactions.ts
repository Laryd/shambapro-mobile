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

export async function updateTransaction(
  id: string,
  payload: { description?: string; category?: string; amount?: number; date?: string }
): Promise<Transaction> {
  const { data } = await apiClient.patch(`/api/transactions/${id}`, payload);
  return data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/api/transactions/${id}`);
}
