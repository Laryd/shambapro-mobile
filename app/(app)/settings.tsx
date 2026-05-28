import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppCard from '@/components/ui/AppCard';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';
import { getSubscription } from '@/lib/api/subscription';
import { formatDate } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  function confirmLogout() {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {user?.phone ? (
                <Text style={styles.profilePhone}>{user.phone}</Text>
              ) : null}
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.subscription')}</Text>
          <View style={styles.subRow}>
            <Text style={styles.subPlan}>
              {(sub?.plan ?? user?.subscription.plan ?? 'none').replace('_', ' ').toUpperCase()}
            </Text>
            <View style={[
              styles.subBadge,
              {
                backgroundColor: (sub?.isActive ?? user?.subscription.status === 'active')
                  ? Colors.primaryLight
                  : Colors.dangerLight,
              },
            ]}>
              <Text style={[
                styles.subBadgeText,
                {
                  color: (sub?.isActive ?? user?.subscription.status === 'active')
                    ? Colors.primary
                    : Colors.danger,
                },
              ]}>
                {(sub?.isActive ?? user?.subscription.status === 'active') ? 'ACTIVE' : 'EXPIRED'}
              </Text>
            </View>
          </View>
          {sub?.isTrial && sub.trialEndsAt ? (
            <Text style={styles.subNote}>
              Trial ends: {formatDate(sub.trialEndsAt)}
            </Text>
          ) : null}
          {sub?.currentPeriodEnd && !['admin', 'free', 'exempt', 'legacy'].includes(sub.plan) ? (
            <Text style={styles.subNote}>
              Renews: {formatDate(sub.currentPeriodEnd)}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.manageSub}
            onPress={() => router.push('/(app)/pricing')}
          >
            <Text style={styles.manageSubText}>
              {sub?.isActive && ['admin', 'free', 'exempt', 'legacy'].includes(sub.plan)
                ? 'View Subscription'
                : 'Manage Subscription'}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={styles.langRow}>
            <Text style={styles.langInfo}>
              {t('settings.english')} / {t('settings.swahili')}
            </Text>
            <LanguageSwitcher />
          </View>
        </AppCard>

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Shamba Pro v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },
  content: { padding: Spacing.base, gap: Spacing.md },
  profileCard: {},
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: Colors.text },
  profileEmail: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  profilePhone: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  section: {},
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.md },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: 4 },
  subPlan: { fontSize: 15, fontWeight: '700', color: Colors.text },
  subBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  subBadgeText: { fontSize: 10, fontWeight: '700' },
  subNote: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  manageSub: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  manageSubText: { flex: 1, fontSize: 14, color: Colors.primary, fontWeight: '500' },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langInfo: { fontSize: 14, color: Colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dangerLight,
    backgroundColor: Colors.dangerLight,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textLight },
});
