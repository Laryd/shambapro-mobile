import apiClient from './client';
import { SubscriptionState } from '@/types';

export async function getSubscription(): Promise<SubscriptionState> {
  const { data } = await apiClient.get('/api/subscription');
  return data.data;
}

export async function initiateMpesaPayment(payload: {
  phone: string;
  plan: 'monthly' | 'yearly';
}): Promise<{ checkoutRequestId: string }> {
  const { data } = await apiClient.post('/api/mpesa/stk-push', payload);
  return data.data;
}

export async function checkPaymentStatus(
  checkoutRequestId: string
): Promise<SubscriptionState> {
  const { data } = await apiClient.post('/api/subscription', { checkoutRequestId });
  return data.data;
}
