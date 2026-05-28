import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { LOAN_TYPES } from '@/constants/categories';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const schema = z.object({
  lender: z.string().min(1, 'Lender is required'),
  principalAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valid amount required'),
  interestRate: z.string().optional(),
  disbursementDate: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: {
    type: string;
    lender: string;
    principalAmount: number;
    interestRate: number;
    disbursementDate: string;
    dueDate?: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function LoanForm({ onSubmit, loading }: Props) {
  const { t } = useTranslation();
  const [loanType, setLoanType] = useState<typeof LOAN_TYPES[number]>(LOAN_TYPES[0]);
  const today = new Date().toISOString().slice(0, 10);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { disbursementDate: today, interestRate: '0' },
  });

  async function onValid(vals: FormData) {
    await onSubmit({
      type: loanType,
      lender: vals.lender,
      principalAmount: Number(vals.principalAmount),
      interestRate: Number(vals.interestRate ?? 0),
      disbursementDate: vals.disbursementDate,
      dueDate: vals.dueDate || undefined,
      notes: vals.notes,
    });
  }

  const loanTypeLabels: Record<string, string> = {
    mill_advance: t('loans.millAdvance'),
    bank_loan: t('loans.bankLoan'),
    sacco: t('loans.sacco'),
    cooperative: t('loans.cooperative'),
    input_credit: t('loans.inputCredit'),
    other: 'Other',
  };

  return (
    <View>
      <Text style={styles.label}>{t('loans.type')}</Text>
      <View style={styles.typeRow}>
        {LOAN_TYPES.map((lt) => (
          <TouchableOpacity
            key={lt}
            style={[styles.typeBtn, loanType === lt && styles.typeActive]}
            onPress={() => setLoanType(lt)}
          >
            <Text style={[styles.typeText, loanType === lt && styles.typeActiveText]} numberOfLines={1}>
              {loanTypeLabels[lt]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller
        control={control}
        name="lender"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('loans.lender')}
            value={value}
            onChangeText={onChange}
            placeholder="e.g. SACCO, Mumias Mill"
            error={errors.lender?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="principalAmount"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('loans.principal')}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="0"
            error={errors.principalAmount?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="interestRate"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('loans.interest')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="0"
          />
        )}
      />

      <Controller
        control={control}
        name="disbursementDate"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('loans.disbursedDate')}
            value={value}
            onChangeText={onChange}
            placeholder="yyyy-mm-dd"
            error={errors.disbursementDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="dueDate"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('loans.dueDate')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="yyyy-mm-dd"
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('expenses.notes')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={2}
          />
        )}
      />

      <AppButton
        title={loading ? t('common.loading') : t('loans.record')}
        onPress={handleSubmit(onValid)}
        loading={loading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  typeActiveText: { color: Colors.primary },
});
