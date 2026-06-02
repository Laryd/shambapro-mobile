import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import { getCropCategories, CROP_LABELS } from '@/constants/categories';
import { Plot, CropType } from '@/types';
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

interface InitialData {
  category?: string;
  description?: string;
  amount?: number;
  date?: string;
  plotId?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

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
  initialData?: InitialData;
  submitLabel?: string;
  loading?: boolean;
}

export default function ExpenseForm({ onSubmit, plots, initialPlotId, initialData, submitLabel, loading }: Props) {
  const { t } = useTranslation();

  const [selectedPlotId, setSelectedPlotId] = useState(initialData?.plotId ?? initialPlotId ?? '');
  const [useCustom, setUseCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showPlotList, setShowPlotList] = useState(false);

  const selectedPlot = plots?.find((p) => p._id === selectedPlotId);
  const cropType: CropType = (selectedPlot?.cropType ?? 'sugarcane') as CropType;
  const CATEGORIES = getCropCategories(cropType);

  const resolveInitialCategory = () => {
    const cat = initialData?.category;
    if (cat) {
      const found = CATEGORIES.find(c => c.value === cat);
      return found?.value ?? CATEGORIES[0].value;
    }
    return CATEGORIES[0].value;
  };

  const [category, setCategory] = useState(resolveInitialCategory());

  const today = new Date().toISOString().slice(0, 10);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: initialData?.description ?? '',
      amount: initialData?.amount != null ? String(initialData.amount) : '',
      date: initialData?.date?.slice(0, 10) ?? today,
      quantity: initialData?.quantity != null ? String(initialData.quantity) : '',
      unit: initialData?.unit ?? '',
      notes: initialData?.notes ?? '',
    },
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

  const selectedCategoryLabel = CATEGORIES.find(c => c.value === category)?.label ?? category;

  return (
    <View>
      {/* Plot picker */}
      {plots && plots.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.label}>{t('expenses.plot')}</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowPlotList((v) => !v)}
          >
            <Text style={styles.selectorText}>
              {selectedPlotId
                ? plots.find((p) => p._id === selectedPlotId)?.name ?? 'Select plot'
                : 'No specific plot'}
            </Text>
          </TouchableOpacity>
          {showPlotList && (
            <View style={styles.listBox}>
              <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => { setSelectedPlotId(''); setShowPlotList(false); }}
                >
                  <Text style={styles.listItemText}>No specific plot</Text>
                </TouchableOpacity>
                {plots.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    style={[styles.listItem, p._id === selectedPlotId && styles.listItemActive]}
                    onPress={() => { setSelectedPlotId(p._id); setShowPlotList(false); }}
                  >
                    <Text style={[styles.listItemText, p._id === selectedPlotId && styles.listItemActiveText]}>
                      {p.name} · {CROP_LABELS[p.cropType as CropType] ?? p.cropType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {selectedPlot && (
            <Text style={styles.hint}>
              Showing categories for {CROP_LABELS[cropType]}
            </Text>
          )}
        </View>
      )}

      {/* Category toggle */}
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
            <Text style={styles.selectorText}>{selectedCategoryLabel}</Text>
          </TouchableOpacity>
          {showCategoryList && (
            <View style={styles.listBox}>
              <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.listItem, cat.value === category && styles.listItemActive]}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategoryList(false);
                    }}
                  >
                    <Text style={[styles.listItemText, cat.value === category && styles.listItemActiveText]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
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
        title={loading
          ? t('expenses.adding')
          : (submitLabel ?? t('expenses.addExpense'))}
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
  hint: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
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
  listBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  listItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listItemActive: { backgroundColor: Colors.primaryLight },
  listItemText: { fontSize: 14, color: Colors.text },
  listItemActiveText: { color: Colors.primaryDark, fontWeight: '600' },
});
