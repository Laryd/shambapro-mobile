import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppCard from '@/components/ui/AppCard';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  getAdminSettings,
  getAdminUsers,
  updateAdminSettings,
  setUserExemption,
  type AdminUser,
} from '@/lib/api/admin';
import { formatDate } from '@/lib/utils';
import { Colors, Spacing, Radius } from '@/constants/colors';

const DURATION_OPTIONS = [
  { value: '1m',   label: '1 month' },
  { value: '2m',   label: '2 months' },
  { value: '3m',   label: '3 months' },
  { value: '6m',   label: '6 months' },
  { value: '1y',   label: '1 year' },
  { value: '2y',   label: '2 years' },
  { value: 'perm', label: 'Permanent' },
  { value: 'none', label: 'Remove' },
];

function addDuration(value: string): string | null {
  const now = new Date();
  if (value === 'none') return null;
  if (value === 'perm') {
    return new Date(now.getFullYear() + 50, now.getMonth(), now.getDate()).toISOString();
  }
  const n = parseInt(value);
  const unit = value.slice(-1);
  const d = new Date(now);
  if (unit === 'm') d.setMonth(d.getMonth() + n);
  if (unit === 'y') d.setFullYear(d.getFullYear() + n);
  return d.toISOString();
}

function formatExemptUntil(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (d.getFullYear() > new Date().getFullYear() + 30) return 'Permanent';
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface PlanBadgeInfo {
  label: string;
  color: string;
  bg: string;
}

function getPlanBadge(user: AdminUser): PlanBadgeInfo {
  const sub = user.subscription;
  const now = new Date();

  if (sub?.exemptUntil && new Date(sub.exemptUntil) > now) {
    return { label: 'Exempt', color: Colors.info, bg: Colors.infoLight };
  }
  if (!sub || sub.plan === 'none') {
    return { label: 'No plan', color: Colors.textMuted, bg: Colors.gray100 };
  }
  if (sub.plan === 'free_trial') {
    const active = sub.trialEndsAt && new Date(sub.trialEndsAt) > now;
    return active
      ? { label: 'Trial', color: Colors.primary, bg: Colors.primaryLight }
      : { label: 'Expired', color: Colors.danger, bg: Colors.dangerLight };
  }
  if (sub.plan === 'monthly' || sub.plan === 'yearly') {
    const active = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > now;
    return active
      ? { label: sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1), color: Colors.warning, bg: Colors.warningLight }
      : { label: 'Expired', color: Colors.danger, bg: Colors.dangerLight };
  }
  return { label: sub.plan, color: Colors.textMuted, bg: Colors.gray100 };
}

export default function AdminScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [paymentsDisabled, setPaymentsDisabled] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState('120');
  const [yearlyPrice, setYearlyPrice] = useState('1200');
  const [savingPrices, setSavingPrices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [exemptModal, setExemptModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
  });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });

  useEffect(() => {
    if (settings !== undefined) {
      setPaymentsDisabled(settings.paymentsDisabled);
      setMonthlyPrice(String(settings.monthlyPrice ?? 120));
      setYearlyPrice(String(settings.yearlyPrice ?? 1200));
    }
  }, [settings]);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  async function handleTogglePayments(val: boolean) {
    setPaymentsDisabled(val);
    try {
      await updateAdminSettings({ paymentsDisabled: val });
    } catch (err: unknown) {
      setPaymentsDisabled(!val);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update settings');
    }
  }

  async function handleSavePrices() {
    const monthly = Number(monthlyPrice);
    const yearly = Number(yearlyPrice);
    if (!Number.isFinite(monthly) || monthly < 0 || !Number.isFinite(yearly) || yearly < 0) {
      Alert.alert('Invalid price', 'Enter valid, non-negative amounts');
      return;
    }
    setSavingPrices(true);
    try {
      await updateAdminSettings({
        monthlyPrice: Math.round(monthly),
        yearlyPrice: Math.round(yearly),
      });
      Alert.alert('Saved', 'Subscription prices updated');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update prices');
    } finally {
      setSavingPrices(false);
    }
  }

  async function handleSetExemption() {
    if (!selectedDuration) {
      Alert.alert('Error', 'Select a duration first');
      return;
    }
    setSaving(true);
    try {
      const exemptUntil = addDuration(selectedDuration);
      await setUserExemption(selectedUserId, exemptUntil);
      setExemptModal(false);
      setSelectedDuration('');
      refetch();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to set exemption');
    } finally {
      setSaving(false);
    }
  }

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('admin.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          <AppCard style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('admin.paymentsDisabled')}</Text>
                <Text style={styles.settingNote}>
                  When enabled, all users get unlimited free access
                </Text>
              </View>
              <Switch
                value={paymentsDisabled}
                onValueChange={handleTogglePayments}
                trackColor={{ false: Colors.border, true: Colors.danger }}
              />
            </View>
            {paymentsDisabled && (
              <View style={styles.freeNotice}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                <Text style={styles.freeNoticeText}>
                  Payments are disabled — all users have free access
                </Text>
              </View>
            )}
          </AppCard>

          <AppCard style={styles.settingsCard}>
            <Text style={styles.settingLabel}>Subscription Prices (KSH)</Text>
            <Text style={styles.settingNote}>
              Amounts charged via M-Pesa for each plan.
            </Text>
            <View style={styles.priceRow}>
              <View style={styles.priceField}>
                <Text style={styles.priceFieldLabel}>Monthly</Text>
                <TextInput
                  style={styles.priceInput}
                  value={monthlyPrice}
                  onChangeText={setMonthlyPrice}
                  keyboardType="number-pad"
                  placeholder="120"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <View style={styles.priceField}>
                <Text style={styles.priceFieldLabel}>Yearly</Text>
                <TextInput
                  style={styles.priceInput}
                  value={yearlyPrice}
                  onChangeText={setYearlyPrice}
                  keyboardType="number-pad"
                  placeholder="1200"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>
            <AppButton
              title={savingPrices ? 'Saving…' : 'Save Prices'}
              onPress={handleSavePrices}
              loading={savingPrices}
              fullWidth
              style={styles.savePricesBtn}
            />
          </AppCard>

          <View style={styles.usersHeader}>
            <Text style={styles.sectionTitle}>
              {t('admin.users')} ({users?.length ?? 0})
            </Text>
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email…"
              placeholderTextColor={Colors.textLight}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No users found</Text>
          )}

          {filtered.map((user) => {
            const badge = getPlanBadge(user);
            const now = new Date();
            const isExempt = user.subscription?.exemptUntil && new Date(user.subscription.exemptUntil) > now;
            return (
              <AppCard key={user._id} style={styles.userCard}>
                <View style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <View style={[styles.planBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.planBadgeText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.subscription?.trialEndsAt ? (
                      <Text style={styles.dateNote}>
                        Trial: {formatDate(user.subscription.trialEndsAt)}
                      </Text>
                    ) : null}
                    {isExempt ? (
                      <Text style={styles.exemptNote}>
                        Exempt until: {formatExemptUntil(user.subscription?.exemptUntil)}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.exemptBtn}
                    onPress={() => {
                      setSelectedUserId(user._id);
                      setSelectedUserName(user.name);
                      setSelectedDuration('');
                      setExemptModal(true);
                    }}
                  >
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.info} />
                  </TouchableOpacity>
                </View>
              </AppCard>
            );
          })}
        </ScrollView>
      </View>

      <AppModal
        visible={exemptModal}
        onClose={() => setExemptModal(false)}
        title={`Exempt: ${selectedUserName}`}
      >
        <Text style={styles.modalNote}>
          Set how long this user gets free access without subscribing.
        </Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = selectedDuration === opt.value;
            const isRemove = opt.value === 'none';
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.durationChip,
                  isSelected && (isRemove ? styles.durationChipRemove : styles.durationChipSelected),
                ]}
                onPress={() => setSelectedDuration(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.durationChipText,
                  isSelected && (isRemove ? styles.durationChipTextRemove : styles.durationChipTextSelected),
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <AppButton
          title={saving ? 'Saving…' : selectedDuration === 'none' ? 'Remove Exemption' : 'Set Exemption'}
          onPress={handleSetExemption}
          loading={saving}
          fullWidth
          variant={selectedDuration === 'none' ? 'danger' : 'primary'}
        />
      </AppModal>
    </>
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
  settingsCard: {},
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingTextWrap: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  settingNote: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  freeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  freeNoticeText: { fontSize: 12, color: Colors.primary, fontWeight: '500', flex: 1 },
  priceRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  priceField: { flex: 1 },
  priceFieldLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  savePricesBtn: { marginTop: Spacing.md },
  usersHeader: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  searchClear: { padding: 4 },
  emptyText: { textAlign: 'center', fontSize: 14, color: Colors.textMuted, paddingVertical: Spacing.xl },
  userCard: {},
  userRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  planBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 },
  planBadgeText: { fontSize: 10, fontWeight: '700' },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  dateNote: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  exemptNote: { fontSize: 12, color: Colors.info, marginTop: 2, fontWeight: '500' },
  exemptBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.infoLight,
  },
  modalNote: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.md },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  durationChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  durationChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  durationChipRemove: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  durationChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  durationChipTextSelected: { color: Colors.primary, fontWeight: '700' },
  durationChipTextRemove: { color: Colors.danger, fontWeight: '700' },
});
