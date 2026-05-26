import apiClient from './client';
import { Expense } from '@/types';

export interface CreateExpensePayload {
  category: string;
  description: string;
  amount: number;
  plotId?: string;
  quantity?: number;
  unit?: string;
  date: string;
  notes?: string;
}

export async function getExpenses(plotId?: string): Promise<Expense[]> {
  const params = plotId ? { plotId } : {};
  const { data } = await apiClient.get('/api/expenses', { params });
  return data.data;
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const { data } = await apiClient.post('/api/expenses', payload);
  return data.data;
}

export async function updateExpense(
  id: string,
  payload: Partial<CreateExpensePayload>
): Promise<Expense> {
  const { data } = await apiClient.patch(`/api/expenses/${id}`, payload);
  return data.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/api/expenses/${id}`);
}
