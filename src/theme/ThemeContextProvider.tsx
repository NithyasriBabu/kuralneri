// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

import { AppTheme, ThemeContextType, ThemeMode } from 'src/theme/types';
import { DarkEarthyTheme, EarthyTheme } from 'src/theme/styles';

import { createGlobalStyles } from 'src/theme/global.styles';
import { createComponentStyles } from 'src/theme/component.styles';
import { loadThemeMode, saveThemeMode } from 'src/data/services/themePreferences';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const WIDE_SCREEN_BREAKPOINT = 768;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const resolvedThemeMode = themeMode ?? systemThemeMode;
  const baseTheme = resolvedThemeMode === 'dark' ? DarkEarthyTheme : EarthyTheme;

  const contextValue = useMemo<ThemeContextType>(() => {
    const responsiveTheme: AppTheme = {
      ...baseTheme,
      isWideScreen,
      layout: {
        ...baseTheme.layout,
        isWideScreen,
        gridGap: isWideScreen ? 20 : 12,
        screenPadding: isWideScreen ? 32 : 16,
        maxContentWidth: 1200,
      },
    };

    // 2. Feed the combined responsive tokens directly into style generation layers
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
  }, [baseTheme, isWideScreen, resolvedThemeMode]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
