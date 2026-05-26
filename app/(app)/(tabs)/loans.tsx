import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import KpiCard from '@/components/ui/KpiCard';
import LoanCard from '@/components/loans/LoanCard';
import AppModal from '@/components/ui/AppModal';
import LoanForm from '@/components/loans/LoanForm';
import RepaymentForm from '@/components/loans/RepaymentForm';
import EmptyState from '@/components/ui/EmptyState';
import { getLoans, createLoan, addRepayment } from '@/lib/api/loans';
import { formatCurrency } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { Loan } from '@/types';

export default function LoansScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [loanModal, setLoanModal] = useState(false);
  const [repayModal, setRepayModal] = useState(false);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: loans, isLoading, refetch } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
  });

  const activeLoans = (loans ?? []).filter((l) => l.status === 'active');
  const overdueLoans = (loans ?? []).filter((l) => l.status === 'overdue');
  const repaidLoans = (loans ?? []).filter((l) => l.status === 'repaid');
  const totalOutstanding = (loans ?? []).reduce((s, l) => s + l.balanceOutstanding, 0);

  async function handleCreateLoan(data: Parameters<typeof createLoan>[0]) {
    setSubmitting(true);
    try {
      await createLoan(data);
      setLoanModal(false);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create loan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRepayment(data: { amount: number; method: string; date: string; reference?: string; notes?: string }) {
    if (!activeLoan) return;
    setSubmitting(true);
    try {
      await addRepayment(activeLoan._id, {
        amount: data.amount,
        method: data.method as 'mpesa' | 'cash' | 'bank' | 'mill_deduction' | 'other',
        date: data.date,
        reference: data.reference,
        notes: data.notes,
      });
      setRepayModal(false);
      setActiveLoan(null);
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add repayment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('loans.title')}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setLoanModal(true)}>
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addText}>{t('loans.record')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiRow}>
          <KpiCard
            title={t('loans.outstanding')}
            value={formatCurrency(totalOutstanding)}
            icon="wallet-outline"
            iconColor={Colors.warning}
            iconBg={Colors.warningLight}
            style={{ flex: 1 }}
          />
          <View style={styles.miniKpis}>
            <View style={styles.miniKpi}>
              <Text style={styles.miniKpiValue}>{activeLoans.length}</Text>
              <Text style={styles.miniKpiLabel}>{t('loans.active')}</Text>
            </View>
            <View style={[styles.miniKpi, { borderLeftWidth: 1, borderColor: Colors.border }]}>
              <Text style={[styles.miniKpiValue, { color: Colors.danger }]}>{overdueLoans.length}</Text>
              <Text style={styles.miniKpiLabel}>{t('loans.overdue')}</Text>
            </View>
            <View style={[styles.miniKpi, { borderLeftWidth: 1, borderColor: Colors.border }]}>
              <Text style={[styles.miniKpiValue, { color: Colors.primary }]}>{repaidLoans.length}</Text>
              <Text style={styles.miniKpiLabel}>{t('loans.repaid')}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={loans ?? []}
          keyExtractor={(l) => l._id}
          renderItem={({ item }) => (
            <LoanCard
              loan={item}
              onAddRepayment={(loan) => {
                setActiveLoan(loan);
                setRepayModal(true);
              }}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState icon="wallet-outline" message={t('loans.noLoans')} />
          }
        />
      </View>

      <AppModal
        visible={loanModal}
        onClose={() => setLoanModal(false)}
        title={t('loans.record')}
      >
        <LoanForm onSubmit={handleCreateLoan} loading={submitting} />
      </AppModal>

      <AppModal
        visible={repayModal}
        onClose={() => { setRepayModal(false); setActiveLoan(null); }}
        title={t('loans.addRepayment')}
      >
        {activeLoan ? (
          <RepaymentForm
            loanId={activeLoan._id}
            lenderName={activeLoan.lender}
            onSubmit={handleRepayment}
            loading={submitting}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: 4,
  },
  addText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  miniKpis: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  miniKpi: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderColor: Colors.border,
  },
  miniKpiValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  miniKpiLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
});
