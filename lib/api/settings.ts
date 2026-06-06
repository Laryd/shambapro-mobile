import apiClient from './client';

export interface PublicSettings {
  paymentsDisabled: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
}

/**
 * Public, unauthenticated read of the global payments toggle and plan prices.
 * Used by pricing and auth screens to render billing content correctly.
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  const { data } = await apiClient.get('/api/settings/public');
  return {
    paymentsDisabled: Boolean(data.paymentsDisabled),
    monthlyPrice: Number(data.monthlyPrice) || 120,
    yearlyPrice: Number(data.yearlyPrice) || 1200,
  };
}
