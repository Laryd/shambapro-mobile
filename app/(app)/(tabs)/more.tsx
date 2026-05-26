import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing, Radius, Shadow } from '@/constants/colors';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  iconBg?: string;
  badge?: string;
  badgeColor?: string;
  isDestructive?: boolean;
}

function MenuItem({ icon, label, onPress, iconColor = Colors.primary, iconBg = Colors.primaryLight, badge, badgeColor = Colors.primary, isDestructive }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, isDestructive && styles.destructive]}>{label}</Text>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
      )}
    </TouchableOpacity>
  );
}

function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const admins = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim());
  return admins.includes(email);
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <Text style={styles.pageTitle}>{t('nav.more')}</Text>

      {user ? (
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>
                {user.subscription.plan.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics & Budgets</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="analytics-outline"
            label={t('nav.analytics')}
            onPress={() => router.push('/(app)/analytics')}
          />
          <MenuItem
            icon="calculator-outline"
            label={t('nav.budgets')}
            onPress={() => router.push('/(app)/budgets')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="card-outline"
            label={t('nav.subscription')}
            onPress={() => router.push('/(app)/pricing')}
            iconColor={Colors.warning}
            iconBg={Colors.warningLight}
          />
          <MenuItem
            icon="settings-outline"
            label={t('settings.title')}
            onPress={() => router.push('/(app)/settings')}
            iconColor={Colors.gray600}
            iconBg={Colors.gray100}
          />
          {isAdminEmail(user?.email) ? (
            <MenuItem
              icon="shield-outline"
              label={t('nav.admin')}
              onPress={() => router.push('/(app)/admin')}
              iconColor={Colors.info}
              iconBg={Colors.infoLight}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={[styles.menuCard, styles.langCard]}>
          <Text style={styles.menuLabel}>Display Language</Text>
          <LanguageSwitcher />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label={t('settings.logout')}
            onPress={confirmLogout}
            iconColor={Colors.danger}
            iconBg={Colors.dangerLight}
            isDestructive
          />
        </View>
      </View>

      <Text style={styles.version}>Shamba Pro v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadow.md,
    gap: Spacing.md,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: { fontSize: 22, fontWeight: '700', color: Colors.white },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  planText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.text },
  destructive: { color: Colors.danger },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
});
