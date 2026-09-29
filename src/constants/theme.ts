/**
 * Fitness App Theme
 * Premium dark fitness UI with electric accent colors.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Fitness app specific colors (always dark-mode-first)
export const FitnessColors = {
  background: '#0D0D0F',
  backgroundCard: '#161618',
  backgroundElement: '#1E1E22',
  backgroundSelected: '#252529',
  border: '#2A2A2F',

  text: '#FFFFFF',
  textSecondary: '#9A9AA8',
  textMuted: '#5A5A68',

  accent: '#E2FF3A',        // Electric lime-yellow — primary CTA
  accentDim: '#B8D020',     // Dimmer accent
  accentBg: '#1C2200',      // Very dark accent background

  blue: '#4D8EF7',
  blueDim: '#1E3A7A',
  blueBg: '#0A1533',

  orange: '#FF7A2E',
  orangeDim: '#AA4A10',
  orangeBg: '#1F0F00',

  purple: '#9B59F5',
  purpleDim: '#5A20C0',
  purpleBg: '#12053D',

  green: '#2ECC71',
  greenDim: '#1A8A4A',
  greenBg: '#021A0C',

  red: '#FF4C4C',
  redBg: '#1F0000',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
