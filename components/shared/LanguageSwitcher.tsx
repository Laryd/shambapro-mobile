import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { updateLanguage } from '@/lib/api/auth';
import i18n from '@/lib/i18n';
import { Colors, Radius, Spacing } from '@/constants/colors';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useSettingsStore();
  const { user, updateUser } = useAuthStore();

  async function handleSelect(lang: 'en' | 'sw') {
    if (lang === language) return;
    await setLanguage(lang);
    i18n.changeLanguage(lang);
    try {
      await updateLanguage(lang);
      if (user) {
        await updateUser({ ...user, language: lang });
      }
    } catch {}
  }

  return (
    <View style={styles.container}>
      {(['en', 'sw'] as const).map((lang) => (
        <TouchableOpacity
          key={lang}
          onPress={() => handleSelect(lang)}
          style={[styles.btn, language === lang && styles.active]}
        >
          <Text style={[styles.text, language === lang && styles.activeText]}>
            {lang.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.md,
    padding: 3,
  },
  btn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  active: { backgroundColor: Colors.surface },
  text: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  activeText: { color: Colors.primary },
});
