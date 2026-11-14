import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { PanelLeftClose, PanelLeftOpen, RefreshCcw, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { getColorSchemeSwatches } from 'src/theme/styles';
import { useSettings } from 'src/context/SettingsContext';
import { KuralText } from 'src/components/common/KuralText';
import { KuralButton } from 'src/components/common/KuralButton';
import { KuralIconButton } from 'src/components/common/KuralIconButton';
import { KuralSegmentedControl } from 'src/components/common/KuralSegmentedControl';
import { KuralDropdown } from 'src/components/common/KuralDropdown';
import { SettingsItem } from 'src/components/settings/SettingsItem';
import { CoachTarget, useCoachMark } from 'src/context/CoachMarkContext';
import { useTranslation } from 'src/content/translation';
import { transliterateEnglishNameToTamil } from 'src/content/transliteration';
import {
  LangToggleKey,
  TamilFont,
  FontSizeScale,
  ColorScheme,
  ThemeMode,
  EnglishFont,
  FONT_SIZE_MULTIPLIERS,
  TAMIL_FONT_FAMILIES,
  ENGLISH_FONT_FAMILIES,
} from 'src/types/settings';

// ─── sub-components ──────────────────────────────────────────────────────────

function RowLabel({ label, sub }: { label: string; sub?: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, paddingRight: theme.layout.isWideScreen ? 12 : 0 }}>
      <KuralText
        variant="bodyNormal"
        style={{ color: theme.colors.textPrimary, fontWeight: '600' }}
      >
        {label}
      </KuralText>
      {sub ? (
        <KuralText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
          {sub}
        </KuralText>
      ) : null}
    </View>
  );
}

type SettingsSection = 'personal' | 'display' | 'language' | 'reset';

const LANG_TOGGLE_KEYS: LangToggleKey[] = [
  'kuralCard',
  'navLabels',
  'uiChrome',
];

// ─── language table ──────────────────────────────────────────────────

function LanguageTable() {
  const { settings, updateSettings, setLangToggle } = useSettings();
  const { t, tSingle } = useTranslation('uiChrome', 'settings');
  const selected = settings.language;

  return (
    <KuralSegmentedControl
      label={tSingle('language', settings.language)}
      helperText={t('languageHelp')}
      selected={selected}
      options={[
        { label: tSingle('tamilLanguage', 'tamil'), value: 'tamil' },
        { label: tSingle('englishLanguage', 'english'), value: 'english' },
      ]}
      onSelect={(language) => {
        updateSettings({ language });
        LANG_TOGGLE_KEYS.forEach((key) => {
          setLangToggle(key, 'tamil', language === 'tamil');
          setLangToggle(key, 'english', language === 'english');
        });
      }}
    />
  );
}

// ─── main view ───────────────────────────────────────────────────────────────

export default function SettingsView() {
  const { theme } = useTheme();
  const { settings, settingsLoadWarning, updateSettings, resetSettings } = useSettings();
  const { t: tSettings, pair } = useTranslation('uiChrome', 'settings');
  const { t: tSettingsNav } = useTranslation('navLabels', 'settings');
  const { t: tOnboarding } = useTranslation('uiChrome', 'onboarding');

  const [nameInput, setNameInput] = useState(settings.userName);
  const [nameInputTamil, setNameInputTamil] = useState(settings.userNameTamil);
  const [confirmReset, setConfirmReset] = useState<'none' | 'all'>('none');
  const [activeSection, setActiveSection] = useState<SettingsSection>('personal');
  const [showSettingsTabs, setShowSettingsTabs] = useState(true);
  const scrollRef = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const { activeTarget } = useCoachMark();

  React.useEffect(() => {
    if (!activeTarget?.startsWith('settings-')) return;
    if (
      ['settings-name', 'settings-name-tamil', 'settings-author', 'settings-self-notes'].includes(
        activeTarget,
      )
    ) {
      setActiveSection('personal');
    } else if (
      [
        'settings-color-scheme',
        'settings-appearance',
        'settings-font-size',
        'settings-tamil-font',
        'settings-english-font',
      ].includes(activeTarget)
    ) {
      setActiveSection('display');
    } else if (activeTarget === 'settings-language-display') {
      setActiveSection('language');
    } else if (['settings-restart-tips', 'settings-reset-data'].includes(activeTarget)) {
      setActiveSection('reset');
    }
  }, [activeTarget]);

  React.useEffect(() => {
    if (activeTarget === 'nav-SETTINGS') setActiveSection('personal');
  }, [activeTarget]);

  const showSection = (section: SettingsSection) => activeSection === section;

  const AUTHORS = [
    { label: tSettings('allAuthors'), value: '' },
    { label: `${tSettings('authorMVaradarajan')} (mv)`, value: 'mv' },
    { label: `${tSettings('authorSolomonPappaiah')} (sp)`, value: 'sp' },
    { label: `${tSettings('authorMKarunanidhi')} (mk)`, value: 'mk' },
  ];

  const COLOR_SCHEME_OPTIONS: { label: string; value: ColorScheme }[] = [
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
  ];

  const APPEARANCE_OPTIONS: { label: string; value: ThemeMode }[] = [
    { label: `☀ ${tSettings('light')}`, value: 'light' },
    { label: `☾ ${tSettings('dark')}`, value: 'dark' },
    { label: `⚙ ${tSettings('system')}`, value: 'system' },
  ];

  const FONT_SIZE_OPTIONS: { label: string; value: FontSizeScale }[] = [
    { label: tSettings('small'), value: 'small' },
    { label: tSettings('medium'), value: 'medium' },
    { label: tSettings('large'), value: 'large' },
    { label: tSettings('xlarge'), value: 'xlarge' },
  ];

  const TAMIL_FONT_OPTIONS: { label: string; value: TamilFont }[] = [
    { label: 'Mukta Malar', value: 'MuktaMalar' },
    { label: 'Catamaran', value: 'Catamaran' },
    { label: 'Arima Madurai', value: 'ArimaMadurai' },
  ];

  const ENGLISH_FONT_OPTIONS: { label: string; value: EnglishFont }[] = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Source Serif', value: 'SourceSerif' },
  ];

  const showTamilFontOptions = settings.language === 'tamil';

  const handleConfirmReset = () => {
    if (Platform.OS === 'web') {
      // Web: use inline confirm UI (no Alert)
      setConfirmReset('all');
    } else {
      Alert.alert(tSettings('resetAllSettings'), tSettings('resetSettingsPrompt'), [
        { text: tSettings('cancel'), style: 'cancel' },
        {
          text: tSettings('reset'),
          style: 'destructive',
          onPress: () => executeReset(),
        },
      ]);
    }
  };

  const executeReset = async () => {
    setConfirmReset('none');
    await resetSettings();
    setNameInput('');
    setNameInputTamil('');
  };

  const autoFillTamilName = () => {
    const source = nameInput.trim();
    if (!source) return;
    const transliterated = transliterateEnglishNameToTamil(source);
    setNameInputTamil(transliterated);
    updateSettings({ userNameTamil: transliterated });
  };

  const row = {
    flexDirection: theme.layout.isWideScreen ? ('row' as const) : ('column' as const),
    alignItems: theme.layout.isWideScreen ? ('center' as const) : ('stretch' as const),
    justifyContent: 'space-between' as const,
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        ref={scrollRef}
        testID="print-scroll-container"
        contentContainerStyle={{
          padding: theme.layout.screenPadding,
          paddingBottom: 60,
          maxWidth: theme.layout.maxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: showSettingsTabs && theme.layout.isWideScreen ? 'row' : 'column',
            gap: 16,
            marginTop: 16,
          }}
        >
          {showSettingsTabs ? (
            <View
              style={{
                width: theme.layout.isWideScreen ? 180 : '100%',
                flexDirection: theme.layout.isWideScreen ? 'column' : 'row',
                flexWrap: theme.layout.isWideScreen ? 'nowrap' : 'wrap',
                gap: 4,
              }}
            >
              {(
                [
                  ['personal', tSettingsNav('personal')],
                  ['display', tSettingsNav('display')],
                  ['language', tSettingsNav('language')],
                  ['reset', tSettingsNav('reset')],
                ] as const
              ).map(([section, label]) => {
                const active = activeSection === section;
                return (
                  <Pressable
                    key={section}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setActiveSection(section)}
                    style={{
                      flexGrow: theme.layout.isWideScreen ? 0 : 1,
                      flexBasis: theme.layout.isWideScreen ? undefined : '48%',
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderRadius: theme.layout.borderRadius.medium,
                      borderLeftWidth: theme.layout.isWideScreen ? 3 : 0,
                      borderBottomWidth: theme.layout.isWideScreen ? 0 : 3,
                      borderColor: active ? theme.colors.primary : 'transparent',
                      backgroundColor: active ? theme.colors.accent : 'transparent',
                    }}
                  >
                    <KuralText
                      variant="caption"
                      style={{
                        color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                        fontWeight: active ? '700' : '400',
                      }}
                    >
                      {label}
                    </KuralText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={{ flex: 1, minWidth: 0 }}>
            <KuralIconButton
              icon={showSettingsTabs ? <PanelLeftClose /> : <PanelLeftOpen />}
              label={
                showSettingsTabs ? tSettings('hideSettingsTabs') : tSettings('showSettingsTabs')
              }
              onPress={() => setShowSettingsTabs((visible) => !visible)}
              showLabel={false}
              size="sm"
              style={{ alignSelf: 'flex-start', marginBottom: 8 }}
            />

            {settingsLoadWarning ? (
              <View
                style={{
                  marginTop: 12,
                  marginBottom: 10,
                  padding: 14,
                  borderRadius: theme.layout.borderRadius.medium,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceElevated,
                  gap: 10,
                }}
              >
                <KuralText
                  variant="bodyNormal"
                  style={{ color: theme.colors.primary, fontWeight: '700' }}
                >
                  {tSettings('settingsLoadWarningTitle')}
                </KuralText>
                <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
                  {tSettings('settingsLoadWarningBody')}
                </KuralText>
                <KuralButton
                  title={tSettings('restoreDefaults')}
                  variant="secondary"
                  onPress={resetSettings}
                  style={{ alignSelf: 'flex-start' }}
                />
              </View>
            ) : null}

            {showSection('personal') ? (
              <>
                {/* ── 1. Personal ─────────────────────────────────────── */}

                <CoachTarget id="settings-name" scrollRef={scrollRef}>
                  <View style={row}>
                    <RowLabel label={tSettings('yourName')} sub={tSettings('usedToGreetYou')} />
                    <TextInput
                      value={nameInput}
                      onChangeText={setNameInput}
                      onBlur={() => updateSettings({ userName: nameInput.trim() })}
                      onSubmitEditing={() => updateSettings({ userName: nameInput.trim() })}
                      placeholder={tSettings('namePlaceholder')}
                      placeholderTextColor={theme.colors.disabledText}
                      style={{
                        width: theme.layout.isWideScreen ? 180 : '100%',
                        minHeight: 40,
                        backgroundColor: theme.colors.surfaceElevated,
                        borderRadius: theme.layout.borderRadius.medium,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        paddingHorizontal: 10,
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fonts.english,
                        fontSize: theme.typography.sizes.bodyNormal,
                      }}
                      returnKeyType="done"
                    />
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-name-tamil" scrollRef={scrollRef}>
                  <View style={row}>
                    <RowLabel
                      label={tSettings('yourNameTamil')}
                      sub={tSettings('usedToGreetYouTamil')}
                    />
                    <View style={{ flex: 1, gap: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TextInput
                          value={nameInputTamil}
                          onChangeText={setNameInputTamil}
                          onBlur={() => updateSettings({ userNameTamil: nameInputTamil.trim() })}
                          onSubmitEditing={() =>
                            updateSettings({ userNameTamil: nameInputTamil.trim() })
                          }
                          placeholder={tSettings('namePlaceholder')}
                          placeholderTextColor={theme.colors.disabledText}
                          style={{
                            flex: 1,
                            minWidth: theme.layout.isWideScreen ? 130 : 0,
                            minHeight: 40,
                            backgroundColor: theme.colors.surfaceElevated,
                            borderRadius: theme.layout.borderRadius.medium,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            paddingHorizontal: 10,
                            color: theme.colors.textPrimary,
                            fontFamily: theme.typography.fonts.tamil,
                            fontSize: theme.typography.sizes.bodyNormal,
                          }}
                          returnKeyType="done"
                        />
                        <KuralIconButton
                          icon={<Sparkles />}
                          label={pair('autoFillTamilName').visible}
                          tooltip={pair('autoFillTamilName').hover}
                          onPress={autoFillTamilName}
                          size="sm"
                          style={{ alignSelf: 'stretch' }}
                        />
                      </View>
                      <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
                        {tSettings('autoFillTamilNameHelp')}
                      </KuralText>
                    </View>
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-author" scrollRef={scrollRef}>
                  <View style={{ paddingBottom: 10 }}>
                    <KuralSegmentedControl
                      options={AUTHORS}
                      selected={settings.preferredAuthorCode}
                      label={tSettings('preferredAuthor')}
                      helperText={tSettings('commentaryShownFirst')}
                      onSelect={(value) => updateSettings({ preferredAuthorCode: value })}
                    />
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-self-notes" scrollRef={scrollRef}>
                  <View style={row}>
                    <RowLabel label={tSettings('selfNotes')} sub={tSettings('selfNotesHelp')} />
                    <Switch
                      value={settings.selfNotesEnabled}
                      onValueChange={(value) => updateSettings({ selfNotesEnabled: value })}
                      trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                      thumbColor={
                        settings.selfNotesEnabled ? theme.colors.primary : theme.colors.disabledText
                      }
                    />
                  </View>
                </CoachTarget>
              </>
            ) : null}

            {showSection('display') ? (
              <>
                {/* ── 2. Display ──────────────────────────────────────── */}

                <CoachTarget id="settings-color-scheme" scrollRef={scrollRef}>
                  <View
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surface,
                    }}
                  >
                    <RowLabel label={tSettings('colorScheme')} sub={tSettings('colorSchemeHelp')} />
                    <KuralDropdown
                      items={COLOR_SCHEME_OPTIONS.map((option) => ({
                        ...option,
                        swatchColors: getColorSchemeSwatches(
                          option.value,
                          theme.dark ? 'dark' : 'light',
                        ),
                      }))}
                      selectedValue={settings.colorScheme}
                      onValueChange={(value) =>
                        updateSettings({ colorScheme: value as ColorScheme })
                      }
                      containerStyle={{ marginTop: 8 }}
                      showItemLabels={false}
                    />
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-appearance" scrollRef={scrollRef}>
                  <View
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surface,
                    }}
                  >
                    <KuralSegmentedControl
                      options={APPEARANCE_OPTIONS}
                      selected={settings.themeMode}
                      label={tSettings('appearance')}
                      helperText={tSettings('appearanceHelp')}
                      onSelect={(value) => updateSettings({ themeMode: value })}
                    />
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-font-size" scrollRef={scrollRef}>
                  <View
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surface,
                    }}
                  >
                    <KuralSegmentedControl
                      options={FONT_SIZE_OPTIONS}
                      selected={settings.fontSizeScale}
                      label={tSettings('fontSize')}
                      onSelect={(v) => updateSettings({ fontSizeScale: v })}
                      shrinkToContent
                      optionFontSizes={{
                        small: Math.round(12 * FONT_SIZE_MULTIPLIERS.small),
                        medium: Math.round(12 * FONT_SIZE_MULTIPLIERS.medium),
                        large: Math.round(12 * FONT_SIZE_MULTIPLIERS.large),
                        xlarge: Math.round(12 * FONT_SIZE_MULTIPLIERS.xlarge),
                      }}
                    />
                  </View>
                </CoachTarget>

                {showTamilFontOptions ? (
                  <CoachTarget id="settings-tamil-font" scrollRef={scrollRef}>
                    <View
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.surface,
                      }}
                    >
                      <KuralSegmentedControl
                        options={TAMIL_FONT_OPTIONS}
                        selected={settings.tamilFont}
                        label={tSettings('tamilFont')}
                        helperText={tSettings('affectsTamilRendering')}
                        onSelect={(value) => updateSettings({ tamilFont: value })}
                        renderOption={(option, active) => (
                          <View style={{ width: '100%', gap: 4 }}>
                            <KuralText
                              variant="caption"
                              style={{
                                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                                fontWeight: active ? '700' : '400',
                                textAlign: 'center',
                              }}
                            >
                              {option.label}
                            </KuralText>
                            <KuralText
                              variant="caption"
                              isTamil
                              style={{
                                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                                fontFamily: TAMIL_FONT_FAMILIES[option.value],
                                textAlign: 'center',
                              }}
                            >
                              {tSettings('fontPreviewTamil')}
                            </KuralText>
                          </View>
                        )}
                      />
                    </View>
                  </CoachTarget>
                ) : (
                  <CoachTarget id="settings-english-font" scrollRef={scrollRef}>
                    <View
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.surface,
                      }}
                    >
                      <KuralSegmentedControl
                        options={ENGLISH_FONT_OPTIONS}
                        selected={settings.englishFont}
                        label={tSettings('englishFont')}
                        helperText={tSettings('affectsEnglishRendering')}
                        onSelect={(value) => updateSettings({ englishFont: value })}
                        renderOption={(option, active) => (
                          <View style={{ width: '100%', gap: 4 }}>
                            <KuralText
                              variant="caption"
                              style={{
                                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                                fontWeight: active ? '700' : '400',
                                textAlign: 'center',
                              }}
                            >
                              {option.label}
                            </KuralText>
                            <KuralText
                              variant="caption"
                              style={{
                                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                                fontFamily: ENGLISH_FONT_FAMILIES[option.value],
                                textAlign: 'center',
                              }}
                            >
                              {tSettings('fontPreviewEnglish')}
                            </KuralText>
                          </View>
                        )}
                      />
                    </View>
                  </CoachTarget>
                )}
              </>
            ) : null}

            {showSection('language') ? (
              <>
                {/* ── 3. Language visibility ───────────────────────────── */}
                <CoachTarget id="settings-language-display" scrollRef={scrollRef}>
                  <View>
                    <KuralText
                      variant="caption"
                      style={{ color: theme.colors.textSecondary, marginBottom: 12 }}
                    >
                      {tSettings('languageHelp')}
                    </KuralText>

                    <LanguageTable />
                  </View>
                </CoachTarget>

              </>
            ) : null}

            {showSection('reset') ? (
              <>
                {/* ── 4. Reset ────────────────────────────────────────── */}
                {settings.onboardingStatus === 'completed' ||
                settings.onboardingStatus === 'skipped' ? (
                  <CoachTarget id="settings-restart-tips" scrollRef={scrollRef}>
                    <View
                      style={{
                        backgroundColor: theme.colors.surfaceElevated,
                        borderRadius: theme.layout.borderRadius.medium,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        marginTop: 10,
                        marginBottom: 16,
                        gap: 10,
                      }}
                    >
                      <KuralText
                        variant="bodyNormal"
                        style={{ color: theme.colors.textPrimary, fontWeight: '700' }}
                      >
                        {tOnboarding('restartTitle')}
                      </KuralText>
                      <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
                        {tOnboarding('restartBody')}
                      </KuralText>
                      <KuralButton
                        title={tOnboarding('restartAction')}
                        variant="secondary"
                        onPress={() =>
                          updateSettings({ onboardingStatus: 'completed', onboardingStep: 0 })
                        }
                        style={{ alignSelf: 'flex-start' }}
                      />
                    </View>
                  </CoachTarget>
                ) : null}

                {confirmReset !== 'none' && (
                  <View
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderRadius: theme.layout.borderRadius.medium,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: theme.colors.error,
                      marginBottom: 16,
                    }}
                  >
                    <KuralText
                      variant="bodyNormal"
                      style={{ color: theme.colors.textPrimary, marginBottom: 12 }}
                    >
                      {tSettings('resetSettingsPrompt')}
                    </KuralText>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <KuralButton
                        title={tSettings('cancel')}
                        variant="secondary"
                        onPress={() => setConfirmReset('none')}
                        style={{ flex: 1 }}
                      />
                      <KuralButton
                        title={tSettings('confirmReset')}
                        variant="primary"
                        onPress={executeReset}
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.error,
                        }}
                      />
                    </View>
                  </View>
                )}

                <CoachTarget id="settings-reset-data" scrollRef={scrollRef}>
                  <SettingsItem
                    label={pair('resetAllSettings').visible}
                    helperText={tSettings('resetAllSettingsHelp')}
                  >
                    <KuralIconButton
                      icon={<RefreshCcw />}
                      label={tSettings('reset')}
                      tooltip={pair('resetAllSettings').hover}
                      onPress={handleConfirmReset}
                      style={{ alignSelf: 'flex-start' }}
                    />
                  </SettingsItem>
                </CoachTarget>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
