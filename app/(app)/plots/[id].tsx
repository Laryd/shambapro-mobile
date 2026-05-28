import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppCard from '@/components/ui/AppCard';
import AppBadge from '@/components/ui/AppBadge';
import AppModal from '@/components/ui/AppModal';
import ExpenseItem from '@/components/expenses/ExpenseItem';
import HarvestItem from '@/components/harvests/HarvestItem';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import HarvestForm from '@/components/harvests/HarvestForm';
import PlotForm from '@/components/plots/PlotForm';
import ReportButton from '@/components/reports/ReportButton';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getPlot, updatePlot, deletePlot } from '@/lib/api/plots';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '@/lib/api/expenses';
import { getHarvests, createHarvest, deleteHarvest } from '@/lib/api/harvests';
import { formatCurrency, formatDate, getRatoonLabel, getProfitColor } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { Expense } from '@/types';

export default function PlotDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'expenses' | 'harvests'>('expenses');
  const [expenseModal, setExpenseModal] = useState(false);
  const [harvestModal, setHarvestModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: plot, isLoading: plotLoading, refetch: refetchPlot } = useQuery({
    queryKey: ['plot', id],
    queryFn: () => getPlot(id!),
    enabled: !!id,
  });

  const { data: expenses, refetch: refetchExpenses } = useQuery({
    queryKey: ['expenses', id],
    queryFn: () => getExpenses(id!),
    enabled: !!id,
  });

  const { data: harvests, refetch: refetchHarvests } = useQuery({
    queryKey: ['harvests', id],
    queryFn: () => getHarvests(id!),
    enabled: !!id,
  });

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchPlot(), refetchExpenses(), refetchHarvests()]);
    setRefreshing(false);
  }

  if (plotLoading || !plot) return <LoadingScreen />;

  const totalExpenses = (expenses ?? []).reduce((s, e) => s + e.amount, 0);
  const totalRevenue = (harvests ?? []).reduce((s, h) => s + h.netReceived, 0);
  const profit = totalRevenue - totalExpenses;

  async function handleAddExpense(data: Parameters<typeof createExpense>[0]) {
    setSubmitting(true);
    try {
      await createExpense({ ...data, plotId: id! });
      setExpenseModal(false);
      refetchExpenses();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditExpense(data: Parameters<typeof createExpense>[0]) {
    if (!editingExpense) return;
    setSubmitting(true);
    try {
      await updateExpense(editingExpense._id, data);
      setEditingExpense(null);
      refetchExpenses();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddHarvest(data: Parameters<typeof createHarvest>[0]) {
    setSubmitting(true);
    try {
      await createHarvest(data);
      setHarvestModal(false);
      refetchHarvests();
      refetchPlot();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditPlot(data: Parameters<typeof updatePlot>[1]) {
    setSubmitting(true);
    try {
      await updatePlot(id!, data);
      setEditModal(false);
      refetchPlot();
      queryClient.invalidateQueries({ queryKey: ['plots'] });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePlot() {
    Alert.alert(t('plots.deletePlot'), t('plots.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlot(id!);
            queryClient.invalidateQueries({ queryKey: ['plots'] });
            router.back();
          } catch (err: unknown) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{plot.name}</Text>
          <View style={styles.headerActions}>
            <ReportButton plotId={id} />
            <TouchableOpacity onPress={() => setEditModal(true)} style={styles.actionIconBtn}>
              <Ionicons name="pencil-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePlot} style={styles.actionIconBtn}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <AppCard style={styles.plotInfo}>
            <View style={styles.plotTitleRow}>
              <View>
                <Text style={styles.plotName}>{plot.name}</Text>
                <Text style={styles.plotCode}>{plot.plotCode}</Text>
              </View>
              <AppBadge
                label={plot.status}
                variant={plot.status === 'active' ? 'success' : plot.status === 'harvested' ? 'info' : 'default'}
              />
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Ionicons name="leaf-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaLabel}>Variety</Text>
                <Text style={styles.metaValue}>{plot.variety}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="resize-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaLabel}>Area</Text>
                <Text style={styles.metaValue}>{plot.area} {plot.areaUnit}</Text>
              </View>
              {plot.location ? (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaLabel}>Location</Text>
                  <Text style={styles.metaValue}>{plot.location}</Text>
                </View>
              ) : null}
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaLabel}>Planted</Text>
                <Text style={styles.metaValue}>{formatDate(plot.plantingDate)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="reload-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.metaLabel}>Cycle</Text>
                <Text style={styles.metaValue}>{getRatoonLabel(plot.ratoonCycle)}</Text>
              </View>
              {plot.expectedHarvestDate ? (
                <View style={styles.metaItem}>
                  <Ionicons name="cut-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.metaLabel}>Est. Harvest</Text>
                  <Text style={styles.metaValue}>{formatDate(plot.expectedHarvestDate)}</Text>
                </View>
              ) : null}
            </View>
          </AppCard>

          <AppCard style={styles.financialCard}>
            <Text style={styles.sectionLabel}>{t('plots.financialSummary')}</Text>
            <View style={styles.financialRow}>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>{t('plots.expenses')}</Text>
                <Text style={[styles.finValue, { color: Colors.danger }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>Revenue</Text>
                <Text style={[styles.finValue, { color: Colors.primary }]}>
                  {formatCurrency(totalRevenue)}
                </Text>
              </View>
              <View style={styles.finItem}>
                <Text style={styles.finLabel}>{t('common.profitLoss')}</Text>
                <Text style={[styles.finValue, { color: getProfitColor(profit) }]}>
                  {formatCurrency(profit)}
                </Text>
              </View>
            </View>
          </AppCard>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
              onPress={() => setActiveTab('expenses')}
            >
              <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabActiveText]}>
                {t('plots.expenses')} ({(expenses ?? []).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'harvests' && styles.tabActive]}
              onPress={() => setActiveTab('harvests')}
            >
              <Text style={[styles.tabText, activeTab === 'harvests' && styles.tabActiveText]}>
                {t('plots.harvests')} ({(harvests ?? []).length})
              </Text>
            </TouchableOpacity>
          </View>

          <AppCard>
            {activeTab === 'expenses' ? (
              <>
                <SectionHeader
                  title={t('plots.expenses')}
                  action={
                    <TouchableOpacity
                      onPress={() => setExpenseModal(true)}
                      style={styles.addTabBtn}
                    >
                      <Ionicons name="add" size={16} color={Colors.primary} />
                      <Text style={styles.addTabText}>{t('expenses.addExpense')}</Text>
                    </TouchableOpacity>
                  }
                />
                {(expenses ?? []).length === 0 ? (
                  <EmptyState icon="receipt-outline" message={t('expenses.noExpenses')} />
                ) : (
                  (expenses ?? []).map((exp) => (
                    <ExpenseItem
                      key={exp._id}
                      expense={exp}
                      onEdit={(e) => setEditingExpense(e)}
                      onDelete={async (eid) => {
                        await deleteExpense(eid);
                        refetchExpenses();
                      }}
                    />
                  ))
                )}
              </>
            ) : (
              <>
                <SectionHeader
                  title={t('plots.harvests')}
                  action={
                    <TouchableOpacity
                      onPress={() => setHarvestModal(true)}
                      style={styles.addTabBtn}
                    >
                      <Ionicons name="add" size={16} color={Colors.primary} />
                      <Text style={styles.addTabText}>{t('harvest.record')}</Text>
                    </TouchableOpacity>
                  }
                />
                {(harvests ?? []).length === 0 ? (
                  <EmptyState icon="cut-outline" message={t('harvest.noHarvests')} />
                ) : (
                  (harvests ?? []).map((h) => (
                    <HarvestItem
                      key={h._id}
                      harvest={h}
                      onDelete={async (hid) => {
                        await deleteHarvest(hid);
                        refetchHarvests();
                      }}
                    />
                  ))
                )}
              </>
            )}
          </AppCard>
        </ScrollView>
      </View>

      <AppModal
        visible={expenseModal}
        onClose={() => setExpenseModal(false)}
        title={t('expenses.addExpense')}
      >
        <ExpenseForm onSubmit={handleAddExpense} loading={submitting} />
      </AppModal>

      <AppModal
        visible={harvestModal}
        onClose={() => setHarvestModal(false)}
        title={t('harvest.record')}
      >
        <HarvestForm plotId={id!} onSubmit={handleAddHarvest} loading={submitting} />
      </AppModal>

      <AppModal
        visible={editModal}
        onClose={() => setEditModal(false)}
        title={t('plots.editPlot')}
      >
        <PlotForm onSubmit={handleEditPlot} loading={submitting} initialData={plot} />
      </AppModal>

      <AppModal
        visible={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title={t('expenses.editExpense', { defaultValue: 'Edit Expense' })}
      >
        {editingExpense ? (
          <ExpenseForm
            onSubmit={handleEditExpense}
            loading={submitting}
            submitLabel={t('common.save', { defaultValue: 'Save Changes' })}
            initialData={{
              category: editingExpense.category,
              description: editingExpense.description,
              amount: editingExpense.amount,
              date: editingExpense.date,
              quantity: editingExpense.quantity,
              unit: editingExpense.unit,
              notes: editingExpense.notes,
            }}
          />
        ) : null}
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.text },
  headerActions: { flexDirection: 'row', gap: 4 },
  actionIconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.base, gap: Spacing.md },
  plotInfo: {},
  plotTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  plotName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  plotCode: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metaItem: { width: '46%', gap: 2 },
  metaLabel: { fontSize: 11, color: Colors.textMuted },
  metaValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  financialCard: {},
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between' },
  finItem: { flex: 1, alignItems: 'center' },
  finLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  finValue: { fontSize: 14, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  tabActiveText: { color: Colors.white },
  addTabBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addTabText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
});
