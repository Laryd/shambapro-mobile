import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/colors';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = 'leaf-outline',
  message,
  action,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={Colors.textLight} />
      <Text style={styles.message}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  message: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
