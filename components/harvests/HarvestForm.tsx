import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { MillDeduction } from '@/types';
import { MILL_DEDUCTION_NAMES } from '@/constants/categories';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Required'),
  pricePerUnit: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Required'),
  date: z.string().min(1, 'Required'),
  buyer: z.string().optional(),
  millStatementRef: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  plotId: string;
  onSubmit: (data: {
    plotId: string;
    quantity: number;
    quantityUnit: 'tons' | 'kg';
    pricePerUnit: number;
    millDeductions: MillDeduction[];
    date: string;
    buyer?: string;
    millStatementRef?: string;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function HarvestForm({ plotId, onSubmit, loading }: Props) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [unit, setUnit] = useState<'tons' | 'kg'>('tons');
  const [deductions, setDeductions] = useState<MillDeduction[]>([]);
  const [newDeductName, setNewDeductName] = useState('');
  const [newDeductAmount, setNewDeductAmount] = useState('');

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today },
  });

  const qty = Number(watch('quantity') ?? 0);
  const price = Number(watch('pricePerUnit') ?? 0);
  const gross = qty * price;
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const net = gross - totalDeductions;

  function addDeduction() {
    if (!newDeductName || !newDeductAmount || isNaN(Number(newDeductAmount))) {
      Alert.alert('Error', 'Enter deduction name and amount');
      return;
    }
    setDeductions((prev) => [
      ...prev,
      { name: newDeductName, amount: Number(newDeductAmount) },
    ]);
    setNewDeductName('');
    setNewDeductAmount('');
  }

  async function onValid(vals: FormData) {
    await onSubmit({
      plotId,
      quantity: Number(vals.quantity),
      quantityUnit: unit,
      pricePerUnit: Number(vals.pricePerUnit),
      millDeductions: deductions,
      date: vals.date,
      buyer: vals.buyer,
      millStatementRef: vals.millStatementRef,
      notes: vals.notes,
    });
  }

  return (
    <View>
      <View style={styles.unitRow}>
        {(['tons', 'kg'] as const).map((u) => (
          <TouchableOpacity
            key={u}
            style={[styles.unitBtn, unit === u && styles.unitActive]}
            onPress={() => setUnit(u)}
          >
            <Text style={[styles.unitText, unit === u && styles.unitActiveText]}>{u}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller
        control={control}
        name="quantity"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('harvest.quantity')} (${unit})`}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="e.g. 45"
            error={errors.quantity?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="pricePerUnit"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('harvest.pricePerUnit')}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="KSH per ton/kg"
            error={errors.pricePerUnit?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('expenses.date')}
            value={value}
            onChangeText={onChange}
            placeholder="yyyy-mm-dd"
            error={errors.date?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="buyer"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('harvest.buyer')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="Mill name"
          />
        )}
      />

      <Controller
        control={control}
        name="millStatementRef"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('harvest.millRef')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="Reference #"
          />
        )}
      />

      <Text style={styles.sectionTitle}>{t('harvest.deductions')}</Text>
      {deductions.map((d, i) => (
        <View key={i} style={styles.deductRow}>
          <Text style={styles.deductName} numberOfLines={1}>{d.name}</Text>
          <Text style={styles.deductAmount}>-KSH {d.amount.toLocaleString()}</Text>
          <TouchableOpacity
            onPress={() => setDeductions((prev) => prev.filter((_, j) => j !== i))}
          >
            <Ionicons name="close-circle" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addDeductRow}>
        <AppInput
          placeholder="Deduction name"
          value={newDeductName}
          onChangeText={setNewDeductName}
          containerStyle={{ flex: 2 }}
        />
        <AppInput
          placeholder="Amount"
          value={newDeductAmount}
          onChangeText={setNewDeductAmount}
          keyboardType="decimal-pad"
          containerStyle={{ flex: 1 }}
        />
        <TouchableOpacity onPress={addDeduction} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {gross > 0 ? (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('harvest.gross')}</Text>
            <Text style={styles.summaryValue}>KSH {gross.toLocaleString()}</Text>
          </View>
          {totalDeductions > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('harvest.totalDeductions')}</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                -KSH {totalDeductions.toLocaleString()}
              </Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, styles.summaryNetRow]}>
            <Text style={styles.summaryNetLabel}>{t('harvest.netReceived')}</Text>
            <Text style={styles.summaryNetValue}>KSH {net.toLocaleString()}</Text>
          </View>
        </View>
      ) : null}

      <AppButton
        title={loading ? t('common.loading') : t('harvest.record')}
        onPress={handleSubmit(onValid)}
        loading={loading}
        fullWidth
        style={{ marginTop: Spacing.base }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  unitRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  unitActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  unitText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  unitActiveText: { color: Colors.primary },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  deductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  deductName: { flex: 1, fontSize: 14, color: Colors.text },
  deductAmount: { fontSize: 14, fontWeight: '500', color: Colors.danger },
  addDeductRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addBtn: { marginBottom: Spacing.md, paddingLeft: Spacing.xs },
  summary: {
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: 13, color: Colors.textMuted },
  summaryValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  summaryNetRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  summaryNetLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  summaryNetValue: { fontSize: 15, fontWeight: '700', color: Colors.primary },
});
