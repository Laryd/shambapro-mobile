import apiClient from './client';
import { AnimalHerd, Vaccination, AnimalProduction, AnimalHealth, Expense } from '@/types';

export interface CreateHerdPayload {
  name: string;
  animalType: string;
  breed: string;
  purpose: string;
  initialCount: number;
  acquisitionDate: string;
  acquisitionCost?: number;
  housingType?: string;
  location?: string;
  notes?: string;
}

export interface UpdateHerdPayload {
  name?: string;
  breed?: string;
  purpose?: string;
  currentCount?: number;
  housingType?: string;
  location?: string;
  status?: 'active' | 'sold' | 'archived';
  notes?: string;
}

export interface HerdDetail {
  herd: AnimalHerd;
  expenses: Expense[];
  productions: AnimalProduction[];
  vaccinations: Vaccination[];
  healthEvents: AnimalHealth[];
  summary: { totalExpenses: number; totalRevenue: number; profit: number };
}

export interface CreateVaccinationPayload {
  herdId: string;
  vaccineName: string;
  vaccineType?: string;
  dateAdministered: string;
  nextDueDate?: string;
  dosage?: string;
  administrator?: string;
  batchNumber?: string;
  animalsVaccinated?: number;
  cost?: number;
  notes?: string;
}

export interface CreateProductionPayload {
  herdId: string;
  productionType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  date?: string;
  buyer?: string;
  notes?: string;
}

export interface CreateHealthEventPayload {
  herdId: string;
  eventType: string;
  date?: string;
  description: string;
  affectedCount?: number;
  countChange?: number;
  cost?: number;
  veterinarian?: string;
  notes?: string;
}

export interface CreateAnimalExpensePayload {
  herdId: string;
  category: string;
  description: string;
  amount: number;
  quantity?: number;
  unit?: string;
  date?: string;
  notes?: string;
}

// Herds
export async function getHerds(params?: { status?: string; animalType?: string }): Promise<AnimalHerd[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.animalType) qs.set('animalType', params.animalType);
  const q = qs.toString();
  const { data } = await apiClient.get(`/api/herds${q ? `?${q}` : ''}`);
  return data.data;
}

export async function getHerd(id: string): Promise<HerdDetail> {
  const { data } = await apiClient.get(`/api/herds/${id}`);
  return data.data;
}

export async function createHerd(payload: CreateHerdPayload): Promise<AnimalHerd> {
  const { data } = await apiClient.post('/api/herds', payload);
  return data.data;
}

export async function updateHerd(id: string, payload: UpdateHerdPayload): Promise<AnimalHerd> {
  const { data } = await apiClient.patch(`/api/herds/${id}`, payload);
  return data.data;
}

export async function deleteHerd(id: string): Promise<void> {
  await apiClient.delete(`/api/herds/${id}`);
}

// Vaccinations
export async function getVaccinations(params?: { herdId?: string; upcoming?: boolean }): Promise<Vaccination[]> {
  const qs = new URLSearchParams();
  if (params?.herdId) qs.set('herdId', params.herdId);
  if (params?.upcoming) qs.set('upcoming', 'true');
  const q = qs.toString();
  const { data } = await apiClient.get(`/api/vaccinations${q ? `?${q}` : ''}`);
  return data.data;
}

export async function createVaccination(payload: CreateVaccinationPayload): Promise<Vaccination> {
  const { data } = await apiClient.post('/api/vaccinations', payload);
  return data.data;
}

export async function deleteVaccination(id: string): Promise<void> {
  await apiClient.delete(`/api/vaccinations/${id}`);
}

// Production
export async function getAnimalProductions(herdId?: string): Promise<AnimalProduction[]> {
  const q = herdId ? `?herdId=${herdId}` : '';
  const { data } = await apiClient.get(`/api/animal-production${q}`);
  return data.data;
}

export async function createAnimalProduction(payload: CreateProductionPayload): Promise<AnimalProduction> {
  const { data } = await apiClient.post('/api/animal-production', payload);
  return data.data;
}

export async function deleteAnimalProduction(id: string): Promise<void> {
  await apiClient.delete(`/api/animal-production/${id}`);
}

// Health events
export async function getAnimalHealth(herdId?: string): Promise<AnimalHealth[]> {
  const q = herdId ? `?herdId=${herdId}` : '';
  const { data } = await apiClient.get(`/api/animal-health${q}`);
  return data.data;
}

export async function createHealthEvent(payload: CreateHealthEventPayload): Promise<AnimalHealth> {
  const { data } = await apiClient.post('/api/animal-health', payload);
  return data.data;
}

export async function deleteHealthEvent(id: string): Promise<void> {
  await apiClient.delete(`/api/animal-health/${id}`);
}

// Animal expenses (reuses existing /api/expenses with herdId)
export async function createAnimalExpense(payload: CreateAnimalExpensePayload): Promise<Expense> {
  const { data } = await apiClient.post('/api/expenses', payload);
  return data.data;
}

export async function getAnimalExpenses(herdId: string): Promise<Expense[]> {
  const { data } = await apiClient.get(`/api/expenses?herdId=${herdId}`);
  return data.data;
}
