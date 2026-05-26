import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppCard from '@/components/ui/AppCard';
import AppInput from '@/components/ui/AppInput';
import AppModal from '@/components/ui/AppModal';
import AppButton from '@/components/ui/AppButton';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { getAdminUsers, updateAdminSettings, setUserExemption } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';

export default function AdminScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [paymentsDisabled, setPaymentsDisabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exemptModal, setExemptModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [exemptDate, setExemptDate] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });

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

  async function handleSetExemption() {
    if (!exemptDate) {
      Alert.alert('Error', 'Enter a valid date (yyyy-mm-dd)');
      return;
    }
    setSaving(true);
    try {
      await setUserExemption(selectedUserId, new Date(exemptDate).toISOString());
      setExemptModal(false);
      refetch();
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to set exemption');
    } finally {
      setSaving(false);
    }
  }

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
              <View>
                <Text style={styles.settingLabel}>{t('admin.paymentsDisabled')}</Text>
                <Text style={styles.settingNote}>Disables M-Pesa STK push globally</Text>
              </View>
              <Switch
                value={paymentsDisabled}
                onValueChange={handleTogglePayments}
                trackColor={{ true: Colors.danger }}
              />
            </View>
          </AppCard>

          <Text style={styles.sectionTitle}>{t('admin.users')} ({users?.length ?? 0})</Text>

          {(users ?? []).map((user) => (
            <AppCard key={user._id} style={styles.userCard}>
              <View style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.planRow}>
                    <Text style={styles.planLabel}>
                      {user.subscription.plan.replace('_', ' ')} ·{' '}
                    </Text>
                    <Text style={[
                      styles.planStatus,
                      { color: user.subscription.status === 'active' ? Colors.primary : Colors.danger },
                    ]}>
                      {user.subscription.status}
                    </Text>
                  </View>
                  {user.subscription.trialEndsAt ? (
                    <Text style={styles.dateNote}>
                      Trial: {formatDate(user.subscription.trialEndsAt)}
                    </Text>
                  ) : null}
                  {user.subscription.exemptUntil ? (
                    <Text style={styles.exemptNote}>
                      Exempt until: {formatDate(user.subscription.exemptUntil)}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.exemptBtn}
                  onPress={() => {
                    setSelectedUserId(user._id);
                    setSelectedUserName(user.name);
                    setExemptDate('');
                    setExemptModal(true);
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.info} />
                </TouchableOpacity>
              </View>
            </AppCard>
          ))}
        </ScrollView>
      </View>

      <AppModal
        visible={exemptModal}
        onClose={() => setExemptModal(false)}
        title={`Exempt: ${selectedUserName}`}
      >
        <Text style={styles.modalNote}>
          Set an exemption date — user won't be asked to subscribe until this date.
        </Text>
        <AppInput
          label="Exempt Until (yyyy-mm-dd)"
          value={exemptDate}
          onChangeText={setExemptDate}
          placeholder="e.g. 2025-12-31"
        />
        <AppButton
          title={saving ? 'Saving…' : 'Set Exemption'}
          onPress={handleSetExemption}
          loading={saving}
          fullWidth
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
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  settingNote: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  userCard: {},
  userRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  planRow: { flexDirection: 'row', marginTop: 4 },
  planLabel: { fontSize: 12, color: Colors.textMuted },
  planStatus: { fontSize: 12, fontWeight: '600' },
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
});
