import React from 'react';
import { TextInput, View } from 'react-native';

import { KuralSegmentedControl, KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { AppSettings, FontSizeScale, ThemeMode, TranslationLocale } from 'src/types/settings';

import { OnboardingPageFrame } from 'src/views/onboarding/OnboardingPageFrame';

type OnboardingSetupPageProps = {
  title: string;
  body: string;
  setupTitle: string;
  setupBody: string;
  nameLabel: string;
  namePlaceholder: string;
  preferredAuthorLabel: string;
  themeLabel: string;
  fontSizeLabel: string;
  themeOptions: KuralSegmentedOption<ThemeMode>[];
  languageOptions: KuralSegmentedOption<TranslationLocale>[];
  fontSizeOptions: KuralSegmentedOption<FontSizeScale>[];
  authorOptions: KuralSegmentedOption<string>[];
  settings: Pick<
    AppSettings,
    'fallbackLanguage' | 'preferredAuthorCode' | 'themeMode' | 'fontSizeScale'
  >;
  nameInput: string;
  nameInputRef: React.RefObject<TextInput | null>;
  isTextEditable: boolean;
  onNameChange: (value: string) => void;
  onNameCommit: (value: string) => void;
  onLanguageChange: (value: TranslationLocale) => void;
  onPreferredAuthorChange: (value: string) => void;
  onThemeChange: (value: ThemeMode) => void;
  onFontSizeChange: (value: FontSizeScale) => void;
};

export function OnboardingSetupPage({
  title,
  body,
  setupTitle,
  setupBody,
  nameLabel,
  namePlaceholder,
  preferredAuthorLabel,
  themeLabel,
  fontSizeLabel,
  themeOptions,
  languageOptions,
  fontSizeOptions,
  authorOptions,
  settings,
  nameInput,
  nameInputRef,
  isTextEditable,
  onNameChange,
  onNameCommit,
  onLanguageChange,
  onPreferredAuthorChange,
  onThemeChange,
  onFontSizeChange,
}: OnboardingSetupPageProps) {
  const { theme } = useTheme();

  return (
    <OnboardingPageFrame title={title} body={body} centered>
      <View
        style={[
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceElevated,
            borderWidth: 1,
            borderRadius: 16,
            padding: 14,
            gap: 10,
            width: '100%',
          },
        ]}
      >
        <KuralText variant="caption" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          {setupTitle}
        </KuralText>
        <KuralText variant="bodyNormal" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          {setupBody}
        </KuralText>

        <KuralSegmentedControl
          options={languageOptions}
          selected={settings.fallbackLanguage}
          onSelect={onLanguageChange}
        />

        <View style={{ gap: 8 }}>
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {nameLabel}
          </KuralText>
          <TextInput
            ref={nameInputRef}
            value={nameInput}
            onChangeText={onNameChange}
            onBlur={() => onNameCommit(nameInput)}
            onSubmitEditing={() => onNameCommit(nameInput)}
            editable={isTextEditable}
            showSoftInputOnFocus={isTextEditable}
            placeholder={namePlaceholder}
            placeholderTextColor={theme.colors.disabledText}
            style={[
              {
                minHeight: 44,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fonts.english,
              },
            ]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {preferredAuthorLabel}
          </KuralText>
          <KuralSegmentedControl
            options={authorOptions}
            selected={settings.preferredAuthorCode}
            onSelect={onPreferredAuthorChange}
          />
        </View>

        <View style={{ gap: 8 }}>
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {themeLabel}
          </KuralText>
          <KuralSegmentedControl options={themeOptions} selected={settings.themeMode} onSelect={onThemeChange} />
        </View>

        <View style={{ gap: 8 }}>
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {fontSizeLabel}
          </KuralText>
          <KuralSegmentedControl
            options={fontSizeOptions}
            selected={settings.fontSizeScale}
            onSelect={onFontSizeChange}
          />
        </View>
      </View>
    </OnboardingPageFrame>
  );
}
