import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';

import { KuralText } from './KuralText';

export function ThemeToggle() {
  const { themeMode, toggleThemeMode, componentStyles } = useTheme();
  const currentModeLabel = themeMode === 'dark' ? 'Dark' : 'Light';
  const nextModeLabel = themeMode === 'dark' ? 'Light' : 'Dark';
  const icon = themeMode === 'dark' ? '☾' : '☀';

  return (
    <Pressable onPress={toggleThemeMode} style={componentStyles.themeToggleButton}>
      <KuralText variant="bodyNormal" style={componentStyles.themeToggleIcon}>
        {icon}
      </KuralText>
      <View style={componentStyles.themeToggleTextGroup}>
        <KuralText variant="caption" style={componentStyles.themeToggleLabel}>
          Current
        </KuralText>
        <KuralText variant="bodyNormal" style={componentStyles.themeToggleValue}>
          {currentModeLabel}
        </KuralText>
        <KuralText variant="caption" style={componentStyles.themeToggleLabel}>
          Tap for {nextModeLabel}
        </KuralText>
      </View>
    </Pressable>
  );
}
