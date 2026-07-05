import React from 'react';
import { View } from 'react-native';

import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';

import { OnboardingPageFrame } from 'src/views/onboarding/OnboardingPageFrame';

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: 2 }}>
      <KuralText variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
        {label}
      </KuralText>
      <KuralText variant="bodyNormal" style={{ color: theme.colors.textPrimary, textAlign: 'center', fontWeight: '700' }}>
        {value}
      </KuralText>
    </View>
  );
}

type OnboardingReviewPageProps = {
  title: string;
  body: string;
  rows: SummaryRowProps[];
};

export function OnboardingReviewPage({ title, body, rows }: OnboardingReviewPageProps) {
  const { theme } = useTheme();

  return (
    <OnboardingPageFrame title={title} body={body} centered>
      <View
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceElevated,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          gap: 14,
        }}
      >
        {rows.map((row) => (
          <SummaryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </View>
    </OnboardingPageFrame>
  );
}
