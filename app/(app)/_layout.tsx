import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { getMe } from '@/lib/api/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useState } from 'react';

export default function AppLayout() {
  const { token, isHydrated, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    (async () => {
      try {
        const user = await getMe();
        await updateUser(user);
      } catch {
        await logout();
        router.replace('/(auth)/login');
      } finally {
        setVerifying(false);
      }
    })();
  }, [isHydrated, token]);

  if (!isHydrated || verifying) {
    return <LoadingScreen message="Loading your farm…" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
