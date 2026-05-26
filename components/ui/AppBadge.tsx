import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/colors';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface Props {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.primaryLight, text: Colors.primaryDark },
  danger: { bg: Colors.dangerLight, text: Colors.danger },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  info: { bg: Colors.infoLight, text: Colors.info },
  default: { bg: Colors.gray100, text: Colors.gray600 },
};

export default function AppBadge({ label, variant = 'default', style }: Props) {
  const colors = BADGE_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
