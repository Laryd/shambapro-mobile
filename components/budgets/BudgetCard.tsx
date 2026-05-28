import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppCard from '@/components/ui/AppCard';
import { Colors, Spacing } from '@/constants/colors';
import { Budget } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Props {
  budget: Budget;
}

function varianceColor(variance: number): string {
  if (variance <= 0) return Colors.primary;
  if (variance < 0.1) return Colors.warning;
  return Colors.danger;
}

export default function BudgetCard({ budget }: Props) {
  const { t } = useTranslation();

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.plotName}>{budget.plot?.name ?? 'Unknown Plot'}</Text>
        <Text style={styles.season}>{budget.season}</Text>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>{t('budgets.budgeted')}</Text>
          <Text style={styles.totalValue}>{formatCurrency(budget.totalBudget)}</Text>
        </View>
        {budget.totalActual !== undefined ? (
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>{t('budgets.actual')}</Text>
            <Text style={[styles.totalValue, {
              color: budget.totalActual > budget.totalBudget ? Colors.danger : Colors.primary,
            }]}>
              {formatCurrency(budget.totalActual)}
            </Text>
          </View>
        ) : null}
        {budget.totalActual !== undefined ? (
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>{t('budgets.variance', { defaultValue: 'Variance' })}</Text>
            <Text style={[styles.totalValue, {
              color: budget.totalActual > budget.totalBudget ? Colors.danger : Colors.primary,
            }]}>
              {budget.totalActual > budget.totalBudget ? '+' : ''}
              {formatCurrency(budget.totalActual - budget.totalBudget)}
            </Text>
          </View>
        ) : null}
      </View>

      {budget.items.map((item, i) => {
        const actual = item.actualAmount ?? 0;
        const variance = item.budgetedAmount > 0
          ? (actual - item.budgetedAmount) / item.budgetedAmount
          : 0;
        const pct = item.budgetedAmount > 0
          ? Math.min((actual / item.budgetedAmount) * 100, 100)
          : 0;

        const variantAmt = actual - item.budgetedAmount;

        return (
          <View key={i} style={styles.item}>
            <View style={styles.itemRow}>
              <Text style={styles.category} numberOfLines={1}>
                {t(`cat.${item.category}`, { defaultValue: item.category })}
              </Text>
              <View style={styles.itemAmounts}>
                <Text style={styles.amtBudgeted}>{formatCurrency(item.budgetedAmount)}</Text>
                {actual > 0 ? (
                  <>
                    <Text style={[styles.amtActual, { color: varianceColor(variance) }]}>
                      {formatCurrency(actual)}
                    </Text>
                    <Text style={[styles.amtVariance, { color: varianceColor(variance) }]}>
                      {variantAmt > 0 ? '+' : ''}{formatCurrency(variantAmt)}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${pct}%`, backgroundColor: varianceColor(variance) },
                ]}
              />
            </View>
          </View>
        );
      })}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  plotName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  season: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    fontWeight: '500',
  },
  totals: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  totalItem: {},
  totalLabel: { fontSize: 11, color: Colors.textMuted },
  totalValue: { fontSize: 14, fontWeight: '700', color: Colors.text },
  item: { marginBottom: Spacing.sm },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: Spacing.sm,
  },
  category: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  itemAmounts: { alignItems: 'flex-end', gap: 1 },
  amtBudgeted: { fontSize: 11, color: Colors.textMuted },
  amtActual: { fontSize: 12, fontWeight: '600' },
  amtVariance: { fontSize: 11, fontWeight: '500' },
  progressBar: {
    height: 5,
    backgroundColor: Colors.gray100,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99 },
});
