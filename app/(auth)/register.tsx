import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { register } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing } from '@/constants/colors';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(vals: FormData) {
    setLoading(true);
    try {
      const { token, user } = await register({
        name: vals.name,
        email: vals.email,
        password: vals.password,
        phone: vals.phone,
      });
      await setAuth(token, user);
      router.replace('/(app)/(tabs)');
    } catch (err: unknown) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <View style={styles.langRow}>
            <LanguageSwitcher />
          </View>
        </View>

        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>Shamba Pro</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>{t('pricing.trialNote')}</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={t('auth.name')}
                value={value}
                onChangeText={onChange}
                autoComplete="name"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={t('auth.email')}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={t('auth.phone')}
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="07xx xxx xxx"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={t('auth.password')}
                value={value}
                onChangeText={onChange}
                isPassword
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={t('auth.confirmPassword')}
                value={value}
                onChangeText={onChange}
                isPassword
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <AppButton
            title={loading ? t('common.loading') : t('auth.signUp')}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            style={styles.registerBtn}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>
              {t('auth.hasAccount')}{' '}
              <Text style={styles.switchTextLink}>{t('auth.signIn')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, color: Colors.primary, fontWeight: '500' },
  langRow: {},
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing['2xl'],
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.xl },
  registerBtn: { marginTop: Spacing.sm },
  switchLink: { marginTop: Spacing.base, alignItems: 'center' },
  switchText: { fontSize: 14, color: Colors.textMuted },
  switchTextLink: { color: Colors.primary, fontWeight: '600' },
});
