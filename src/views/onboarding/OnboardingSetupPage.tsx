import React from 'react';
import { TextInput, View } from 'react-native';

import { KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { KuralText } from 'src/components/common/KuralText';
import { InputItem } from 'src/components/common/InputItem';
import { AppearanceInput } from 'src/components/inputs/AppearanceInput';
import { AuthorInput } from 'src/components/inputs/AuthorInput';
import { ColorSchemeInput } from 'src/components/inputs/ColorSchemeInput';
import { FontSizeInput } from 'src/components/inputs/FontSizeInput';
import { LanguageInput } from 'src/components/inputs/LanguageInput';
import { useTheme } from 'src/theme/ThemeContextProvider';
import {
  AppSettings,
  FontSizeScale,
  ColorScheme,
  TranslationLocale,
  ThemeMode,
} from 'src/types/settings';

import { OnboardingPageFrame } from 'src/views/onboarding/OnboardingPageFrame';

type OnboardingSetupPageProps = {
  title: string;
  body: string;
  setupTitle: string;
  setupBody: string;
  languageLabel: string;
  languageHelper: string;
  nameLabel: string;
  nameHelper: string;
  namePlaceholder: string;
  preferredAuthorLabel: string;
  preferredAuthorHelper: string;
  themeLabel: string;
  themeHelper?: string;
  appearanceLabel: string;
  appearanceHelper: string;
  fontSizeLabel: string;
  fontSizeHelper: string;
  themeOptions: KuralSegmentedOption<ColorScheme>[];
  appearanceOptions: KuralSegmentedOption<ThemeMode>[];
  languageOptions: KuralSegmentedOption<TranslationLocale>[];
  languageChoice: TranslationLocale;
  fontSizeOptions: KuralSegmentedOption<FontSizeScale>[];
  authorOptions: KuralSegmentedOption<string>[];
  settings: Pick<
    AppSettings,
    'language' | 'preferredAuthorCode' | 'colorScheme' | 'themeMode' | 'fontSizeScale'
  >;
  nameInput: string;
  nameInputRef: React.RefObject<React.ElementRef<typeof TextInput> | null>;
  onNameChange: (value: string) => void;
  onNameCommit: (value: string) => void;
  onLanguageChange: (value: TranslationLocale) => void;
  onPreferredAuthorChange: (value: string) => void;
  onThemeChange: (value: ColorScheme) => void;
  onAppearanceChange: (value: ThemeMode) => void;
  onFontSizeChange: (value: FontSizeScale) => void;
};

export function OnboardingSetupPage({
  title,
  body,
  setupTitle,
  setupBody,
  languageLabel,
  languageHelper,
  nameLabel,
  nameHelper,
  namePlaceholder,
  preferredAuthorLabel,
  preferredAuthorHelper,
  themeHelper,
  themeLabel,
  appearanceLabel,
  appearanceHelper,
  fontSizeLabel,
  fontSizeHelper,
  themeOptions,
  appearanceOptions,
  languageOptions,
  languageChoice,
  fontSizeOptions,
  authorOptions,
  settings,
  nameInput,
  nameInputRef,
  onNameChange,
  onNameCommit,
  onLanguageChange,
  onPreferredAuthorChange,
  onThemeChange,
  onAppearanceChange,
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
        <KuralText
          variant="caption"
          style={{ color: theme.colors.textSecondary, textAlign: 'center' }}
        >
          {setupTitle}
        </KuralText>
        <KuralText
          variant="bodyNormal"
          style={{ color: theme.colors.textSecondary, textAlign: 'center' }}
        >
          {setupBody}
        </KuralText>

        <LanguageInput
          label={languageLabel}
          helperText={languageHelper}
          options={languageOptions}
          selected={languageChoice}
          onSelect={onLanguageChange}
        />

        <FontSizeInput
          label={fontSizeLabel}
          helperText={fontSizeHelper}
          options={fontSizeOptions}
          selected={settings.fontSizeScale}
          onSelect={onFontSizeChange}
        />

        <InputItem label={nameLabel} helperText={nameHelper}>
          <TextInput
            ref={nameInputRef}
            value={nameInput}
            onChangeText={onNameChange}
            onBlur={() => onNameCommit(nameInput)}
            onSubmitEditing={() => onNameCommit(nameInput)}
            editable
            showSoftInputOnFocus
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
        </InputItem>

        {settings.language === 'tamil' ? (
          <AuthorInput
            label={preferredAuthorLabel}
            helperText={preferredAuthorHelper}
            options={authorOptions}
            selected={settings.preferredAuthorCode}
            onSelect={onPreferredAuthorChange}
          />
        ) : null}

        <ColorSchemeInput
          label={themeLabel}
          helperText={themeHelper}
          options={themeOptions}
          selected={settings.colorScheme}
          onSelect={onThemeChange}
          accessibilityLabel={themeLabel}
        />

        <AppearanceInput
          label={appearanceLabel}
          helperText={appearanceHelper}
          options={appearanceOptions}
          selected={settings.themeMode}
          onSelect={onAppearanceChange}
        />
      </View>
    </OnboardingPageFrame>
  );
}
