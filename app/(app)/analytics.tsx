import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppCard from '@/components/ui/AppCard';
import KpiCard from '@/components/ui/KpiCard';
import TrendChart from '@/components/analytics/TrendChart';
import CategoryChart from '@/components/analytics/CategoryChart';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getAnalytics } from '@/lib/api/analytics';
import { formatCurrency } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
  });

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  if (isLoading) return <LoadingScreen />;

  const farm = analytics?.farm;
  const loans = analytics?.loansSummary;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('analytics.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Primary KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KpiCard
              title="Net Revenue"
              value={formatCurrency(farm?.netRevenue ?? 0)}
              icon="arrow-down-circle-outline"
              style={{ flex: 1 }}
            />
            <KpiCard
              title="Total Expenses"
              value={formatCurrency(farm?.totalExpenses ?? 0)}
              icon="arrow-up-circle-outline"
              iconColor={Colors.danger}
              iconBg={Colors.dangerLight}
              style={{ flex: 1 }}
            />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard
              title={t('common.profitLoss')}
              value={formatCurrency(farm?.profit ?? 0)}
              icon="cash-outline"
              iconColor={(farm?.profit ?? 0) >= 0 ? Colors.primary : Colors.danger}
              iconBg={(farm?.profit ?? 0) >= 0 ? Colors.primaryLight : Colors.dangerLight}
              style={{ flex: 1 }}
            />
            <KpiCard
              title="Mill Deductions"
              value={formatCurrency(farm?.totalDeductions ?? 0)}
              icon="remove-circle-outline"
              iconColor={Colors.warning}
              iconBg={Colors.warningLight}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Efficiency KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KpiCard
              title={t('analytics.costPerAcre')}
              value={formatCurrency(farm?.costPerAcre ?? 0)}
              icon="calculator-outline"
              iconColor={Colors.warning}
              iconBg={Colors.warningLight}
              style={{ flex: 1 }}
            />
            <KpiCard
              title={t('analytics.revenuePerAcre')}
              value={formatCurrency(farm?.revenuePerAcre ?? 0)}
              icon="trending-up-outline"
              style={{ flex: 1 }}
            />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard
              title={t('analytics.costPerTon')}
              value={formatCurrency(farm?.costPerTon ?? 0)}
              icon="cube-outline"
              iconColor={Colors.info}
              iconBg={Colors.infoLight}
              style={{ flex: 1 }}
            />
            <KpiCard
              title={t('analytics.totalHarvest')}
              value={`${(farm?.totalHarvestTons ?? 0).toFixed(1)} t`}
              icon="cut-outline"
              style={{ flex: 1 }}
            />
          </View>
          {farm?.profitMargin !== undefined ? (
            <KpiCard
              title={t('analytics.profitMargin')}
              value={`${farm.profitMargin.toFixed(1)}%`}
              icon="pie-chart-outline"
              iconColor={farm.profitMargin >= 0 ? Colors.primary : Colors.danger}
              iconBg={farm.profitMargin >= 0 ? Colors.primaryLight : Colors.dangerLight}
            />
          ) : null}
        </View>

        {/* Monthly trend chart */}
        {analytics?.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
          <AppCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('analytics.monthlyTrend')}</Text>
            <TrendChart data={analytics.monthlyTrend} />
          </AppCard>
        ) : null}

        {/* Top expense categories chart */}
        {analytics?.categoryTotals && analytics.categoryTotals.length > 0 ? (
          <AppCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('analytics.topCategories')}</Text>
            <CategoryChart data={analytics.categoryTotals} />
          </AppCard>
        ) : null}

        {/* Plot-by-plot performance table */}
        {analytics?.plots && analytics.plots.length > 0 ? (
          <AppCard>
            <Text style={styles.chartTitle}>{t('analytics.plotPerformance')}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { flex: 2 }]}>Plot</Text>
              <Text style={styles.thCell}>Expenses</Text>
              <Text style={styles.thCell}>Revenue</Text>
              <Text style={styles.thCell}>Profit</Text>
            </View>
            {analytics.plots.map((p) => (
              <View key={p.plotId} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.plotName}>{p.plotName}</Text>
                  <Text style={styles.plotSub}>
                    {p.plotCode} · {p.area} {p.areaUnit}
                  </Text>
                </View>
                <Text style={[styles.tdCell, { color: Colors.danger }]}>
                  {formatCurrency(p.totalExpenses)}
                </Text>
                <Text style={[styles.tdCell, { color: Colors.primary }]}>
                  {formatCurrency(p.netRevenue)}
                </Text>
                <Text style={[styles.tdCell, { fontWeight: '700', color: p.profit >= 0 ? Colors.primary : Colors.danger }]}>
                  {p.profit >= 0 ? '+' : ''}{formatCurrency(p.profit)}
                </Text>
              </View>
            ))}

            {/* Efficiency sub-table */}
            <View style={[styles.tableHeader, { marginTop: Spacing.md }]}>
              <Text style={[styles.thCell, { flex: 2 }]}>Plot</Text>
              <Text style={styles.thCell}>KSH/Acre</Text>
              <Text style={styles.thCell}>KSH/Ton</Text>
              <Text style={styles.thCell}>Margin</Text>
            </View>
            {analytics.plots.map((p) => (
              <View key={p.plotId + '_eff'} style={styles.tableRow}>
                <Text style={[styles.plotName, { flex: 2 }]} numberOfLines={1}>{p.plotName}</Text>
                <Text style={styles.tdCell}>{formatCurrency(p.costPerAcre)}</Text>
                <Text style={styles.tdCell}>
                  {p.totalHarvestTons > 0 ? formatCurrency(p.costPerTon) : '—'}
                </Text>
                <Text style={[styles.tdCell, { color: p.profitMargin >= 0 ? Colors.primary : Colors.danger }]}>
                  {p.profitMargin.toFixed(1)}%
                </Text>
              </View>
            ))}
          </AppCard>
        ) : null}

        {/* Loans outstanding alert */}
        {(loans?.totalOutstanding ?? 0) > 0 ? (
          <AppCard style={styles.loansAlert}>
            <View style={styles.loansAlertRow}>
              <View style={styles.loansAlertIcon}>
                <Ionicons name="wallet-outline" size={20} color={Colors.warning} />
              </View>
              <View>
                <Text style={styles.loansAlertLabel}>Outstanding Loans</Text>
                <Text style={styles.loansAlertValue}>
                  {formatCurrency(loans!.totalOutstanding)}
                </Text>
              </View>
            </View>
          </AppCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },
  content: { padding: Spacing.base, gap: Spacing.md },
  kpiGrid: { gap: Spacing.md },
  kpiRow: { flexDirection: 'row', gap: Spacing.md },
  chartCard: { gap: Spacing.md },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  thCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  plotName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  plotSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  plotCode: { fontSize: 11, color: Colors.textMuted },
  tdCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  plotStats: { alignItems: 'flex-end' },
  plotProfit: { fontSize: 14, fontWeight: '700' },
  plotMargin: { fontSize: 12, color: Colors.textMuted },
  loansAlert: {
    borderWidth: 1,
    borderColor: Colors.warningLight,
    backgroundColor: Colors.warningLight,
  },
  loansAlertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  loansAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loansAlertLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  loansAlertValue: { fontSize: 18, fontWeight: '800', color: Colors.warning },
});
