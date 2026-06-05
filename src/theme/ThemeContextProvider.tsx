import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

import { AppTheme, ThemeContextType, ThemeMode } from 'src/theme/types';
import { DarkEarthyTheme, EarthyTheme } from 'src/theme/styles';

import { createGlobalStyles } from 'src/theme/global.styles';
import { createComponentStyles } from 'src/theme/component.styles';
import { loadThemeMode, saveThemeMode } from 'src/data/services/themePreferences';

import { useSettings } from 'src/context/SettingsContext';

// Settings integration — optional, may not be mounted yet
import {
  FONT_SIZE_MULTIPLIERS,
  TAMIL_FONT_FAMILIES,
  ENGLISH_FONT_FAMILIES,
  FontSizeScale,
  TamilFont,
  EnglishFont,
} from 'src/types/settings';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const WIDE_SCREEN_BREAKPOINT = 768;

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Injected by SettingsProvider bridge — avoids a circular dep */
  fontSizeScale?: FontSizeScale;
  tamilFont?: TamilFont;
  englishFont?: EnglishFont;
  customBackground?: string;
  customForeground?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();
  const {
    fontSizeScale,
    tamilFont,
    englishFont,
    customBackground,
    customForeground,
    themeMode: settingsThemeMode,
  } = settings;
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isWideScreen = width >= WIDE_SCREEN_BREAKPOINT;
  const systemThemeMode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedMode = await loadThemeMode();
      if (cancelled) return;
      setThemeModeState(savedMode);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedThemeMode: ThemeMode =
    themeMode === 'system' || themeMode === null ? systemThemeMode : themeMode;

  const baseTheme = resolvedThemeMode === 'dark' ? DarkEarthyTheme : EarthyTheme;

  const contextValue = useMemo<ThemeContextType>(() => {
    const sizeMult = FONT_SIZE_MULTIPLIERS[fontSizeScale];
    const tamilFontFamily = TAMIL_FONT_FAMILIES[tamilFont];
    const englishFontFamily = ENGLISH_FONT_FAMILIES[englishFont];

    const scaledSizes = {
      h1: Math.round(24 * sizeMult),
      h2: Math.round(20 * sizeMult),
      bodyLarge: Math.round(18 * sizeMult),
      bodyNormal: Math.round(15 * sizeMult),
      caption: Math.round(12 * sizeMult),
    };

    const responsiveTheme: AppTheme = {
      ...baseTheme,
      isWideScreen,
      colors: {
        ...baseTheme.colors,
        background: customBackground || baseTheme.colors.background,
        textPrimary: customForeground || baseTheme.colors.textPrimary,
      },
      typography: {
        ...baseTheme.typography,
        fonts: {
          ...baseTheme.typography.fonts,
          tamil: tamilFontFamily,
          english: englishFontFamily,
        },
        sizes: scaledSizes,
      },
      layout: {
        ...baseTheme.layout,
        isWideScreen,
        gridGap: isWideScreen ? 20 : 12,
        screenPadding: isWideScreen ? 32 : 16,
        maxContentWidth: 1200,
      },
    };

    return {
      theme: responsiveTheme,
      globalStyles: createGlobalStyles(responsiveTheme),
      componentStyles: createComponentStyles(responsiveTheme),
      themeMode: resolvedThemeMode,
      setThemeMode: (mode: ThemeMode) => {
        setThemeModeState(mode);
        void saveThemeMode(mode);
      },
      toggleThemeMode: () => {
        const nextMode = resolvedThemeMode === 'dark' ? 'light' : 'dark';
        setThemeModeState(nextMode);
        void saveThemeMode(nextMode);
      },
    };
  }, [
    baseTheme,
    isWideScreen,
    resolvedThemeMode,
    fontSizeScale,
    tamilFont,
    englishFont,
    customBackground,
    customForeground,
  ]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
