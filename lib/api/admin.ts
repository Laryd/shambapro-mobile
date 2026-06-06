import apiClient from './client';

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  subscription: {
    plan: string;
    status: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
    exemptUntil?: string;
  };
  createdAt: string;
}

export interface AdminSettings {
  paymentsDisabled: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data } = await apiClient.get('/api/admin/settings');
  return data.data;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get('/api/admin/users');
  return data.data;
}

export async function updateAdminSettings(
  settings: Partial<AdminSettings>
): Promise<void> {
  await apiClient.patch('/api/admin/settings', settings);
}

export async function setUserExemption(
  userId: string,
  exemptUntil: string | null
): Promise<void> {
  await apiClient.patch(`/api/admin/users/${userId}/exemption`, { exemptUntil });
}
