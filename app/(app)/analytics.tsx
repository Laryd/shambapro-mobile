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

        {analytics?.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
          <AppCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('analytics.monthlyTrend')}</Text>
            <TrendChart data={analytics.monthlyTrend} />
          </AppCard>
        ) : null}

        {analytics?.categoryTotals && analytics.categoryTotals.length > 0 ? (
          <AppCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t('analytics.topCategories')}</Text>
            <CategoryChart data={analytics.categoryTotals} />
          </AppCard>
        ) : null}

        {analytics?.plots && analytics.plots.length > 0 ? (
          <AppCard>
            <Text style={styles.chartTitle}>{t('analytics.plotPerformance')}</Text>
            {analytics.plots.map((p) => (
              <View key={p.plotId} style={styles.plotRow}>
                <View style={styles.plotInfo}>
                  <Text style={styles.plotName}>{p.plotName}</Text>
                  <Text style={styles.plotCode}>{p.plotCode}</Text>
                </View>
                <View style={styles.plotStats}>
                  <Text style={[styles.plotProfit, { color: p.profit >= 0 ? Colors.primary : Colors.danger }]}>
                    {formatCurrency(p.profit)}
                  </Text>
                  <Text style={styles.plotMargin}>{p.profitMargin.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
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
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  plotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  plotInfo: { flex: 1 },
  plotName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  plotCode: { fontSize: 11, color: Colors.textMuted },
  plotStats: { alignItems: 'flex-end' },
  plotProfit: { fontSize: 14, fontWeight: '700' },
  plotMargin: { fontSize: 12, color: Colors.textMuted },
});
