import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KuralButton } from 'src/components/common/KuralButton';
import { useTranslation } from 'src/content/translation';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { createAppearanceOptions, createAuthorOptions, createColorSchemeOptions, createFontSizeOptions, createLanguageOptions } from 'src/views/settings/settingsOptions';

import { OnboardingSetupPage } from 'src/views/onboarding/OnboardingSetupPage';
import { useOnboardingFlow } from 'src/views/onboarding/useOnboardingFlow';

export default function OnboardingView() {
  const { theme } = useTheme();
  const { t: tOnboarding, tSingle: tOnboardingSingle } = useTranslation('uiChrome', 'onboarding');
  const { t: tCommon } = useTranslation('uiChrome', 'common');
  const { t: tSettings, tSingle: tSettingsSingle } = useTranslation('uiChrome', 'settings');
  const flow = useOnboardingFlow();
  const authorOptions = createAuthorOptions(tSettings);
  const languageOptions = createLanguageOptions(tSettingsSingle);
  const themeOptions = createColorSchemeOptions(tSettings);
  const appearanceOptions = createAppearanceOptions(tCommon);
  const fontSizeOptions = createFontSizeOptions(tCommon);
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
          languageLabel={tOnboardingSingle('languageLabel', flow.settings.language)}
          languageHelper={tSettings('languageHelp')}
          nameLabel={tOnboarding('nameLabel')}
          nameHelper={tSettings('usedToGreetYou')}
          namePlaceholder={tOnboarding('namePlaceholder')}
          preferredAuthorLabel={tOnboarding('preferredAuthorLabel')}
          preferredAuthorHelper={tSettings('commentaryShownFirst')}
          themeLabel={tOnboarding('colorSchemeLabel')}
          themeHelper={tSettings('colorSchemeHelp')}
          appearanceLabel={tOnboarding('appearanceLabel')}
          appearanceHelper={tSettings('appearanceHelp')}
          fontSizeLabel={tOnboarding('fontSizeLabel')}
          fontSizeHelper={tSettings('fontSizeHelp')}
          themeOptions={themeOptions}
          appearanceOptions={appearanceOptions}
          languageOptions={languageOptions}
          languageChoice={flow.settings.language}
          fontSizeOptions={fontSizeOptions}
          authorOptions={authorOptions}
          settings={flow.settings}
          nameInput={flow.nameInput}
          nameInputRef={flow.nameInputRef}
          onNameChange={flow.setNameInput}
          onNameCommit={(value) => flow.updateSettings({ userName: value.trim() })}
          onLanguageChange={(value) => {
            flow.setLanguage(value);
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
