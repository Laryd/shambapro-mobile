import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { MillDeduction, CropType } from '@/types';
import {
  CROP_HARVEST_UNITS, CROP_USES_MILL_DEDUCTIONS, CROP_USES_RATOON, CROP_LABELS,
  CROP_DEDUCTIONS_LABEL, CROP_BUYER_LABEL, CROP_STATEMENT_LABEL, CROP_BUYER_PLACEHOLDER,
  getDeductionPresets,
} from '@/constants/categories';
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
  cropType?: CropType;
  onSubmit: (data: {
    plotId: string;
    quantity: number;
    quantityUnit: string;
    pricePerUnit: number;
    millDeductions: MillDeduction[];
    date: string;
    buyer?: string;
    millStatementRef?: string;
    ratoonCycle?: number;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export default function HarvestForm({ plotId, cropType = 'sugarcane', onSubmit, loading }: Props) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);

  const harvestUnits = CROP_HARVEST_UNITS[cropType] ?? ['kg', 'tons'];
  const usesMillDeductions = CROP_USES_MILL_DEDUCTIONS.has(cropType);
  const usesRatoon = CROP_USES_RATOON.has(cropType);
  // Sugarcane keeps its existing (localized) copy; other crops get their own English wording
  // since crop-specific labels aren't routed through i18n yet.
  const deductionsLabel = cropType === 'sugarcane' ? t('harvest.deductions') : (CROP_DEDUCTIONS_LABEL[cropType] ?? t('harvest.deductions'));
  const buyerLabel = cropType === 'sugarcane' ? t('harvest.buyer') : (usesMillDeductions ? (CROP_BUYER_LABEL[cropType] ?? 'Buyer') : 'Buyer');
  const buyerPlaceholder = usesMillDeductions ? (CROP_BUYER_PLACEHOLDER[cropType] ?? 'Buyer name') : 'e.g. NCPB, Trader';
  const statementLabel = cropType === 'sugarcane' ? t('harvest.millRef') : (CROP_STATEMENT_LABEL[cropType] ?? t('harvest.millRef'));

  const [unit, setUnit] = useState(harvestUnits[0]);
  const [ratoonCycle, setRatoonCycle] = useState(0);
  const [deductions, setDeductions] = useState<MillDeduction[]>([]);
  const [newDeductName, setNewDeductName] = useState('');
  const [newDeductAmount, setNewDeductAmount] = useState('');

  // Reset unit when crop type changes
  useEffect(() => {
    setUnit(CROP_HARVEST_UNITS[cropType]?.[0] ?? 'kg');
    if (!usesMillDeductions) setDeductions([]);
  }, [cropType]);

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
    setDeductions((prev) => [...prev, { name: newDeductName, amount: Number(newDeductAmount) }]);
    setNewDeductName('');
    setNewDeductAmount('');
  }

  async function onValid(vals: FormData) {
    await onSubmit({
      plotId,
      quantity: Number(vals.quantity),
      quantityUnit: unit,
      pricePerUnit: Number(vals.pricePerUnit),
      millDeductions: usesMillDeductions ? deductions : [],
      date: vals.date,
      buyer: vals.buyer,
      millStatementRef: usesMillDeductions ? vals.millStatementRef : undefined,
      ratoonCycle: usesRatoon ? ratoonCycle : 0,
      notes: vals.notes,
    });
  }

  return (
    <View>

      {/* Quantity unit selector */}
      <View style={styles.field}>
        <Text style={styles.label}>Unit</Text>
        <View style={styles.unitRow}>
          {harvestUnits.map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, unit === u && styles.unitActive]}
              onPress={() => setUnit(u)}
            >
              <Text style={[styles.unitText, unit === u && styles.unitActiveText]} numberOfLines={1}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
            label={`KSH per ${unit}`}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="0"
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

      {/* Ratoon cycle — sugarcane only */}
      {usesRatoon && (
        <View style={styles.field}>
          <Text style={styles.label}>Ratoon Cycle</Text>
          <View style={styles.ratoonRow}>
            {[[0, 'Plant'], [1, 'R1'], [2, 'R2'], [3, 'R3'], [4, 'R4+']].map(([val, lbl]) => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.ratoonBtn, ratoonCycle === val && styles.ratoonBtnActive]}
                onPress={() => setRatoonCycle(val as number)}
              >
                <Text style={[styles.ratoonText, ratoonCycle === val && styles.ratoonTextActive]}>
                  {lbl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Controller
        control={control}
        name="buyer"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${buyerLabel} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder={buyerPlaceholder}
          />
        )}
      />

      {/* Statement ref — crops using mill/factory deductions only */}
      {usesMillDeductions && (
        <Controller
          control={control}
          name="millStatementRef"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={`${statementLabel} (${t('common.optional')})`}
              value={value}
              onChangeText={onChange}
              placeholder="Reference #"
            />
          )}
        />
      )}

      {/* Deductions — crops using mill/factory deductions only */}
      {usesMillDeductions && (
        <>
          <Text style={styles.sectionTitle}>{deductionsLabel}</Text>

          {/* Preset quick-add */}
          <View style={styles.presetRow}>
            {getDeductionPresets(cropType).map((n) => (
              <TouchableOpacity
                key={n}
                style={styles.presetChip}
                onPress={() => setNewDeductName(n)}
              >
                <Text style={styles.presetChipText}>+ {n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {deductions.map((d, i) => (
            <View key={i} style={styles.deductRow}>
              <Text style={styles.deductName} numberOfLines={1}>{d.name}</Text>
              <Text style={styles.deductAmount}>-KSH {d.amount.toLocaleString()}</Text>
              <TouchableOpacity onPress={() => setDeductions((prev) => prev.filter((_, j) => j !== i))}>
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
        </>
      )}

      {/* Live summary */}
      {gross > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('harvest.gross')}</Text>
            <Text style={styles.summaryValue}>KSH {gross.toLocaleString()}</Text>
          </View>
          {usesMillDeductions && totalDeductions > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('harvest.totalDeductions')}</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                -KSH {totalDeductions.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryNetRow]}>
            <Text style={styles.summaryNetLabel}>{t('harvest.netReceived')}</Text>
            <Text style={styles.summaryNetValue}>KSH {net.toLocaleString()}</Text>
          </View>
        </View>
      )}

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`Notes (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="Additional notes…"
            multiline
            numberOfLines={2}
          />
        )}
      />

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
  field: { marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  unitRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  unitBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  unitActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  unitText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  unitActiveText: { color: Colors.primary },
  ratoonRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  ratoonBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ratoonBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  ratoonText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  ratoonTextActive: { color: Colors.primary },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  presetChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  presetChipText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
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
