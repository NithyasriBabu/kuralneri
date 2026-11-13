import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { Check, PanelLeftClose, PanelLeftOpen, RefreshCcw, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { createColorSchemeTheme } from 'src/theme/styles';
import { useSettings } from 'src/context/SettingsContext';
import { KuralText } from 'src/components/common/KuralText';
import { KuralButton } from 'src/components/common/KuralButton';
import { KuralIconButton } from 'src/components/common/KuralIconButton';
import { KuralSegmentedControl } from 'src/components/common/KuralSegmentedControl';
import { KuralDropdown } from 'src/components/common/KuralDropdown';
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

function ColorSchemePreview({ value, label, dark }: { value: ColorScheme; label: string; dark: boolean }) {
  const preview = createColorSchemeTheme(value, dark ? 'dark' : 'light');
  const colors = [
    { name: 'Background', value: preview.colors.background },
    { name: 'Surface', value: preview.colors.surface },
    { name: 'Accent', value: preview.colors.accent },
    { name: 'Text', value: preview.colors.textPrimary },
  ];

  return (
    <View
      accessibilityLabel={`${label} color preview`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: preview.colors.surface,
      }}
    >
      {colors.map((color) => (
        <View
          key={color.name}
          accessibilityLabel={`${color.name}: ${color.value}`}
          style={{
            flex: 1,
            height: 28,
            borderRadius: 5,
            backgroundColor: color.value,
            borderWidth: 1,
            borderColor: preview.colors.border,
          }}
        />
      ))}
    </View>
  );
}

const LANG_TOGGLE_KEYS: LangToggleKey[] = [
  'kuralCard',
  'commentary',
  'filterLabels',
  'navLabels',
  'uiChrome',
  'sectionHeaders',
];

// ─── language display table ──────────────────────────────────────────────────

function LanguageDisplayTable() {
  const { theme } = useTheme();
  const { settings, setLangToggle } = useSettings();
  const { t: tSettings } = useTranslation('uiChrome', 'settings');
  const labels: Record<LangToggleKey, { tamil: string; english: string }> = {
    kuralCard: {
      tamil: tSettings('kuralCardToggleLabel'),
      english: 'Kural Card',
    },
    commentary: {
      tamil: tSettings('commentaryToggleLabel'),
      english: 'Commentary',
    },
    filterLabels: {
      tamil: tSettings('filterLabelsToggleLabel'),
      english: 'Filter Labels',
    },
    navLabels: {
      tamil: tSettings('navLabelsToggleLabel'),
      english: 'Nav Labels',
    },
    uiChrome: {
      tamil: tSettings('uiChromeToggleLabel'),
      english: 'UI Chrome',
    },
    sectionHeaders: {
      tamil: tSettings('sectionHeadersToggleLabel'),
      english: 'Section Headers',
    },
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius.medium,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: theme.layout.isWideScreen ? 'row' : 'column',
          backgroundColor: theme.colors.surfaceElevated,
          padding: 12,
        }}
      >
        <View style={{ flex: 1 }} />
        <KuralText
          variant="caption"
          isTamil
          style={{ width: 76, color: theme.colors.textSecondary, textAlign: 'center' }}
        >
          {tSettings('tamilLanguage')}
        </KuralText>
        <KuralText
          variant="caption"
          style={{ width: 76, color: theme.colors.textSecondary, textAlign: 'center' }}
        >
          {tSettings('englishLanguage')}
        </KuralText>
      </View>

      {LANG_TOGGLE_KEYS.map((toggleKey) => {
        const toggle = settings.langToggles[toggleKey];
        const label = labels[toggleKey];
        return (
          <View
            key={toggleKey}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 64,
              paddingHorizontal: 12,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <KuralText variant="bodyNormal" style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>
                {label.tamil}
              </KuralText>
              <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
                {label.english}
              </KuralText>
            </View>
            {(['tamil', 'english'] as const).map((language) => {
              const checked = toggle[language];
              return (
                <Pressable
                  key={language}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={`${label.english} ${language}`}
                  onPress={() => setLangToggle(toggleKey, language, !checked)}
                  style={{ width: 76, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: checked ? theme.colors.primary : theme.colors.border,
                      backgroundColor: checked ? theme.colors.accent : 'transparent',
                    }}
                  >
                    {checked ? <Check size={16} color={theme.colors.primary} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ─── main view ───────────────────────────────────────────────────────────────

export default function SettingsView() {
  const { theme } = useTheme();
  const { settings, settingsLoadWarning, updateSettings, resetSettings } = useSettings();
  const { t: tSettings, pair } = useTranslation('uiChrome', 'settings');
  const { t: tOnboarding } = useTranslation('uiChrome', 'onboarding');

  const [nameInput, setNameInput] = useState(settings.userName);
  const [nameInputTamil, setNameInputTamil] = useState(settings.userNameTamil);
  const [confirmReset, setConfirmReset] = useState<'none' | 'all'>('none');
  const [activeSection, setActiveSection] = useState<SettingsSection>('personal');
  const [showSettingsTabs, setShowSettingsTabs] = useState(true);

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

  const KURAL_LIST_MODE_OPTIONS = [
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
    resetSettings();
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
            flexDirection: showSettingsTabs ? 'row' : 'column',
            gap: 16,
            marginTop: 16,
          }}
        >
          {showSettingsTabs ? (
          <View style={{ width: theme.layout.isWideScreen ? 180 : 132, gap: 4 }}>
            {(
              [
                ['personal', tSettings('personal')],
                ['display', tSettings('display')],
                ['language', tSettings('languageDisplay')],
                ['reset', tSettings('reset')],
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
            label={showSettingsTabs ? tSettings('hideSettingsTabs') : tSettings('showSettingsTabs')}
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
              height: 40,
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

        <View style={row}>
          <RowLabel label={tSettings('yourNameTamil')} sub={tSettings('usedToGreetYouTamil')} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                value={nameInputTamil}
                onChangeText={setNameInputTamil}
                onBlur={() => updateSettings({ userNameTamil: nameInputTamil.trim() })}
                onSubmitEditing={() => updateSettings({ userNameTamil: nameInputTamil.trim() })}
                placeholder={tSettings('namePlaceholder')}
                placeholderTextColor={theme.colors.disabledText}
                style={{
                  flex: 1,
                  minWidth: theme.layout.isWideScreen ? 130 : 0,
                  height: 40,
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

        <View style={{ paddingBottom: 10 }}>
          <KuralSegmentedControl
            options={AUTHORS}
            selected={settings.preferredAuthorCode}
            label={tSettings('preferredAuthor')}
            helperText={tSettings('commentaryShownFirst')}
            onSelect={(value) => updateSettings({ preferredAuthorCode: value })}
          />
        </View>

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
          </>
        ) : null}

        {showSection('display') ? (
          <>
            {/* ── 2. Display ──────────────────────────────────────── */}

        <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surface }}>
          <RowLabel label={tSettings('colorScheme')} sub={tSettings('colorSchemeHelp')} />
          <KuralDropdown
            items={COLOR_SCHEME_OPTIONS}
            selectedValue={settings.colorScheme}
            onValueChange={(value) => updateSettings({ colorScheme: value as ColorScheme })}
            containerStyle={{ marginTop: 8 }}
          />
          <ColorSchemePreview
            value={settings.colorScheme}
            label={COLOR_SCHEME_OPTIONS.find((option) => option.value === settings.colorScheme)?.label ?? ''}
            dark={theme.dark}
          />
        </View>

        <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surface }}>
          <KuralSegmentedControl
            options={APPEARANCE_OPTIONS}
            selected={settings.themeMode}
            label={tSettings('appearance')}
            helperText={tSettings('appearanceHelp')}
            onSelect={(value) => updateSettings({ themeMode: value })}
          />
        </View>

        <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surface }}>
          <KuralSegmentedControl
            options={FONT_SIZE_OPTIONS}
            selected={settings.fontSizeScale}
            label={tSettings('fontSize')}
            onSelect={(v) => updateSettings({ fontSizeScale: v })}
          />
        </View>

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
          {settings.kuralListDisplayMode === 'compact' ? (
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
                      settings[field.key] ? theme.colors.primary : theme.colors.disabledText
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

        <View
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surface,
          }}
        >
          <KuralSegmentedControl
            options={TAMIL_FONT_OPTIONS.map((opt) => ({ label: `${opt.label} — குறள்`, value: opt.value }))}
            selected={settings.tamilFont}
            label={tSettings('tamilFont')}
            helperText={tSettings('affectsTamilRendering')}
            onSelect={(value) => updateSettings({ tamilFont: value })}
          />
        </View>

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

          </>
        ) : null}

        {showSection('language') ? (
          <>
            {/* ── 3. Language visibility ───────────────────────────── */}
        <KuralText
          variant="caption"
          style={{ color: theme.colors.textSecondary, marginBottom: 12 }}
        >
          {tSettings('languageDisplayHelp')}
        </KuralText>

        <LanguageDisplayTable />

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
              options={[
                { label: tSettings('tamilLanguage'), value: 'tamil' },
                { label: tSettings('englishLanguage'), value: 'english' },
              ]}
              selected={settings.fallbackLanguage}
              label={tSettings('fallbackLanguage')}
              helperText={tSettings('fallbackLanguageHelp')}
              onSelect={(v) => updateSettings({ fallbackLanguage: v })}
            />
          </View>
            </View>
          </>
        ) : null}

        {showSection('reset') ? (
          <>
            {/* ── 4. Reset ────────────────────────────────────────── */}
            {settings.onboardingStatus === 'completed' || settings.onboardingStatus === 'skipped' ? (
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
              {settings.onboardingStatus === 'completed'
                ? tOnboarding('restartTitle')
                : tOnboarding('resumeTitle')}
            </KuralText>
            <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {settings.onboardingStatus === 'completed'
                ? tOnboarding('restartBody')
                : tOnboarding('resumeBody')}
            </KuralText>
            <KuralButton
              title={
                settings.onboardingStatus === 'completed'
                  ? tOnboarding('restartAction')
                  : tOnboarding('resumeAction')
              }
              variant="secondary"
              onPress={() =>
                updateSettings(
                  settings.onboardingStatus === 'completed'
                    ? { onboardingStatus: 'in_progress', onboardingStep: 0 }
                    : { onboardingStatus: 'in_progress' },
                )
              }
              style={{ alignSelf: 'flex-start' }}
            />
          </View>
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

            <View style={{ gap: 12 }}>
              <KuralIconButton
                icon={<RefreshCcw />}
                label={pair('resetAllSettings').visible}
                tooltip={pair('resetAllSettings').hover}
                onPress={handleConfirmReset}
              />
            </View>
          </>
        ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
