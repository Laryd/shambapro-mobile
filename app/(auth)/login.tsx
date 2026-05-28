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
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Svg, { Path } from 'react-native-svg';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Colors, Spacing } from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { User } from '@/types';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

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
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const initiateUrl = `${API_BASE}/api/mobile/auth/google-initiate?scheme=shambapro`;
      const redirectUrl = Linking.createURL('auth/google');
      const result = await WebBrowser.openAuthSessionAsync(initiateUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const parsed = new URL(result.url);
        const error = parsed.searchParams.get('error');
        if (error) {
          Alert.alert(t('common.error'), 'Google sign-in failed. Please try again.');
          return;
        }
        const token = parsed.searchParams.get('token');
        const userStr = parsed.searchParams.get('user');
        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr)) as User;
          await setAuth(token, user);
          router.replace('/(app)/(tabs)');
        }
      }
    } catch (err: unknown) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }

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

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            <GoogleIcon />
            <Text style={styles.googleText}>
              {googleLoading ? t('common.loading') : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.base,
  },
  googleText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  loginBtn: { marginTop: Spacing.sm },
  switchLink: { marginTop: Spacing.base, alignItems: 'center' },
  switchText: { fontSize: 14, color: Colors.textMuted },
  switchTextLink: { color: Colors.primary, fontWeight: '600' },
  langRow: { alignItems: 'center' },
});
