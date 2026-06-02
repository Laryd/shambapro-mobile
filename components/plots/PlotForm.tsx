import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import { Colors, Spacing } from '@/constants/colors';
import {
  CROP_TYPES, CROP_LABELS, CROP_EMOJI, CROP_VARIETIES, CROP_USES_RATOON,
} from '@/constants/categories';
import { useTranslation } from 'react-i18next';
import { Plot, CropType } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Plot name is required'),
  location: z.string().optional(),
  area: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valid area required'),
  variety: z.string().min(1, 'Variety is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  expectedHarvestDate: z.string().optional(),
  landLeaseAmount: z.string().optional(),
  ratoonCycle: z.string().optional(),
  seasonBudget: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: {
    name: string;
    location?: string;
    area: number;
    areaUnit: 'acres' | 'hectares';
    cropType: CropType;
    variety: string;
    plantingDate: string;
    expectedHarvestDate?: string;
    landLeaseAmount?: number;
    ratoonCycle?: number;
    seasonBudget?: number;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<Plot>;
}

export default function PlotForm({ onSubmit, loading, initialData }: Props) {
  const { t } = useTranslation();
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares'>(
    initialData?.areaUnit ?? 'acres'
  );
  const [cropType, setCropType] = useState<CropType>(
    initialData?.cropType ?? 'sugarcane'
  );

  const varieties = CROP_VARIETIES[cropType];
  const usesRatoon = CROP_USES_RATOON.has(cropType);

  const [variety, setVariety] = useState(
    initialData?.variety ?? varieties[0]
  );
  const [showVarietyList, setShowVarietyList] = useState(false);

  // Reset variety when crop type changes
  const handleCropTypeChange = (ct: CropType) => {
    setCropType(ct);
    setVariety(CROP_VARIETIES[ct][0]);
    setShowVarietyList(false);
  };

  const today = new Date().toISOString().slice(0, 10);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      location: initialData?.location ?? '',
      area: initialData?.area?.toString() ?? '',
      variety: initialData?.variety ?? varieties[0],
      plantingDate: initialData?.plantingDate
        ? initialData.plantingDate.slice(0, 10)
        : today,
      expectedHarvestDate: initialData?.expectedHarvestDate?.slice(0, 10) ?? '',
      landLeaseAmount: initialData?.landLeaseAmount?.toString() ?? '',
      ratoonCycle: initialData?.ratoonCycle?.toString() ?? '0',
      seasonBudget: initialData?.seasonBudget?.toString() ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  async function onValid(vals: FormData) {
    await onSubmit({
      name: vals.name,
      location: vals.location || undefined,
      area: Number(vals.area),
      areaUnit,
      cropType,
      variety,
      plantingDate: vals.plantingDate,
      expectedHarvestDate: vals.expectedHarvestDate || undefined,
      landLeaseAmount: vals.landLeaseAmount ? Number(vals.landLeaseAmount) : undefined,
      ratoonCycle: usesRatoon && vals.ratoonCycle ? Number(vals.ratoonCycle) : 0,
      seasonBudget: vals.seasonBudget ? Number(vals.seasonBudget) : undefined,
      notes: vals.notes || undefined,
    });
  }

  return (
    <View>

      {/* Crop Type selector */}
      <View style={styles.field}>
        <Text style={styles.label}>Crop Type *</Text>
        <View style={styles.cropGrid}>
          {CROP_TYPES.map((ct) => (
            <TouchableOpacity
              key={ct}
              style={[styles.cropBtn, cropType === ct && styles.cropBtnActive]}
              onPress={() => handleCropTypeChange(ct)}
            >
              <Text style={styles.cropEmoji}>{CROP_EMOJI[ct]}</Text>
              <Text style={[styles.cropLabel, cropType === ct && styles.cropLabelActive]} numberOfLines={1}>
                {CROP_LABELS[ct].replace(' (Wimbi)', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Plot Name *"
            value={value}
            onChangeText={onChange}
            placeholder="e.g. North Field"
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('plots.location')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="Village, Sub-County"
          />
        )}
      />

      <View style={styles.twoCol}>
        <Controller
          control={control}
          name="area"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label={`${t('plots.area')} *`}
              value={value}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              placeholder="e.g. 2.5"
              error={errors.area?.message}
              containerStyle={{ flex: 1 }}
            />
          )}
        />
        <View style={{ flex: 1, marginBottom: Spacing.md }}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitRow}>
            {(['acres', 'hectares'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, areaUnit === u && styles.unitActive]}
                onPress={() => setAreaUnit(u)}
              >
                <Text style={[styles.unitText, areaUnit === u && styles.unitActiveText]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Variety — adapts to crop type */}
      <View style={styles.field}>
        <Text style={styles.label}>{CROP_LABELS[cropType]} Variety *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowVarietyList((v) => !v)}
        >
          <Text style={styles.selectorText}>{variety}</Text>
        </TouchableOpacity>
        {showVarietyList ? (
          <View style={styles.varietyList}>
            {varieties.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.varietyItem, v === variety && styles.varietyActive]}
                onPress={() => {
                  setVariety(v);
                  setShowVarietyList(false);
                }}
              >
                <Text style={[styles.varietyText, v === variety && styles.varietyActiveText]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      <Controller
        control={control}
        name="plantingDate"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label="Planting Date *"
            value={value}
            onChangeText={onChange}
            placeholder="yyyy-mm-dd"
            error={errors.plantingDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="expectedHarvestDate"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('plots.expectedHarvest')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="yyyy-mm-dd"
          />
        )}
      />

      {/* Ratoon cycle — sugarcane only */}
      {usesRatoon && (
        <View style={styles.field}>
          <Text style={styles.label}>Crop Cycle</Text>
          <View style={styles.ratoonRow}>
            {[['0', 'Plant Cane'], ['1', 'Ratoon 1'], ['2', 'Ratoon 2'], ['3', 'Ratoon 3'], ['4', 'Ratoon 4+']].map(([val, lbl]) => (
              <Controller
                key={val}
                control={control}
                name="ratoonCycle"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[styles.ratoonBtn, value === val && styles.ratoonBtnActive]}
                    onPress={() => onChange(val)}
                  >
                    <Text style={[styles.ratoonText, value === val && styles.ratoonTextActive]} numberOfLines={1}>
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
        </View>
      )}

      <Controller
        control={control}
        name="landLeaseAmount"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('plots.landLease')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="KSH"
          />
        )}
      />

      <Controller
        control={control}
        name="seasonBudget"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('plots.seasonBudget')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder="KSH"
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={`${t('plots.notes')} (${t('common.optional')})`}
            value={value}
            onChangeText={onChange}
            placeholder="Additional notes…"
            multiline
            numberOfLines={3}
          />
        )}
      />

      <AppButton
        title={loading ? t('common.loading') : t('common.save')}
        onPress={handleSubmit(onValid)}
        loading={loading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  field: { marginBottom: Spacing.md },
  unitRow: { flexDirection: 'row', gap: Spacing.sm },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  unitActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  unitText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  unitActiveText: { color: Colors.primary },
  selector: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
  },
  selectorText: { fontSize: 15, color: Colors.text },
  varietyList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  varietyItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  varietyActive: { backgroundColor: Colors.primaryLight },
  varietyText: { fontSize: 14, color: Colors.text },
  varietyActiveText: { color: Colors.primaryDark, fontWeight: '600' },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cropBtn: {
    width: '30%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 2,
  },
  cropBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  cropEmoji: { fontSize: 22 },
  cropLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  cropLabelActive: { color: Colors.primaryDark },
  ratoonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
});
