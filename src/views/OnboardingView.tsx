import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KuralButton } from 'src/components/common/KuralButton';
import { useTranslation } from 'src/content/translation';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { ColorScheme, FontSizeScale, SetupLanguageChoice, ThemeMode } from 'src/types/settings';

import { OnboardingPager } from 'src/views/onboarding/OnboardingPager';
import { OnboardingReviewPage } from 'src/views/onboarding/OnboardingReviewPage';
import { OnboardingSetupPage } from 'src/views/onboarding/OnboardingSetupPage';
import { OnboardingTourPage } from 'src/views/onboarding/OnboardingTourPage';
import { useOnboardingFlow } from 'src/views/onboarding/useOnboardingFlow';

export default function OnboardingView() {
  const { theme } = useTheme();
  const { t: tOnboarding, tSingle: tOnboardingSingle } = useTranslation('uiChrome', 'onboarding');
  const { t: tCommon } = useTranslation('uiChrome', 'common');
  const { t: tSettings, tSingle: tSettingsSingle } = useTranslation('uiChrome', 'settings');
  const flow = useOnboardingFlow(1);

  const authorOptions = useMemo(
    () =>
      [
        { label: tSettings('allAuthors'), value: '' },
        { label: tSettings('authorMVaradarajan'), value: 'mv' },
        { label: tSettings('authorSolomonPappaiah'), value: 'sp' },
        { label: tSettings('authorMKarunanidhi'), value: 'mk' },
      ] as KuralSegmentedOption<string>[],
    [tSettings],
  );

  const languageOptions = useMemo(
    () =>
      [
        {
          label: tSettingsSingle('tamilLanguage', 'tamil'),
          value: 'tamil',
        },
        {
          label: tSettingsSingle('englishLanguage', 'english'),
          value: 'english',
        },
      ] as KuralSegmentedOption<SetupLanguageChoice>[],
    [tSettingsSingle],
  );

  const themeOptions = useMemo(
    () =>
      [
        { label: tSettings('earthySage'), value: 'earthySage' },
        { label: tSettings('sandstone'), value: 'sandstone' },
        { label: tSettings('forest'), value: 'forest' },
        { label: tSettings('ocean'), value: 'ocean' },
        { label: tSettings('plum'), value: 'plum' },
        { label: tSettings('highContrast'), value: 'highContrast' },
        { label: tSettings('nightOcean'), value: 'nightOcean' },
        { label: tSettings('terracotta'), value: 'terracotta' },
        { label: tSettings('lavender'), value: 'lavender' },
        { label: tSettings('monochrome'), value: 'monochrome' },
      ] as KuralSegmentedOption<ColorScheme>[],
    [tSettings],
  );

  const appearanceOptions = useMemo(
    () =>
      [
        { label: tCommon('light'), value: 'light' },
        { label: tCommon('dark'), value: 'dark' },
        { label: tCommon('system'), value: 'system' },
      ] as KuralSegmentedOption<ThemeMode>[],
    [tCommon],
  );

  const fontSizeOptions = useMemo(
    () =>
      [
        { label: tCommon('small'), value: 'small' },
        { label: tCommon('medium'), value: 'medium' },
        { label: tCommon('large'), value: 'large' },
        { label: tCommon('xlarge'), value: 'xlarge' },
      ] as KuralSegmentedOption<FontSizeScale>[],
    [tCommon],
  );

  const languageChoice: Exclude<SetupLanguageChoice, 'both'> =
    flow.settings.fallbackLanguage === 'tamil' ? 'tamil' : 'english';
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <OnboardingSetupPage
          title={tOnboarding('welcomeTitle')}
          body={tOnboarding('setupBody')}
          setupTitle={tOnboarding('setupTitle')}
          setupBody={tOnboarding('preferencesBody')}
          languageLabel={`${tOnboardingSingle('languageLabel', 'tamil')} / ${tOnboardingSingle('languageLabel', 'english')}`}
          nameLabel={tOnboarding('nameLabel')}
          namePlaceholder={tOnboarding('namePlaceholder')}
          preferredAuthorLabel={tOnboarding('preferredAuthorLabel')}
          themeLabel={tOnboarding('colorSchemeLabel')}
          appearanceLabel={tOnboarding('appearanceLabel')}
          fontSizeLabel={tOnboarding('fontSizeLabel')}
          themeOptions={themeOptions}
          appearanceOptions={appearanceOptions}
          languageOptions={languageOptions}
          languageChoice={languageChoice}
          fontSizeOptions={fontSizeOptions}
          authorOptions={authorOptions}
          settings={flow.settings}
          nameInput={flow.nameInput}
          nameInputRef={flow.nameInputRef}
          isTextEditable
          onNameChange={flow.setNameInput}
          onNameCommit={(value) => flow.updateSettings({ userName: value.trim() })}
          onLanguageChange={(value) => {
            const showTamil = value === 'tamil';
            const showEnglish = value !== 'tamil';
            const fallbackLanguage = showTamil ? 'tamil' : 'english';
            flow.updateSettings({
              fallbackLanguage,
              langToggles: {
                ...flow.settings.langToggles,
                uiChrome: { tamil: showTamil, english: showEnglish },
                navLabels: { tamil: showTamil, english: showEnglish },
              },
            });
          }}
          onPreferredAuthorChange={(value) => flow.updateSettings({ preferredAuthorCode: value })}
          onThemeChange={(value) => flow.updateSettings({ colorScheme: value })}
          onAppearanceChange={(value) => flow.updateSettings({ themeMode: value })}
          onFontSizeChange={(value) => flow.updateSettings({ fontSizeScale: value })}
        />
        <KuralButton
          title={tOnboarding('finish')}
          variant="primary"
          onPress={flow.finish}
          style={styles.startButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  startButton: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    marginTop: 12,
  },
});
