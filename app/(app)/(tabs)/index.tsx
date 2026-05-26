import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import KpiCard from '@/components/ui/KpiCard';
import TrialBanner from '@/components/shared/TrialBanner';
import PlotCard from '@/components/plots/PlotCard';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import AppModal from '@/components/ui/AppModal';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import HarvestForm from '@/components/harvests/HarvestForm';
import { getPlots } from '@/lib/api/plots';
import { getAnalytics } from '@/lib/api/analytics';
import { createExpense } from '@/lib/api/expenses';
import { createHarvest } from '@/lib/api/harvests';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, getProfitColor } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [expenseModal, setExpenseModal] = useState(false);
  const [harvestModal, setHarvestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: plots, refetch: refetchPlots, isLoading: plotsLoading } = useQuery({
    queryKey: ['plots'],
    queryFn: getPlots,
  });

  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
  });

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchPlots(), refetchAnalytics()]);
    setRefreshing(false);
  }

  const activePlots = plots?.filter((p) => p.status === 'active') ?? [];
  const totalArea = plots?.reduce((s, p) => s + p.area, 0) ?? 0;
  const farm = analytics?.farm;
  const profit = (farm?.netRevenue ?? 0) - (farm?.totalExpenses ?? 0);

  const firstActivePlot = activePlots[0];

  async function handleAddExpense(data: Parameters<typeof createExpense>[0]) {
    setSubmitting(true);
    try {
      await createExpense(data);
      setExpenseModal(false);
      refetchAnalytics();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddHarvest(data: Parameters<typeof createHarvest>[0]) {
    setSubmitting(true);
    try {
      await createHarvest(data);
      setHarvestModal(false);
      refetchPlots();
      refetchAnalytics();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
          </View>
        </View>

        <TrialBanner />

        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KpiCard
              title={t('dashboard.activePlots')}
              value={String(activePlots.length)}
              icon="leaf-outline"
              style={{ flex: 1 }}
            />
            <KpiCard
              title={t('dashboard.totalArea')}
              value={`${totalArea.toFixed(1)} ac`}
              icon="resize-outline"
              style={{ flex: 1 }}
            />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard
              title={t('dashboard.totalExpenses')}
              value={formatCurrency(farm?.totalExpenses ?? 0)}
              icon="arrow-up-circle-outline"
              iconColor={Colors.danger}
              iconBg={Colors.dangerLight}
              style={{ flex: 1 }}
            />
            <KpiCard
              title={t('dashboard.totalRevenue')}
              value={formatCurrency(farm?.netRevenue ?? 0)}
              icon="arrow-down-circle-outline"
              iconColor={Colors.primary}
              style={{ flex: 1 }}
            />
          </View>
          <KpiCard
            title={t('dashboard.netProfit')}
            value={formatCurrency(farm?.profit ?? profit)}
            icon="trending-up-outline"
            iconColor={getProfitColor(farm?.profit ?? profit)}
            iconBg={farm?.profit ?? profit >= 0 ? Colors.primaryLight : Colors.dangerLight}
            subtitle={
              farm?.profitMargin
                ? `${farm.profitMargin.toFixed(1)}% margin`
                : undefined
            }
            subtitleColor={getProfitColor(farm?.profit ?? profit)}
          />
          <KpiCard
            title={t('dashboard.loansOutstanding')}
            value={formatCurrency(analytics?.loansSummary?.totalOutstanding ?? 0)}
            icon="card-outline"
            iconColor={Colors.warning}
            iconBg={Colors.warningLight}
            subtitle={
              analytics?.loansSummary?.activeCount
                ? `${analytics.loansSummary.activeCount} active loan(s)`
                : 'No active loans'
            }
          />
        </View>

        <Text style={styles.quickActionsTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setExpenseModal(true)}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.dangerLight }]}>
              <Ionicons name="receipt-outline" size={22} color={Colors.danger} />
            </View>
            <Text style={styles.actionText}>{t('dashboard.addExpense')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (!firstActivePlot) {
                router.push('/(app)/plots/new');
              } else {
                setHarvestModal(true);
              }
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="cut-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>{t('dashboard.recordHarvest')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(app)/plots/new')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="add-circle-outline" size={22} color={Colors.info} />
            </View>
            <Text style={styles.actionText}>{t('dashboard.newPlot')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={t('dashboard.recentPlots')}
            onSeeAll={() => router.push('/(app)/(tabs)/plots')}
          />
          {!plots || plots.length === 0 ? (
            <EmptyState
              icon="leaf-outline"
              message={t('plots.noPlots')}
              action={
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => router.push('/(app)/plots/new')}
                >
                  <Text style={styles.emptyActionText}>{t('plots.newPlot')}</Text>
                </TouchableOpacity>
              }
            />
          ) : (
            plots.slice(0, 3).map((plot) => <PlotCard key={plot._id} plot={plot} />)
          )}
        </View>
      </ScrollView>

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

      {firstActivePlot ? (
        <AppModal
          visible={harvestModal}
          onClose={() => setHarvestModal(false)}
          title={t('harvest.record')}
        >
          <HarvestForm
            plotId={firstActivePlot._id}
            onSubmit={handleAddHarvest}
            loading={submitting}
          />
        </AppModal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  kpiGrid: { gap: Spacing.md, marginBottom: Spacing.xl },
  kpiRow: { flexDirection: 'row', gap: Spacing.md },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: { marginBottom: Spacing.xl },
  emptyAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  emptyActionText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
});
