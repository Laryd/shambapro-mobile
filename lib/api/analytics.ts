import apiClient from './client';
import { Analytics } from '@/types';

export async function getAnalytics(): Promise<Analytics> {
  const { data } = await apiClient.get('/api/analytics');
  const d = data.data;

  // The API returns { summary, plotStats, categoryTotals (object), monthlyTrend }
  // Transform to the Analytics interface shape the screens expect
  const summary = d.summary ?? {};
  const plotStats: any[] = d.plotStats ?? [];

  const categoryTotals = Object.entries(d.categoryTotals ?? {}).map(
    ([category, amount]) => ({ category, amount: amount as number })
  );

  return {
    farm: {
      totalExpenses:    Number(summary.totalExpenses ?? 0),
      grossRevenue:     Number(summary.totalGross ?? 0),
      totalDeductions:  Number(summary.totalDeductions ?? 0),
      netRevenue:       Number(summary.netRevenue ?? 0),
      profit:           Number(summary.profit ?? 0),
      profitMargin:     Number(summary.profitMargin ?? 0),
      costPerAcre:      Number(summary.costPerAcre ?? 0),
      revenuePerAcre:   plotStats.length > 0
        ? plotStats.reduce((s, p) => s + Number(p.revenuePerAcre ?? 0), 0) / plotStats.length
        : 0,
      costPerTon:       Number(summary.costPerTon ?? 0),
      totalHarvestTons: Number(summary.totalTons ?? 0),
      totalArea:        Number(summary.totalAreaAcres ?? 0),
    },
    plots: plotStats.map((p) => ({
      plotId:          p.plotId,
      plotName:        p.plotName,
      plotCode:        p.plotCode,
      area:            Number(p.area ?? 0),
      areaUnit:        p.areaUnit ?? 'acres',
      totalExpenses:   Number(p.totalExpenses ?? 0),
      grossRevenue:    Number(p.totalGross ?? 0),
      totalDeductions: Number(p.totalDeductions ?? 0),
      netRevenue:      Number(p.netRevenue ?? 0),
      profit:          Number(p.profit ?? 0),
      profitMargin:    Number(p.profitMargin ?? 0),
      costPerAcre:     Number(p.costPerAcre ?? 0),
      costPerTon:      Number(p.costPerTon ?? 0),
      totalHarvestTons: Number(p.totalTons ?? p.totalHarvestTons ?? 0),
      harvestCount:    Number(p.harvestCount ?? 0),
    })),
    categoryTotals,
    monthlyTrend: (d.monthlyTrend ?? []).map((m: any) => ({
      month:    m.month,
      income:   Number(m.income ?? 0),
      expenses: Number(m.expenses ?? 0),
      profit:   Number(m.profit ?? 0),
    })),
    loansSummary: {
      totalOutstanding: Number(summary.totalLoansOutstanding ?? 0),
      activeCount:      Number(summary.activeLoansCount ?? 0),
      overdueCount:     0,
    },
  };
}
