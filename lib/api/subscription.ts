import apiClient from './client';
import { SubscriptionState } from '@/types';

export async function getSubscription(): Promise<SubscriptionState> {
  const { data } = await apiClient.get('/api/subscription');
  return data.data;
}

export async function initiateMpesaPayment(payload: {
  phone: string;
  plan: 'monthly' | 'yearly';
}): Promise<{ invoiceId: string; customerMessage?: string }> {
  const { data } = await apiClient.post('/api/payment/stk-push', payload);
  return data;
}

export async function checkPaymentStatus(
  invoiceId: string
): Promise<SubscriptionState> {
  const { data } = await apiClient.post('/api/subscription', { invoiceId });
  return data.data;
}
