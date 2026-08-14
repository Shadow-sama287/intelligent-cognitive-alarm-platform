import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'icap_theme_preference';

// ─── Light tokens — mirrors .theme-web "Lumina Analytics" from theme.css ────
export const lightColors = {
  // Surfaces
  background:               '#f7f9fb',
  surfaceContainerLowest:   '#ffffff',
  surfaceContainerLow:      '#f2f4f6',
  surfaceContainer:         '#eceef0',
  surfaceContainerHigh:     '#e6e8ea',
  surfaceContainerHighest:  '#e0e3e5',

  // Text
  onSurface:                '#191c1e',
  onSurfaceVariant:         '#4e4444',
  inverseSurface:           '#2d3133',
  inverseOnSurface:         '#eff1f3',

  // Outline
  outline:                  '#807474',
  outlineVariant:           '#d1c3c3',

  // Primary — Deep Navy/Ebony
  primary:                  '#000000',
  onPrimary:                '#ffffff',
  primaryContainer:         '#241919',
  onPrimaryContainer:       '#918080',
  inversePrimary:           '#d5c2c1',

  // Secondary — Amber
  secondary:                '#855300',
  onSecondary:              '#ffffff',
  secondaryContainer:       '#fea619',
  onSecondaryContainer:     '#684000',

  // Tertiary — Coral
  tertiary:                 '#000000',
  onTertiary:               '#ffffff',
  tertiaryContainer:        '#fb7185',
  onTertiaryContainer:      '#ffd9db',

  // Semantic
  error:                    '#ba1a1a',
  onError:                  '#ffffff',
  errorContainer:           '#ffdad6',
  onErrorContainer:         '#410002',
  amberAccent:              '#855300',
  sageSuccess:              '#3d6b31',

  // Challenge type colors
  challengeMath:            '#fb7185',
  challengeMemory:          '#855300',
  challengeLogic:           '#3d6b31',
};

// ─── Dark tokens — "Lumina Mind" (already defined in colors.js) ─────────────
export const darkColors = {
  background:               '#1b1111',
  surfaceContainerLowest:   '#150b0b',
  surfaceContainerLow:      '#241919',
  surfaceContainer:         '#281d1d',
  surfaceContainerHigh:     '#332828',
  surfaceContainerHighest:  '#3e3232',
  onSurface:                '#f1dada',
  onSurfaceVariant:         '#d8c2c2',
  inverseSurface:           '#f1dada',
  inverseOnSurface:         '#3e2020',
  outline:                  '#a08888',
  outlineVariant:           '#534343',
  primary:                  '#ffb2b9',
  onPrimary:                '#67001f',
  primaryContainer:         '#fb7185',
  onPrimaryContainer:       '#ffd9db',
  inversePrimary:           '#904a56',
  secondary:                '#c3c6d7',
  onSecondary:              '#2c2f42',
  secondaryContainer:       '#434659',
  onSecondaryContainer:     '#dfe2f3',
  tertiary:                 '#bcc7de',
  onTertiary:               '#253146',
  tertiaryContainer:        '#3c4860',
  onTertiaryContainer:      '#d9e3fb',
  error:                    '#ffb4ab',
  onError:                  '#690005',
  errorContainer:           '#93000a',
  onErrorContainer:         '#ffdad6',
  amberAccent:              '#f59e0b',
  sageSuccess:              '#87a878',
  challengeMath:            '#ffb2b9',
  challengeMemory:          '#c3c6d7',
  challengeLogic:           '#f59e0b',
};

// ─── Context ─────────────────────────────────────────────────────────────────
const ThemeContext = createContext({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true); // default: dark (mobile identity)

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved !== null) setIsDark(saved === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Use this in every screen/component instead of importing colors directly.
 * 
 * @example
 * const { colors, isDark, toggleTheme } = useTheme();
 */
export function useTheme() {
  return useContext(ThemeContext);
}
