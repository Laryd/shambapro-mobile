import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { daysLeft } from '@/lib/utils';

export default function TrialBanner() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  if (!user?.subscription) return null;

  const { plan, status, trialEndsAt, exemptUntil } = user.subscription;

  if (exemptUntil && new Date(exemptUntil) > new Date()) return null;
  if (plan !== 'free_trial' && status === 'active') return null;
  if (plan === 'free_trial' && !trialEndsAt) return null;

  const days = daysLeft(trialEndsAt);
  const isExpired = status === 'expired' || (plan === 'free_trial' && (days === null || days < 0));

  if (isExpired) {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.expired]}
        onPress={() => router.push('/(app)/pricing')}
      >
        <Ionicons name="alert-circle" size={16} color={Colors.danger} />
        <Text style={[styles.text, styles.expiredText]}>
          Your trial has expired. Subscribe to continue.
        </Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.danger} />
      </TouchableOpacity>
    );
  }

  if (days !== null && days <= 7) {
    return (
      <TouchableOpacity
        style={[styles.banner, styles.warning]}
        onPress={() => router.push('/(app)/pricing')}
      >
        <Ionicons name="time-outline" size={16} color={Colors.warning} />
        <Text style={[styles.text, styles.warningText]}>
          {days} day{days !== 1 ? 's' : ''} left in your free trial
        </Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.warning} />
      </TouchableOpacity>
    );
  }

  if (days !== null) {
    return (
      <View style={[styles.banner, styles.info]}>
        <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
        <Text style={[styles.text, styles.infoText]}>
          Free trial — {days} days remaining
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: 10,
  },
  text: { flex: 1, fontSize: 13, fontWeight: '500' },
  expired: { backgroundColor: Colors.dangerLight },
  expiredText: { color: Colors.danger },
  warning: { backgroundColor: Colors.warningLight },
  warningText: { color: Colors.warning },
  info: { backgroundColor: Colors.primaryLight },
  infoText: { color: Colors.primaryDark },
});
