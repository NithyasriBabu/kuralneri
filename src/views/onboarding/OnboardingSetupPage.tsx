import React from 'react';
import { TextInput, View } from 'react-native';

import {
  KuralSegmentedControl,
  KuralSegmentedOption,
} from 'src/components/common/KuralSegmentedControl';
import { KuralDropdown } from 'src/components/common/KuralDropdown';
import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { FONT_SIZE_MULTIPLIERS } from 'src/types/settings';
import { getColorSchemeSwatches } from 'src/theme/styles';
import {
  AppSettings,
  FontSizeScale,
  SetupLanguageChoice,
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
  nameLabel: string;
  namePlaceholder: string;
  preferredAuthorLabel: string;
  themeLabel: string;
  appearanceLabel: string;
  fontSizeLabel: string;
  themeOptions: KuralSegmentedOption<ColorScheme>[];
  appearanceOptions: KuralSegmentedOption<ThemeMode>[];
  languageOptions: KuralSegmentedOption<SetupLanguageChoice>[];
  languageChoice: SetupLanguageChoice;
  fontSizeOptions: KuralSegmentedOption<FontSizeScale>[];
  authorOptions: KuralSegmentedOption<string>[];
  settings: Pick<
    AppSettings,
    'fallbackLanguage' | 'preferredAuthorCode' | 'colorScheme' | 'themeMode' | 'fontSizeScale'
  >;
  nameInput: string;
  nameInputRef: React.RefObject<React.ElementRef<typeof TextInput> | null>;
  isTextEditable: boolean;
  onNameChange: (value: string) => void;
  onNameCommit: (value: string) => void;
  onLanguageChange: (value: SetupLanguageChoice) => void;
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
  nameLabel,
  namePlaceholder,
  preferredAuthorLabel,
  themeLabel,
  appearanceLabel,
  fontSizeLabel,
  themeOptions,
  appearanceOptions,
  languageOptions,
  languageChoice,
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

        <KuralSegmentedControl
          options={languageOptions}
          selected={languageChoice}
          label={languageLabel}
          onSelect={onLanguageChange}
        />

        <KuralSegmentedControl
          options={fontSizeOptions}
          selected={settings.fontSizeScale}
          label={fontSizeLabel}
          onSelect={onFontSizeChange}
          shrinkToContent
          optionFontSizes={{
            small: Math.round(12 * FONT_SIZE_MULTIPLIERS.small),
            medium: Math.round(12 * FONT_SIZE_MULTIPLIERS.medium),
            large: Math.round(12 * FONT_SIZE_MULTIPLIERS.large),
            xlarge: Math.round(12 * FONT_SIZE_MULTIPLIERS.xlarge),
          }}
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

        <KuralSegmentedControl
          options={authorOptions}
          selected={settings.preferredAuthorCode}
          label={preferredAuthorLabel}
          onSelect={onPreferredAuthorChange}
        />

        <KuralDropdown
          label={themeLabel}
          items={themeOptions.map((option) => ({
            ...option,
            swatchColors: getColorSchemeSwatches(option.value, theme.dark ? 'dark' : 'light'),
          }))}
          selectedValue={settings.colorScheme}
          onValueChange={(value) => onThemeChange(value as ColorScheme)}
          showItemLabels={false}
        />

        <KuralSegmentedControl
          options={appearanceOptions}
          selected={settings.themeMode}
          label={appearanceLabel}
          onSelect={onAppearanceChange}
        />
      </View>
    </OnboardingPageFrame>
  );
}
