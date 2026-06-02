import apiClient from './client';
import { Harvest, MillDeduction } from '@/types';

export interface CreateHarvestPayload {
  plotId: string;
  quantity: number;
  quantityUnit: string;
  pricePerUnit: number;
  millDeductions: MillDeduction[];
  date: string;
  buyer?: string;
  millStatementRef?: string;
  ratoonCycle?: number;
  notes?: string;
}

export async function getHarvests(plotId?: string): Promise<Harvest[]> {
  const params = plotId ? { plotId } : {};
  const { data } = await apiClient.get('/api/harvests', { params });
  return data.data;
}

export async function createHarvest(payload: CreateHarvestPayload): Promise<Harvest> {
  const { data } = await apiClient.post('/api/harvests', payload);
  return data.data;
}

export async function updateHarvest(
  id: string,
  payload: Partial<CreateHarvestPayload>
): Promise<Harvest> {
  const { data } = await apiClient.patch(`/api/harvests/${id}`, payload);
  return data.data;
}

export async function deleteHarvest(id: string): Promise<void> {
  await apiClient.delete(`/api/harvests/${id}`);
}
