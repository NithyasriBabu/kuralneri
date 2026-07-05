import React from 'react';
import { View } from 'react-native';

import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';

import { OnboardingPageFrame } from 'src/views/onboarding/OnboardingPageFrame';

type OnboardingTourPageProps = {
  title: string;
  body: string;
  cards: Array<{ title: string; body: string }>;
};

export function OnboardingTourPage({ title, body, cards }: OnboardingTourPageProps) {
  const { theme } = useTheme();

  return (
    <OnboardingPageFrame title={title} body={body} centered>
      <View style={{ gap: 10 }}>
        {cards.map((card) => (
          <View
            key={card.title}
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceElevated,
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              gap: 4,
              flexGrow: 1,
              minWidth: 140,
            }}
          >
            <KuralText variant="bodyNormal" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {card.title}
            </KuralText>
            <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {card.body}
            </KuralText>
          </View>
        ))}
      </View>
    </OnboardingPageFrame>
  );
}
