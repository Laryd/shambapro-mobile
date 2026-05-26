import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '@/components/ui/AppCard';
import AppBadge from '@/components/ui/AppBadge';
import { Colors, Spacing } from '@/constants/colors';
import { Loan } from '@/types';
import { formatCurrency, formatDate, getLoanTypeLabel } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Props {
  loan: Loan;
  onAddRepayment: (loan: Loan) => void;
}

function loanStatusVariant(status: string) {
  if (status === 'repaid') return 'success';
  if (status === 'overdue') return 'danger';
  return 'info';
}

export default function LoanCard({ loan, onAddRepayment }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const progress = loan.principalAmount > 0
    ? Math.min((loan.totalRepaid / loan.principalAmount) * 100, 100)
    : 0;

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.lender}>{loan.lender}</Text>
          <Text style={styles.type}>{getLoanTypeLabel(loan.type)}</Text>
        </View>
        <AppBadge label={loan.status} variant={loanStatusVariant(loan.status)} />
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Principal</Text>
          <Text style={styles.amountValue}>{formatCurrency(loan.principalAmount)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Repaid</Text>
          <Text style={[styles.amountValue, { color: Colors.primary }]}>
            {formatCurrency(loan.totalRepaid)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Balance</Text>
          <Text style={[styles.amountValue, { color: Colors.danger }]}>
            {formatCurrency(loan.balanceOutstanding)}
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress.toFixed(0)}% repaid</Text>

      {loan.dueDate ? (
        <Text style={styles.dueDate}>
          Due: {formatDate(loan.dueDate)}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={styles.historyBtn}
        >
          <Text style={styles.historyText}>
            {expanded ? 'Hide history' : `${loan.repayments.length} repayment(s)`}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
        {loan.status !== 'repaid' ? (
          <TouchableOpacity
            onPress={() => onAddRepayment(loan)}
            style={styles.repayBtn}
          >
            <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.repayText}>{t('loans.addRepayment')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {expanded && loan.repayments.length > 0 ? (
        <View style={styles.history}>
          {loan.repayments.map((r, i) => (
            <View key={i} style={styles.repaymentRow}>
              <Text style={styles.repayDate}>{formatDate(r.date)}</Text>
              <Text style={styles.repayMethod}>{r.method}</Text>
              <Text style={styles.repayAmount}>{formatCurrency(r.amount)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleWrap: { flex: 1, marginRight: Spacing.sm },
  lender: { fontSize: 15, fontWeight: '700', color: Colors.text },
  type: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  amountItem: { flex: 1, alignItems: 'center' },
  amountLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  amountValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 99,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },
  progressText: { fontSize: 11, color: Colors.textMuted, marginBottom: Spacing.sm },
  dueDate: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyText: { fontSize: 13, color: Colors.textMuted },
  repayBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  repayText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  history: {
    marginTop: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  repaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  repayDate: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  repayMethod: { fontSize: 12, color: Colors.textMuted, flex: 1, textAlign: 'center' },
  repayAmount: { fontSize: 12, fontWeight: '600', color: Colors.primary },
});
