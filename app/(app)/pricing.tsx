import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppButton from '@/components/ui/AppButton';
import AppCard from '@/components/ui/AppCard';
import { getSubscription, initiateMpesaPayment, checkPaymentStatus } from '@/lib/api/subscription';
import { getPublicSettings } from '@/lib/api/settings';
import { useAuthStore } from '@/store/authStore';
import { daysLeft, formatDate } from '@/lib/utils';
import { Colors, Spacing } from '@/constants/colors';

const FEATURES = [
  'Unlimited plot management',
  'Expense & harvest tracking',
  'Loan management',
  'Season budgets',
  'Farm analytics & charts',
  'English & Swahili support',
];

export default function PricingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: getPublicSettings,
  });

  // Prices are admin-configurable, so derive displayed amounts from settings.
  const monthlyPrice    = settings?.monthlyPrice ?? 120;
  const yearlyPrice     = settings?.yearlyPrice ?? 1200;
  const monthlyTotal    = monthlyPrice * 12;
  const yearlySavings   = Math.max(0, monthlyTotal - yearlyPrice);
  const effectiveMonthly = Math.round(yearlyPrice / 12);
  const yearlySavingsPct = monthlyTotal > 0 ? Math.round((yearlySavings / monthlyTotal) * 100) : 0;
  const priceAmount     = (plan === 'monthly' ? monthlyPrice : yearlyPrice).toLocaleString();

  const days = daysLeft(sub?.trialEndsAt);
  const FREE_PLANS = ['admin', 'free', 'exempt', 'legacy'];
  const hasFreeAccess = sub?.isActive && FREE_PLANS.includes(sub.plan);

  async function handleSubscribe() {
    const cleanPhone = phone.trim().replace(/\s/g, '');
    if (!cleanPhone || !/^0?7\d{8}$/.test(cleanPhone)) {
      Alert.alert('Invalid phone', 'Enter a valid M-Pesa number (07xxxxxxxx)');
      return;
    }
    setLoading(true);
    try {
      const { checkoutRequestId } = await initiateMpesaPayment({
        phone: cleanPhone,
        plan,
      });
      setCheckoutId(checkoutRequestId);
      Alert.alert(
        'Payment Requested',
        'Check your phone for the M-Pesa prompt. After payment, tap "Verify Payment".',
        [{ text: 'OK' }]
      );
    } catch (err: unknown) {
      Alert.alert('Payment Error', err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!checkoutId) return;
    setLoading(true);
    try {
      const result = await checkPaymentStatus(checkoutId);
      if (result.isActive) {
        Alert.alert('', 'Subscription activated! Thank you.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Not confirmed yet', 'Payment not yet received. Please wait and try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not verify payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('pricing.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroWrap}>
          <Text style={styles.heroTitle}>{t('pricing.title')}</Text>
          <Text style={styles.heroSub}>{t('pricing.subtitle')}</Text>
        </View>

        {sub ? (
          <AppCard style={styles.statusCard}>
            <Text style={styles.statusLabel}>{t('pricing.currentPlan')}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusPlan}>
                {sub.plan.replace('_', ' ').toUpperCase()}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: sub.isActive ? Colors.primaryLight : Colors.dangerLight },
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: sub.isActive ? Colors.primary : Colors.danger },
                ]}>
                  {sub.isActive ? t('pricing.active') : t('pricing.expired')}
                </Text>
              </View>
            </View>
            {sub.isTrial && days !== null && days > 0 ? (
              <Text style={styles.statusDays}>
                {t('pricing.trialDaysLeft', { days })}
              </Text>
            ) : null}
            {sub.currentPeriodEnd && !hasFreeAccess ? (
              <Text style={styles.statusDays}>
                Valid until {formatDate(sub.currentPeriodEnd)}
              </Text>
            ) : null}
          </AppCard>
        ) : null}

        {hasFreeAccess ? (
          <AppCard style={styles.freeCard}>
            <View style={styles.freeRow}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              <View style={styles.freeText}>
                <Text style={styles.freeTitle}>Your access is active</Text>
                <Text style={styles.freeSub}>
                  {sub?.plan === 'admin'
                    ? 'You have admin access — no payment needed.'
                    : sub?.plan === 'exempt'
                    ? `Complimentary access${sub.exemptUntil ? ' until ' + formatDate(sub.exemptUntil) : ''}.`
                    : 'Payments are currently disabled — enjoy free access.'}
                </Text>
              </View>
            </View>
          </AppCard>
        ) : (
          <>
            <View style={styles.planToggle}>
              {(['monthly', 'yearly'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.planBtn, plan === p && styles.planActive]}
                  onPress={() => setPlan(p)}
                >
                  <Text style={[styles.planText, plan === p && styles.planActiveText]}>
                    {t(`pricing.${p}`)}
                  </Text>
                  {p === 'yearly' && yearlySavingsPct > 0 ? (
                    <Text style={[styles.saveBadge, plan === p && styles.saveBadgeActive]}>
                      {t('pricing.savePct', { pct: yearlySavingsPct })}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            <AppCard style={styles.priceCard}>
              <Text style={styles.priceAmount}>
                KSH {priceAmount}
              </Text>
              <Text style={styles.pricePeriod}>
                per {plan === 'monthly' ? 'month' : 'year'}
              </Text>
              {plan === 'yearly' && yearlySavings > 0 ? (
                <Text style={styles.priceNote}>
                  Only KSH {effectiveMonthly.toLocaleString()}/month — save KSH {yearlySavings.toLocaleString()}/year
                </Text>
              ) : null}

              <View style={styles.featureList}>
                {FEATURES.map((f) => (
                  <View key={f} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </AppCard>

            <Text style={styles.trialNote}>{t('pricing.trialNote')}</Text>

            <View style={styles.phoneWrap}>
              <Text style={styles.phoneLabel}>{t('pricing.phone')}</Text>
              <View style={styles.phoneInput}>
                <Ionicons name="phone-portrait-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.phoneText}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="07xx xxx xxx"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <AppButton
              title={loading ? t('common.loading') : t('pricing.subscribe')}
              onPress={handleSubscribe}
              loading={loading}
              fullWidth
              style={styles.subscribeBtn}
            />

            {checkoutId ? (
              <AppButton
                title={loading ? 'Verifying…' : 'Verify Payment'}
                onPress={handleVerify}
                variant="outline"
                loading={loading}
                fullWidth
                style={{ marginTop: Spacing.md }}
              />
            ) : null}
          </>
        )}
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
  content: { padding: Spacing.base, gap: Spacing.lg },
  heroWrap: { alignItems: 'center', paddingVertical: Spacing.md },
  heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.primary },
  heroSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  statusCard: {},
  statusLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statusPlan: { fontSize: 16, fontWeight: '700', color: Colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  statusDays: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 4,
  },
  planBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
    gap: 2,
  },
  planActive: { backgroundColor: Colors.surface },
  planText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  planActiveText: { color: Colors.primary },
  saveBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  saveBadgeActive: { color: Colors.warning },
  priceCard: { alignItems: 'center' },
  priceAmount: { fontSize: 36, fontWeight: '800', color: Colors.primary },
  pricePeriod: { fontSize: 14, color: Colors.textMuted, marginTop: 2, marginBottom: Spacing.sm },
  priceNote: { fontSize: 13, color: Colors.success, marginBottom: Spacing.md },
  featureList: { alignSelf: 'stretch', gap: Spacing.sm },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureText: { fontSize: 14, color: Colors.textSecondary },
  freeCard: { backgroundColor: Colors.primaryLight },
  freeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  freeText: { flex: 1 },
  freeTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  freeSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  trialNote: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  phoneWrap: {},
  phoneLabel: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  phoneText: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: Spacing.md - 2 },
  subscribeBtn: {},
});
