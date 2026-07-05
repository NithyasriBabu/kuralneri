import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';

export function OnboardingPageFrame({
  title,
  body,
  centered,
  children,
}: {
  title: string;
  body: string;
  centered?: boolean;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.pageFrame,
        centered && styles.pageFrameCentered,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          centered && styles.contentCentered,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <KuralText variant="h2" style={{ color: theme.colors.primary, textAlign: 'center' }}>
          {title}
        </KuralText>
        <KuralText variant="bodyNormal" style={{ color: theme.colors.textPrimary, textAlign: 'center' }}>
          {body}
        </KuralText>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageFrame: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  pageFrameCentered: {
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 16,
    justifyContent: 'flex-start',
  },
  contentCentered: {
    justifyContent: 'center',
  },
});
