import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppCard from '@/components/ui/AppCard';
import AppBadge from '@/components/ui/AppBadge';
import { Colors, Spacing } from '@/constants/colors';
import { Plot, CropType } from '@/types';
import { formatDate, getRatoonLabel } from '@/lib/utils';
import { CROP_LABELS, CROP_EMOJI, CROP_USES_RATOON } from '@/constants/categories';

interface Props {
  plot: Plot;
}

function statusVariant(status: string) {
  if (status === 'active') return 'success';
  if (status === 'harvested') return 'info';
  return 'default';
}

export default function PlotCard({ plot }: Props) {
  const router = useRouter();
  const cropType: CropType = plot.cropType ?? 'sugarcane';
  const usesRatoon = CROP_USES_RATOON.has(cropType);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(app)/plots/${plot._id}`)}
    >
      <AppCard style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.cropEmoji}>{CROP_EMOJI[cropType]}</Text>
              <Text style={styles.name} numberOfLines={1}>{plot.name}</Text>
            </View>
            <Text style={styles.code}>{plot.plotCode} · {CROP_LABELS[cropType]}</Text>
          </View>
          <AppBadge
            label={plot.status}
            variant={statusVariant(plot.status)}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="leaf-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{plot.variety}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="resize-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{plot.area} {plot.areaUnit}</Text>
          </View>
          {plot.location ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{plot.location}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textLight} />
            <Text style={styles.dateText}>Planted {formatDate(plot.plantingDate)}</Text>
          </View>
          {usesRatoon && (
            <Text style={styles.ratoon}>{getRatoonLabel(plot.ratoonCycle)}</Text>
          )}
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleWrap: { flex: 1, marginRight: Spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cropEmoji: { fontSize: 18 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  code: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateText: { fontSize: 12, color: Colors.textLight },
  ratoon: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    fontWeight: '600',
  },
});
