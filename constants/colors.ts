export const Colors = {
  primary: '#059669',
  primaryLight: '#d1fae5',
  primaryDark: '#047857',
  secondary: '#0d9488',

  danger: '#e11d48',
  dangerLight: '#ffe4e6',
  warning: '#d97706',
  warningLight: '#fef3c7',
  success: '#059669',
  successLight: '#d1fae5',
  info: '#0284c7',
  infoLight: '#e0f2fe',

  background: '#f0fdf4',
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textLight: '#9ca3af',

  white: '#ffffff',
  black: '#000000',

  tabBar: '#ffffff',
  tabBarActive: '#059669',
  tabBarInactive: '#9ca3af',

  shadow: '#000000',

  emerald50: '#ecfdf5',
  emerald100: '#d1fae5',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065f46',

  rose50: '#fff1f2',
  rose100: '#ffe4e6',
  rose500: '#f43f5e',
  rose600: '#e11d48',

  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber500: '#f59e0b',
  amber600: '#d97706',

  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue600: '#2563eb',

  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};
