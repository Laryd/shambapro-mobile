import apiClient from './client';
import { Plot } from '@/types';

export interface CreatePlotPayload {
  name: string;
  location?: string;
  area: number;
  areaUnit: 'acres' | 'hectares';
  variety: string;
  plantingDate: string;
  expectedHarvestDate?: string;
  landLeaseAmount?: number;
  ratoonCycle?: number;
  seasonBudget?: number;
  notes?: string;
  plotCode?: string;
}

export async function getPlots(): Promise<Plot[]> {
  const { data } = await apiClient.get('/api/plots');
  return data.data;
}

export async function getPlot(id: string): Promise<Plot> {
  const { data } = await apiClient.get(`/api/plots/${id}`);
  return data.data;
}

export async function createPlot(payload: CreatePlotPayload): Promise<Plot> {
  const { data } = await apiClient.post('/api/plots', payload);
  return data.data;
}

export async function updatePlot(
  id: string,
  payload: Partial<CreatePlotPayload>
): Promise<Plot> {
  const { data } = await apiClient.patch(`/api/plots/${id}`, payload);
  return data.data;
}

export async function deletePlot(id: string): Promise<void> {
  await apiClient.delete(`/api/plots/${id}`);
}
