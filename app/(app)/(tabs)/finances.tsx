import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import KpiCard from '@/components/ui/KpiCard';
import TransactionItem from '@/components/finances/TransactionItem';
import AppModal from '@/components/ui/AppModal';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import ReportButton from '@/components/reports/ReportButton';
import { getTransactions, updateTransaction, deleteTransaction } from '@/lib/api/transactions';
import { createExpense } from '@/lib/api/expenses';
import { getPlots } from '@/lib/api/plots';
import { formatCurrency } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { Transaction } from '@/types';
import { EXPENSE_CATEGORIES } from '@/constants/categories';

export default function FinancesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [expenseModal, setExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setEditDesc(tx.description);
    setEditAmount(String(tx.amount));
    setEditDate(tx.date.slice(0, 10));
    setEditCategory(tx.category);
  }

  async function handleSaveEdit() {
    if (!editingTx) return;
    setSubmitting(true);
    try {
      await updateTransaction(editingTx._id, {
        description: editDesc,
        amount: Number(editAmount),
        date: editDate,
        category: editCategory,
      });
      setEditingTx(null);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('finances.title')}</Text>
          <View style={styles.headerActions}>
            <ReportButton type="backup" />
            <ReportButton />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setExpenseModal(true)}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
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
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
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

      <AppModal
        visible={!!editingTx}
        onClose={() => setEditingTx(null)}
        title={t('finances.editEntry', { defaultValue: 'Edit Entry' })}
      >
        <View>
          <AppInput
            label={t('expenses.description')}
            value={editDesc}
            onChangeText={setEditDesc}
            placeholder="Description"
          />
          <AppInput
            label={t('expenses.amount')}
            value={editAmount}
            onChangeText={setEditAmount}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <AppInput
            label={t('expenses.date')}
            value={editDate}
            onChangeText={setEditDate}
            placeholder="yyyy-mm-dd"
          />
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{t('expenses.category')}</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowCategoryPicker((v) => !v)}
            >
              <Text style={styles.selectorText}>
                {t(`cat.${editCategory}`, { defaultValue: editCategory.replace(/_/g, ' ') })}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            {showCategoryPicker ? (
              <View style={styles.pickerList}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pickerItem, cat === editCategory && styles.pickerItemActive]}
                      onPress={() => { setEditCategory(cat); setShowCategoryPicker(false); }}
                    >
                      <Text style={[styles.pickerItemText, cat === editCategory && styles.pickerItemActiveText]}>
                        {t(`cat.${cat}`, { defaultValue: cat })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
          <AppButton
            title={submitting ? t('common.saving', { defaultValue: 'Saving…' }) : t('common.save', { defaultValue: 'Save Changes' })}
            onPress={handleSaveEdit}
            loading={submitting}
            fullWidth
          />
        </View>
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
  field: { marginBottom: Spacing.md },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
  },
  selectorText: { fontSize: 15, color: Colors.text },
  pickerList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  pickerItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerItemActive: { backgroundColor: Colors.primaryLight },
  pickerItemText: { fontSize: 14, color: Colors.text },
  pickerItemActiveText: { color: Colors.primaryDark, fontWeight: '600' },
});
