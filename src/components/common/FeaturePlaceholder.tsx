import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';

import { KuralText } from './KuralText';

interface FeaturePlaceholderProps {
  icon: string;
  title: string;
  subtitle: string;
  body: string;
}

export function FeaturePlaceholder({ icon, title, subtitle, body }: FeaturePlaceholderProps) {
  const { componentStyles } = useTheme();

  return (
    <View style={componentStyles.featurePlaceholderShell}>
      <View style={componentStyles.featurePlaceholderCard}>
        <KuralText variant="bodyLarge" style={componentStyles.featurePlaceholderIcon}>
          {icon}
        </KuralText>
        <KuralText variant="h2" style={componentStyles.featurePlaceholderTitle}>
          {title}
        </KuralText>
        <KuralText variant="caption" style={componentStyles.featurePlaceholderSubtitle}>
          {subtitle}
        </KuralText>
        <KuralText variant="bodyNormal" style={componentStyles.featurePlaceholderBody}>
          {body}
        </KuralText>
      </View>
    </View>
  );
}
