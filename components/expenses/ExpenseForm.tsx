import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { EXPENSE_CATEGORIES, COMMON_EXPENSE_UNITS } from '@/constants/categories';
import { Plot } from '@/types';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valid amount required'),
  date: z.string().min(1, 'Date is required'),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: {
    category: string;
    description: string;
    amount: number;
    date: string;
    plotId?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => Promise<void>;
  plots?: Plot[];
  initialPlotId?: string;
  loading?: boolean;
}

export default function ExpenseForm({ onSubmit, plots, initialPlotId, loading }: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [useCustom, setUseCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState(initialPlotId ?? '');
  const [showCategoryList, setShowCategoryList] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today },
  });

  async function onValid(vals: FormData) {
    const finalCategory = useCustom ? customCategory : category;
    if (!finalCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    await onSubmit({
      category: finalCategory,
      description: vals.description,
      amount: Number(vals.amount),
      date: vals.date,
      plotId: selectedPlotId || undefined,
      quantity: vals.quantity ? Number(vals.quantity) : undefined,
      unit: vals.unit || undefined,
      notes: vals.notes,
    });
  }

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('expenses.usePreset')}</Text>
        <Switch
          value={!useCustom}
          onValueChange={(v) => setUseCustom(!v)}
          trackColor={{ true: Colors.primary }}
        />
      </View>

      {!useCustom ? (
        <View style={styles.field}>
          <Text style={styles.label}>{t('expenses.category')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryList((v) => !v)}
          >
            <Text style={styles.selectorText}>
              {t(`cat.${category}`, { defaultValue: category })}
            </Text>
          </TouchableOpacity>
          {showCategoryList ? (
            <View style={styles.categoryList}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catItem, cat === category && styles.catItemActive]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryList(false);
                    }}
                  >
                    <Text style={[styles.catItemText, cat === category && styles.catItemActiveText]}>
                      {t(`cat.${cat}`, { defaultValue: cat })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      ) : (
        <AppInput
          label={t('expenses.customCategory')}
          value={customCategory}
          onChangeText={setCustomCategory}
          placeholder="e.g. Security, Training…"
        />
      )}

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('expenses.description')}
            value={value}
            onChangeText={onChange}
            placeholder="Brief description"
            error={errors.description?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t('expenses.amount')}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="0"
            error={errors.amount?.message}
          />
        )}
      />

      <View style={styles.twoCol}>
        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={t('expenses.quantity')}
              value={value}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              placeholder="e.g. 2"
              containerStyle={{ flex: 1 }}
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={t('expenses.unit')}
              value={value}
              onChangeText={onChange}
              placeholder="bags / kg / hrs"
              containerStyle={{ flex: 1 }}
            />
          )}
        />
      </View>

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

      {plots && plots.length > 0 ? (
        <View style={styles.field}>
          <Text style={styles.label}>{t('expenses.plot')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              const ids = ['', ...plots.map((p) => p._id)];
              const labels = ['No plot', ...plots.map((p) => p.name)];
              const cur = ids.indexOf(selectedPlotId);
              setSelectedPlotId(ids[(cur + 1) % ids.length]);
            }}
          >
            <Text style={styles.selectorText}>
              {selectedPlotId
                ? plots.find((p) => p._id === selectedPlotId)?.name ?? 'Select'
                : 'No specific plot'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('expenses.notes')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="Additional notes…"
            multiline
            numberOfLines={2}
          />
        )}
      />

      <AppButton
        title={loading ? t('expenses.adding') : t('expenses.addExpense')}
        onPress={handleSubmit(onValid)}
        loading={loading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  field: { marginBottom: Spacing.md },
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  selector: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
  },
  selectorText: { fontSize: 15, color: Colors.text },
  categoryList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  catItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  catItemActive: { backgroundColor: Colors.primaryLight },
  catItemText: { fontSize: 14, color: Colors.text },
  catItemActiveText: { color: Colors.primaryDark, fontWeight: '600' },
});
