import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Locale } from '@/types';

const LANGUAGE_KEY = 'shamba_pro_language';

interface SettingsState {
  language: Locale;
  setLanguage: (lang: Locale) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'en',

  setLanguage: async (lang) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch {}
    set({ language: lang });
  },

  loadLanguage: async () => {
    try {
      const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (lang === 'en' || lang === 'sw') {
        set({ language: lang });
      }
    } catch {}
  },
}));
