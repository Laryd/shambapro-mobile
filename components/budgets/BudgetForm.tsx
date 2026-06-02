import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { Plot } from '@/types';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  season: z.string().min(1, 'Season is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface BudgetItem {
  category: string;
  budgetedAmount: string;
}

interface InitialData {
  plotId?: string;
  season?: string;
  items?: Array<{ category: string; budgetedAmount: number }>;
  notes?: string;
}

interface Props {
  plots: Plot[];
  onSubmit: (data: {
    plotId: string;
    season: string;
    items: Array<{ category: string; budgetedAmount: number }>;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
  initialData?: InitialData;
}

export default function BudgetForm({ plots, onSubmit, loading, initialData }: Props) {
  const { t } = useTranslation();
  const isEdit = !!initialData;
  const currentYear = new Date().getFullYear();

  const [selectedPlotId, setSelectedPlotId] = useState(
    initialData?.plotId ?? plots[0]?._id ?? ''
  );
  const [items, setItems] = useState<BudgetItem[]>(
    initialData?.items?.map(i => ({ category: i.category, budgetedAmount: String(i.budgetedAmount) }))
    ?? [
      { category: 'fertilizer', budgetedAmount: '' },
      { category: 'labor_casual', budgetedAmount: '' },
    ]
  );

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { season: initialData?.season ?? `${currentYear}/${currentYear + 1}`, notes: initialData?.notes ?? '' },
  });

  function addItem() {
    setItems((prev) => [...prev, { category: EXPENSE_CATEGORIES[0], budgetedAmount: '' }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItemCategory(index: number, category: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, category } : item));
  }

  function updateItemAmount(index: number, amount: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, budgetedAmount: amount } : item));
  }

  async function onValid(vals: FormData) {
    if (!selectedPlotId) {
      Alert.alert('Error', 'Please select a plot');
      return;
    }
    const validItems = items
      .filter((item) => item.budgetedAmount && !isNaN(Number(item.budgetedAmount)))
      .map((item) => ({
        category: item.category,
        budgetedAmount: Number(item.budgetedAmount),
      }));

    if (validItems.length === 0) {
      Alert.alert('Error', 'Add at least one budget item');
      return;
    }

    await onSubmit({
      plotId: selectedPlotId,
      season: vals.season,
      items: validItems,
      notes: vals.notes,
    });
  }

  return (
    <View>
      {!isEdit && (
        <>
          <Text style={styles.label}>Plot *</Text>
          <View style={styles.plotList}>
            {plots.map((p) => (
              <TouchableOpacity
                key={p._id}
                style={[styles.plotBtn, selectedPlotId === p._id && styles.plotActive]}
                onPress={() => setSelectedPlotId(p._id)}
              >
                <Text style={[styles.plotText, selectedPlotId === p._id && styles.plotActiveText]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Controller
        control={control}
        name="season"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('budgets.season')}
            value={value}
            onChangeText={onChange}
            placeholder="2024/2025"
            error={errors.season?.message}
          />
        )}
      />

      <Text style={styles.sectionTitle}>Budget Items</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <View style={styles.catSelect}>
            <Text style={styles.catText} numberOfLines={1}>
              {t(`cat.${item.category}`, { defaultValue: item.category })}
            </Text>
          </View>
          <AppInput
            value={item.budgetedAmount}
            onChangeText={(v) => updateItemAmount(i, v)}
            keyboardType="decimal-pad"
            placeholder="KSH"
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
          <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn}>
            <Ionicons name="close-circle" size={22} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addItem} style={styles.addItem}>
        <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.addItemText}>{t('budgets.addItem')}</Text>
      </TouchableOpacity>

      <AppButton
        title={loading ? t('common.loading') : isEdit ? t('common.save', { defaultValue: 'Save Changes' }) : t('budgets.create')}
        onPress={handleSubmit(onValid)}
        loading={loading}
        fullWidth
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  plotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  plotBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  plotActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  plotText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  plotActiveText: { color: Colors.primary },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  catSelect: {
    flex: 1.2,
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
  },
  catText: { fontSize: 12, color: Colors.textSecondary },
  removeBtn: { padding: 4 },
  addItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  addItemText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
});
