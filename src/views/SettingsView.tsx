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
  const { settings, setLangToggle } = useSettings();
  const { t, tSingle } = useTranslation('uiChrome', 'settings');
  const selected =
    settings.langToggles.uiChrome.tamil && !settings.langToggles.uiChrome.english
      ? 'tamil'
      : settings.langToggles.uiChrome.english && !settings.langToggles.uiChrome.tamil
        ? 'english'
        : settings.fallbackLanguage;

  return (
    <KuralSegmentedControl
      label={tSingle('language', settings.fallbackLanguage)}
      helperText={t('languageHelp')}
      selected={selected}
      options={[
        { label: tSingle('tamilLanguage', 'tamil'), value: 'tamil' },
        { label: tSingle('englishLanguage', 'english'), value: 'english' },
      ]}
      onSelect={(language) => {
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
  const { t: tSettings, tSingle: tSettingsSingle, pair } = useTranslation('uiChrome', 'settings');
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
        'settings-list-view',
        'settings-tamil-font',
        'settings-english-font',
      ].includes(activeTarget)
    ) {
      setActiveSection('display');
    } else if (['settings-language-display', 'settings-fallback-language'].includes(activeTarget)) {
      setActiveSection('language');
    } else if (['settings-restart-tips', 'settings-reset-data'].includes(activeTarget)) {
      setActiveSection('reset');
    }
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

  const FIXED_LANGUAGE_OPTIONS = [
    { label: tSettingsSingle('tamilLanguage', 'tamil'), value: 'tamil' as const },
    { label: tSettingsSingle('englishLanguage', 'english'), value: 'english' as const },
  ];

  const KURAL_LIST_MODE_OPTIONS = [
    { label: tSettings('responsiveView'), value: 'responsive' as const },
    { label: tSettings('fullView'), value: 'full' as const },
    { label: tSettings('compactView'), value: 'compact' as const },
  ];

  const compactFields = [
    { key: 'compactShowTamil' as const, label: tSettings('compactTamilVerse'), disabled: true },
    { key: 'compactShowTaxonomy' as const, label: tSettings('compactTaxonomy') },
    { key: 'compactShowTranslation' as const, label: tSettings('compactTranslation') },
    { key: 'compactShowExplanation' as const, label: tSettings('compactExplanation') },
    { key: 'compactShowBookmark' as const, label: tSettings('compactBookmark') },
  ];

  const TAMIL_FONT_OPTIONS: { label: string; value: TamilFont }[] = [
    { label: 'Mukta Malar', value: 'MuktaMalar' },
    { label: 'Latha', value: 'Latha' },
    { label: 'Catamaran', value: 'Catamaran' },
    { label: 'Arima Madurai', value: 'ArimaMadurai' },
  ];

  const ENGLISH_FONT_OPTIONS: { label: string; value: EnglishFont }[] = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Source Serif', value: 'SourceSerif' },
  ];

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
                    />
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-list-view" scrollRef={scrollRef}>
                  <View
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surface,
                    }}
                  >
                    <KuralSegmentedControl
                      options={KURAL_LIST_MODE_OPTIONS}
                      selected={settings.kuralListDisplayMode}
                      label={tSettings('mobileKuralView')}
                      helperText={tSettings('mobileKuralViewHelp')}
                      onSelect={(value) => updateSettings({ kuralListDisplayMode: value })}
                    />
                    {settings.kuralListDisplayMode === 'compact' ||
                    (settings.kuralListDisplayMode === 'responsive' &&
                      theme.layout.screenWidth <= 600) ? (
                      <View style={{ marginTop: 12, gap: 4 }}>
                        {compactFields.map((field) => (
                          <View key={field.key} style={row}>
                            <RowLabel
                              label={field.label}
                              sub={field.disabled ? tSettings('compactTamilRequired') : undefined}
                            />
                            <Switch
                              value={settings[field.key]}
                              disabled={field.disabled}
                              onValueChange={(value) => updateSettings({ [field.key]: value })}
                              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                              thumbColor={
                                settings[field.key]
                                  ? theme.colors.primary
                                  : theme.colors.disabledText
                              }
                              accessibilityLabel={field.label}
                              accessibilityState={{
                                disabled: Boolean(field.disabled),
                                checked: settings[field.key],
                              }}
                            />
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-tamil-font" scrollRef={scrollRef}>
                  <View
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surface,
                    }}
                  >
                    <KuralSegmentedControl
                      options={TAMIL_FONT_OPTIONS.map((opt) => ({
                        label: `${opt.label} — குறள்`,
                        value: opt.value,
                      }))}
                      selected={settings.tamilFont}
                      label={tSettings('tamilFont')}
                      helperText={tSettings('affectsTamilRendering')}
                      onSelect={(value) => updateSettings({ tamilFont: value })}
                    />
                  </View>
                </CoachTarget>

                <CoachTarget id="settings-english-font" scrollRef={scrollRef}>
                  <View
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surface,
                    }}
                  >
                    <KuralSegmentedControl
                      options={ENGLISH_FONT_OPTIONS.map((opt) => ({
                        label: `${tSettings('fontPreviewSample')} — ${opt.label}`,
                        value: opt.value,
                      }))}
                      selected={settings.englishFont}
                      label={tSettings('englishFont')}
                      helperText={tSettings('affectsEnglishRendering')}
                      onSelect={(value) => updateSettings({ englishFont: value })}
                    />
                  </View>
                </CoachTarget>
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

                <CoachTarget id="settings-fallback-language" scrollRef={scrollRef}>
                  <View
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderRadius: theme.layout.borderRadius.medium,
                      padding: 14,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <KuralSegmentedControl
                        options={FIXED_LANGUAGE_OPTIONS}
                        selected={settings.fallbackLanguage}
                        label={`${tSettingsSingle('fallbackLanguage', 'tamil')} / ${tSettingsSingle('fallbackLanguage', 'english')}`}
                        helperText={`${tSettingsSingle('fallbackLanguageHelp', 'tamil')} / ${tSettingsSingle('fallbackLanguageHelp', 'english')}`}
                        onSelect={(v) => updateSettings({ fallbackLanguage: v })}
                      />
                    </View>
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
