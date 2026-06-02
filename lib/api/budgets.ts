import apiClient from './client';
import { Budget } from '@/types';

export interface CreateBudgetPayload {
  plotId: string;
  season: string;
  items: Array<{ category: string; budgetedAmount: number; notes?: string }>;
  notes?: string;
}

export interface UpdateBudgetPayload {
  season?: string;
  items?: Array<{ category: string; budgetedAmount: number; notes?: string }>;
  notes?: string;
}

export async function getBudgets(plotId?: string): Promise<Budget[]> {
  const params = plotId ? { plotId } : {};
  const { data } = await apiClient.get('/api/budgets', { params });
  return data.data;
}

export async function createBudget(payload: CreateBudgetPayload): Promise<Budget> {
  const { data } = await apiClient.post('/api/budgets', payload);
  return data.data;
}

export async function updateBudget(id: string, payload: UpdateBudgetPayload): Promise<Budget> {
  const { data } = await apiClient.patch(`/api/budgets/${id}`, payload);
  return data.data;
}

export async function deleteBudget(id: string): Promise<void> {
  await apiClient.delete(`/api/budgets/${id}`);
}
