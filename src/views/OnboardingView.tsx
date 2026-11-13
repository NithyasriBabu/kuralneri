import { isGuruEnabled } from 'src/config/featureFlags';

import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KuralText } from 'src/components/common/KuralText';
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
  const { t: tOnboarding } = useTranslation('uiChrome', 'onboarding');
  const { t: tCommon } = useTranslation('uiChrome', 'common');
  const { t: tSettings } = useTranslation('uiChrome', 'settings');
  const { t: tNavigation } = useTranslation('uiChrome', 'navigation');
  const { width } = useWindowDimensions();
  const pageWidth = Math.max(width - 32, 1);

  const flow = useOnboardingFlow(pageWidth);

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
        { label: tSettings('bothLanguages'), value: 'both' },
        { label: tSettings('tamilLanguage'), value: 'tamil' },
        { label: tSettings('englishLanguage'), value: 'english' },
      ] as KuralSegmentedOption<SetupLanguageChoice>[],
    [tSettings],
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

  const selectedAuthorLabel =
    authorOptions.find((option) => option.value === flow.settings.preferredAuthorCode)?.label ??
    tSettings('allAuthors');
  const languageChoice: SetupLanguageChoice =
    flow.settings.langToggles.uiChrome.tamil && flow.settings.langToggles.uiChrome.english
      ? 'both'
      : flow.settings.langToggles.uiChrome.tamil
        ? 'tamil'
        : 'english';
  const selectedThemeLabel =
    themeOptions.find((option) => option.value === flow.settings.colorScheme)?.label ??
    tSettings('earthySage');
  const selectedFontSizeLabel =
    fontSizeOptions.find((option) => option.value === flow.settings.fontSizeScale)?.label ??
    tCommon('medium');
  const selectedLanguageLabel =
    languageOptions.find((option) => option.value === languageChoice)?.label ??
    tSettings('bothLanguages');

  const pages = [
    <OnboardingSetupPage
      key="setup"
      title={tOnboarding('welcomeTitle')}
      body={tOnboarding('welcomeBody')}
      setupTitle={tOnboarding('setupTitle')}
      setupBody={tOnboarding('setupBody')}
      languageLabel={tOnboarding('languageLabel')}
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
      isTextEditable={flow.activeStep === 0}
      onNameChange={flow.setNameInput}
      onNameCommit={(value) => flow.updateSettings({ userName: value.trim() })}
      onLanguageChange={(value) => {
        const fallbackLanguage = value === 'tamil' ? 'tamil' : 'english';
        const showTamil = value === 'both' || value === 'tamil';
        const showEnglish = value === 'both' || value === 'english';
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
    />,
    <OnboardingTourPage
      key="tour"
      title={tOnboarding('tourTitle')}
      body={tOnboarding(isGuruEnabled() ? 'tourBody' : 'readerTourBody')}
      cards={[
        { title: tNavigation('exploreTitle'), body: tOnboarding('exploreCardBody') },
        { title: tNavigation('bookmarksTitle'), body: tOnboarding('bookmarksCardBody') },
        ...(isGuruEnabled()
          ? [{ title: tNavigation('guruTitle'), body: tOnboarding('guruCardBody') }]
          : []),
        { title: tNavigation('settingsTitle'), body: tOnboarding('settingsCardBody') },
      ]}
    />,
    <OnboardingReviewPage
      key="review"
      title={tOnboarding('reviewTitle')}
      body={tOnboarding('reviewBody')}
      rows={[
        { label: tOnboarding('nameLabel'), value: flow.settings.userName || tOnboarding('namePlaceholder') },
        { label: tOnboarding('languageLabel'), value: selectedLanguageLabel },
        { label: tOnboarding('preferredAuthorLabel'), value: selectedAuthorLabel },
        { label: tOnboarding('themeLabel'), value: selectedThemeLabel },
        { label: tOnboarding('appearanceLabel'), value: appearanceOptions.find((option) => option.value === flow.settings.themeMode)?.label ?? tCommon('system') },
        { label: tOnboarding('fontSizeLabel'), value: selectedFontSizeLabel },
      ]}
    />,
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tOnboarding('skip')}
            onPress={flow.skip}
            style={[
              styles.skipButton,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <KuralText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {tOnboarding('skip')}
            </KuralText>
          </Pressable>
        </View>

        <OnboardingPager
          pageWidth={pageWidth}
          activeStep={flow.activeStep}
          scrollX={flow.scrollX}
          scrollRef={flow.scrollRef}
          pages={pages}
          finishLabel={tOnboarding('finish')}
          stepLabel={tOnboarding('stepLabel')}
          onFinish={flow.finish}
          onStepPress={flow.goToStep}
          onScrollBeginDrag={flow.handleScrollBeginDrag}
          onMomentumScrollEnd={flow.handleMomentumScrollEnd}
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
  headerRow: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
