import apiClient from './client';
import { Loan, Repayment } from '@/types';

export interface CreateLoanPayload {
  type: string;
  lender: string;
  principalAmount: number;
  interestRate?: number;
  disbursementDate: string;
  dueDate?: string;
  plotId?: string;
  notes?: string;
}

export async function getLoans(): Promise<Loan[]> {
  const { data } = await apiClient.get('/api/loans');
  return data.data;
}

export async function createLoan(payload: CreateLoanPayload): Promise<Loan> {
  const { data } = await apiClient.post('/api/loans', payload);
  return data.data;
}

export async function addRepayment(
  id: string,
  repayment: Omit<Repayment, '_id'>
): Promise<Loan> {
  const { data } = await apiClient.patch(`/api/loans/${id}`, { repayment });
  return data.data;
}

export async function deleteLoan(id: string): Promise<void> {
  await apiClient.delete(`/api/loans/${id}`);
}
