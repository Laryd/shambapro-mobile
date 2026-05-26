import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { REPAYMENT_METHODS } from '@/constants/categories';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valid amount required'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  loanId: string;
  lenderName: string;
  onSubmit: (data: {
    amount: number;
    method: string;
    date: string;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function RepaymentForm({ lenderName, onSubmit, loading }: Props) {
  const { t } = useTranslation();
  const [method, setMethod] = useState('mpesa');
  const today = new Date().toISOString().slice(0, 10);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today },
  });

  async function onValid(vals: FormData) {
    await onSubmit({
      amount: Number(vals.amount),
      method,
      date: vals.date,
      reference: vals.reference,
      notes: vals.notes,
    });
  }

  const methodLabels: Record<string, string> = {
    mpesa: 'M-Pesa',
    cash: 'Cash',
    bank: 'Bank',
    mill_deduction: 'Mill',
    other: 'Other',
  };

  return (
    <View>
      <Text style={styles.lenderName}>{lenderName}</Text>

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.methodRow}>
        {REPAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.methodBtn, method === m && styles.methodActive]}
            onPress={() => setMethod(m)}
          >
            <Text style={[styles.methodText, method === m && styles.methodActiveText]}>
              {methodLabels[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Repayment Amount (KSH)"
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="0"
            error={errors.amount?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Date"
            value={value}
            onChangeText={onChange}
            placeholder="yyyy-mm-dd"
            error={errors.date?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="reference"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`Reference # (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="M-Pesa transaction code"
          />
        )}
      />

      <AppButton
        title={loading ? t('common.loading') : 'Record Payment'}
        onPress={handleSubmit(onValid)}
        loading={loading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lenderName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  methodBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  methodActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  methodText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  methodActiveText: { color: Colors.primary },
});
