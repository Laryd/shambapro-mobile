import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from './AppCard';
import { Colors, Spacing } from '@/constants/colors';

interface Props {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  subtitleColor?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  iconColor = Colors.primary,
  iconBg = Colors.primaryLight,
  subtitle,
  subtitleColor = Colors.textMuted,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: { fontSize: 12, color: Colors.textMuted, fontWeight: '500', flex: 1 },
  value: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  subtitle: { fontSize: 12 },
});
