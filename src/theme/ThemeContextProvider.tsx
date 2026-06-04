// src/context/ThemeContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

import { AppTheme, ThemeContextType } from 'src/theme/types';
import { DarkEarthyTheme, EarthyTheme } from 'src/theme/styles';

import { createGlobalStyles } from 'src/theme/global.styles';
import { createComponentStyles } from 'src/theme/component.styles';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const WIDE_SCREEN_BREAKPOINT = 768;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isWideScreen = width >= WIDE_SCREEN_BREAKPOINT;
  const baseTheme = colorScheme === 'dark' ? DarkEarthyTheme : EarthyTheme;

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
    };
  }, [baseTheme, isWideScreen]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
