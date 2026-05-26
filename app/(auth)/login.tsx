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
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing } from '@/constants/colors';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
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
      const { token, user } = await login({ email: vals.email, password: vals.password });
      await setAuth(token, user);
      router.replace('/(app)/(tabs)');
    } catch (err: unknown) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : 'Login failed'
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
          { paddingTop: insets.top + Spacing['2xl'], paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>Shamba Pro</Text>
          <Text style={styles.tagline}>Sugarcane Farm Management</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('auth.login')}</Text>

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
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={t('auth.password')}
                value={value}
                onChangeText={onChange}
                isPassword
                autoComplete="password"
                error={errors.password?.message}
              />
            )}
          />

          <AppButton
            title={loading ? t('common.loading') : t('auth.signIn')}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            style={styles.loginBtn}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>
              {t('auth.noAccount')}{' '}
              <Text style={styles.switchTextLink}>{t('auth.signUp')}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.langRow}>
          <LanguageSwitcher />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base },
  logoWrap: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  tagline: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing['2xl'],
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: Spacing.xl },
  loginBtn: { marginTop: Spacing.sm },
  switchLink: { marginTop: Spacing.base, alignItems: 'center' },
  switchText: { fontSize: 14, color: Colors.textMuted },
  switchTextLink: { color: Colors.primary, fontWeight: '600' },
  langRow: { alignItems: 'center' },
});
