import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import KpiCard from '@/components/ui/KpiCard';
import TransactionItem from '@/components/finances/TransactionItem';
import AppModal from '@/components/ui/AppModal';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import { getTransactions } from '@/lib/api/transactions';
import { createExpense } from '@/lib/api/expenses';
import { getPlots } from '@/lib/api/plots';
import { formatCurrency } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';

export default function FinancesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [expenseModal, setExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const { data: transactions, refetch, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactions(),
  });

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: getPlots,
  });

  const totalIncome = (transactions ?? [])
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = (transactions ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const filtered = (transactions ?? []).filter((t) =>
    filter === 'all' ? true : t.type === filter
  );

  async function handleAddExpense(data: Parameters<typeof createExpense>[0]) {
    setSubmitting(true);
    try {
      await createExpense(data);
      setExpenseModal(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('finances.title')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setExpenseModal(true)}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.kpiRow}>
          <KpiCard
            title={t('finances.income')}
            value={formatCurrency(totalIncome)}
            icon="arrow-down-circle-outline"
            iconColor={Colors.primary}
            style={{ flex: 1 }}
          />
          <KpiCard
            title={t('finances.expenses')}
            value={formatCurrency(totalExpenses)}
            icon="arrow-up-circle-outline"
            iconColor={Colors.danger}
            iconBg={Colors.dangerLight}
            style={{ flex: 1 }}
          />
        </View>

        <KpiCard
          title={t('finances.netProfit')}
          value={formatCurrency(netProfit)}
          icon="trending-up-outline"
          iconColor={netProfit >= 0 ? Colors.primary : Colors.danger}
          iconBg={netProfit >= 0 ? Colors.primaryLight : Colors.dangerLight}
          style={styles.netCard}
        />

        <View style={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterActiveText]}>
                {f === 'all'
                  ? t('common.all')
                  : f === 'income'
                  ? t('finances.income_type')
                  : t('finances.expense_type')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(t) => t._id}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListHeaderComponent={
            <SectionHeader title={t('finances.transactions')} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="bar-chart-outline"
              message={t('finances.noTransactions')}
            />
          }
        />
      </View>

      <AppModal
        visible={expenseModal}
        onClose={() => setExpenseModal(false)}
        title={t('expenses.addExpense')}
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          plots={plots ?? []}
          loading={submitting}
        />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  netCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.md },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  filterActiveText: { color: Colors.primary },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
});
