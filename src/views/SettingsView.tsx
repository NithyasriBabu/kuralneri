import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { KuralText } from 'src/components/common/KuralText';
import { KuralButton } from 'src/components/common/KuralButton';
import { KuralSegmentedControl } from 'src/components/common/KuralSegmentedControl';
import { KuralColorSwatches } from 'src/components/common/KuralColorSwatches';
import { useTranslation } from 'src/content/translation';
import { transliterateEnglishNameToTamil } from 'src/content/transliteration';
import {
  LangToggleKey,
  TamilFont,
  FontSizeScale,
  ThemeMode,
  EnglishFont,
  ENGLISH_FONT_FAMILIES,
} from 'src/types/settings';
import { clearAllBookmarks } from 'src/data/services/settingsService';

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.accent,
        paddingBottom: 6,
        marginTop: 28,
        marginBottom: 14,
      }}
    >
      <KuralText
        variant="h2"
        style={{
          color: theme.colors.primary,
          fontFamily: theme.typography.fonts.english,
          fontSize: theme.typography.sizes.h2,
          fontWeight: '700',
        }}
      >
        {label}
      </KuralText>
    </View>
  );
}

function RowLabel({ label, sub }: { label: string; sub?: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, paddingRight: 12 }}>
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

// ─── color swatch picker ─────────────────────────────────────────────────────

const BG_PRESETS_DARK = [
  '',
  '#0D1210',
  '#0D1B2A',
  '#1A1A2E',
  '#1C1C1C',
  '#12181B',
  '#1A1209',
  '#0F1923',
];
const BG_PRESETS_LIGHT = [
  '',
  '#F7F3EB',
  '#FFF8F0',
  '#FAF0E6',
  '#F5F0FF',
  '#E8F5E9',
  '#FFF9C4',
  '#FDECEA',
];

const FG_PRESETS_DARK = [
  '',
  '#F3F0E8',
  '#FFFFFF',
  '#E8D5B7',
  '#C8D3C0',
  '#D4E8D0',
  '#FFE0B2',
  '#B3E5FC',
];
const FG_PRESETS_LIGHT = [
  '',
  '#1F2D26',
  '#2C2C2C',
  '#3E2723',
  '#1A237E',
  '#1B5E20',
  '#4A148C',
  '#212121',
];

// ─── lang toggle row ─────────────────────────────────────────────────────────

function LangToggleRow({ toggleKey }: { toggleKey: LangToggleKey }) {
  const { theme } = useTheme();
  const { settings, setLangToggle } = useSettings();
  const { t: tSettings } = useTranslation('uiChrome', 'settings');
  const toggle = settings.langToggles[toggleKey];
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
  const label = labels[toggleKey];

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.layout.borderRadius.medium,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <KuralText
            variant="bodyNormal"
            isTamil
            style={{ color: theme.colors.primary, fontWeight: '700' }}
          >
            {label.tamil}
          </KuralText>
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {label.english}
          </KuralText>
        </View>

        <View style={{ flexDirection: 'row', gap: 20 }}>
          {/* Tamil toggle */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <KuralText variant="caption" isTamil style={{ color: theme.colors.textSecondary }}>
              {tSettings('tamilLanguage')}
            </KuralText>
            <Switch
              value={toggle.tamil}
              onValueChange={(v) => setLangToggle(toggleKey, 'tamil', v)}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={toggle.tamil ? theme.colors.primary : theme.colors.disabledText}
            />
          </View>

          {/* English toggle */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {tSettings('englishLanguage')}
            </KuralText>
            <Switch
              value={toggle.english}
              onValueChange={(v) => setLangToggle(toggleKey, 'english', v)}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={toggle.english ? theme.colors.primary : theme.colors.disabledText}
            />
          </View>
        </View>
      </View>

      {/* At-least-one warning */}
      {!toggle.tamil && !toggle.english && (
        <KuralText variant="caption" style={{ color: theme.colors.error, marginTop: 6 }}>
          {tSettings('atLeastOneLanguage')}
        </KuralText>
      )}
    </View>
  );
}

// ─── main view ───────────────────────────────────────────────────────────────

export default function SettingsView() {
  const { theme } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { t: tSettings } = useTranslation('uiChrome', 'settings');

  const [nameInput, setNameInput] = useState(settings.userName);
  const [nameInputTamil, setNameInputTamil] = useState(settings.userNameTamil);
  const [confirmReset, setConfirmReset] = useState<'none' | 'bookmarks' | 'all'>('none');

  const isDark = theme.dark;
  const backgroundColors = isDark ? BG_PRESETS_DARK : BG_PRESETS_LIGHT;
  const foregroundColors = isDark ? FG_PRESETS_DARK : FG_PRESETS_LIGHT;

  const AUTHORS = [
    { label: tSettings('allAuthors'), value: '' },
    { label: tSettings('youAuthor'), value: 'self' },
    { label: `${tSettings('authorMVaradarajan')} (mv)`, value: 'mv' },
    { label: `${tSettings('authorSolomonPappaiah')} (sp)`, value: 'sp' },
    { label: `${tSettings('authorMKarunanidhi')} (mk)`, value: 'mk' },
  ];

  const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
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
    { label: 'Latha', value: 'Latha' },
    { label: 'Catamaran', value: 'Catamaran' },
    { label: 'Arima Madurai', value: 'ArimaMadurai' },
  ];

  const ENGLISH_FONT_OPTIONS: { label: string; value: EnglishFont }[] = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Source Serif', value: 'SourceSerif' },
  ];

  const LANG_TOGGLE_KEYS: LangToggleKey[] = [
    'kuralCard',
    'commentary',
    'filterLabels',
    'navLabels',
    'uiChrome',
    'sectionHeaders',
  ];

  const handleConfirmReset = (type: 'bookmarks' | 'all') => {
    if (Platform.OS === 'web') {
      // Web: use inline confirm UI (no Alert)
      setConfirmReset(type);
    } else {
      const title =
        type === 'bookmarks' ? tSettings('clearAllBookmarks') : tSettings('resetAllSettings');
      const msg =
        type === 'bookmarks' ? tSettings('clearBookmarksPrompt') : tSettings('resetSettingsPrompt');
      Alert.alert(title, msg, [
        { text: tSettings('cancel'), style: 'cancel' },
        {
          text: tSettings('reset'),
          style: 'destructive',
          onPress: () => executeReset(type),
        },
      ]);
    }
  };

  const executeReset = async (type: 'bookmarks' | 'all') => {
    setConfirmReset('none');
    if (type === 'bookmarks' || type === 'all') {
      await clearAllBookmarks();
    }
    if (type === 'all') {
      resetSettings();
      setNameInput('');
      setNameInputTamil('');
    }
  };

  const autoFillTamilName = () => {
    const source = nameInput.trim();
    if (!source) return;
    const transliterated = transliterateEnglishNameToTamil(source);
    setNameInputTamil(transliterated);
    updateSettings({ userNameTamil: transliterated });
  };

  const row = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.layout.screenPadding,
          paddingBottom: 60,
          maxWidth: theme.layout.maxContentWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <View style={{ marginBottom: 4 }}>
          <KuralText variant="h1" style={{ color: theme.colors.primary, textAlign: 'center' }}>
            {tSettings('settingsTitle')}
          </KuralText>
        </View>

        {/* ── 1. Personal ─────────────────────────────────────── */}
        <SectionHeader label={tSettings('personal')} />

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
              minWidth: 130,
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
                  minWidth: 130,
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
              <KuralButton
                title={tSettings('autoFillTamilName')}
                variant="secondary"
                onPress={autoFillTamilName}
                style={{ alignSelf: 'stretch' }}
              />
            </View>
            <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
              {tSettings('autoFillTamilNameHelp')}
            </KuralText>
          </View>
        </View>

        <View style={row}>
          <RowLabel label={tSettings('preferredAuthor')} sub={tSettings('commentaryShownFirst')} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 10 }}>
          {AUTHORS.map((a) => {
            const active = a.value === settings.preferredAuthorCode;
            return (
              <TouchableOpacity
                key={a.value}
                onPress={() => updateSettings({ preferredAuthorCode: a.value })}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: theme.layout.borderRadius.medium,
                  backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <KuralText
                  variant="caption"
                  style={{
                    color: active ? theme.colors.primary : theme.colors.textSecondary,
                    fontWeight: active ? '700' : '400',
                  }}
                >
                  {a.label}
                </KuralText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 2. Display ──────────────────────────────────────── */}
        <SectionHeader label={tSettings('display')} />

        <View style={row}>
          <RowLabel label={tSettings('theme')} />
          <KuralSegmentedControl
            options={THEME_OPTIONS}
            selected={settings.themeMode}
            onSelect={(v) => {
              updateSettings({ themeMode: v, customBackground: '', customForeground: '' });
            }}
          />
        </View>

        <View style={row}>
          <RowLabel label={tSettings('fontSize')} />
          <KuralSegmentedControl
            options={FONT_SIZE_OPTIONS}
            selected={settings.fontSizeScale}
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
          <RowLabel label={tSettings('tamilFont')} sub={tSettings('affectsTamilRendering')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {TAMIL_FONT_OPTIONS.map((opt) => {
              const active = opt.value === settings.tamilFont;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => updateSettings({ tamilFont: opt.value })}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: theme.layout.borderRadius.medium,
                    backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                    borderWidth: 1,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  }}
                >
                  <KuralText
                    isTamil
                    variant="bodyNormal"
                    style={{
                      color: active ? theme.colors.primary : theme.colors.textPrimary,
                      fontWeight: active ? '700' : '400',
                    }}
                  >
                    {opt.label} — குறள்
                  </KuralText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surface,
          }}
        >
          <RowLabel label={tSettings('englishFont')} sub={tSettings('affectsEnglishRendering')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {ENGLISH_FONT_OPTIONS.map((opt) => {
              const active = opt.value === settings.englishFont;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => updateSettings({ englishFont: opt.value })}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: theme.layout.borderRadius.medium,
                    backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                    borderWidth: 1,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  }}
                >
                  <KuralText
                    variant="bodyNormal"
                    style={{
                      color: active ? theme.colors.primary : theme.colors.textPrimary,
                      fontWeight: active ? '700' : '400',
                      fontFamily: ENGLISH_FONT_FAMILIES[opt.value],
                    }}
                  >
                    {tSettings('fontPreviewSample')} — {opt.label}
                  </KuralText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View
          style={{
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surface,
          }}
        >
          <RowLabel label={tSettings('backgroundColor')} sub={tSettings('defaultSwatchHint')} />
          <KuralColorSwatches
            presets={backgroundColors}
            selected={settings.customBackground}
            onSelect={(v) => updateSettings({ customBackground: v })}
            defaultLabel={tSettings('defaultSwatchLabel')}
          />
        </View>

        <View style={{ paddingVertical: 10 }}>
          <RowLabel label={tSettings('textColor')} sub={tSettings('primaryTextApplies')} />
          <KuralColorSwatches
            presets={foregroundColors}
            selected={settings.customForeground}
            onSelect={(v) => updateSettings({ customForeground: v })}
            defaultLabel={tSettings('defaultSwatchLabel')}
          />
        </View>

        {/* ── 3. Language visibility ───────────────────────────── */}
        <SectionHeader label={tSettings('languageDisplay')} />
        <KuralText
          variant="caption"
          style={{ color: theme.colors.textSecondary, marginBottom: 12 }}
        >
          {tSettings('languageDisplayHelp')}
        </KuralText>

        {LANG_TOGGLE_KEYS.map((key) => (
          <LangToggleRow key={key} toggleKey={key} />
        ))}

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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
            <RowLabel
              label={tSettings('fallbackLanguage')}
              sub={tSettings('fallbackLanguageHelp')}
            />
            <KuralSegmentedControl
              options={[
                { label: tSettings('tamilLanguage'), value: 'tamil' },
                { label: tSettings('englishLanguage'), value: 'english' },
              ]}
              selected={settings.fallbackLanguage}
              onSelect={(v) => updateSettings({ fallbackLanguage: v })}
              containerStyle={{ alignSelf: 'center' }}
            />
          </View>
        </View>

        {/* ── 4. Reset ────────────────────────────────────────── */}
        <SectionHeader label={tSettings('reset')} />

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
              {confirmReset === 'bookmarks'
                ? tSettings('clearBookmarksPrompt')
                : tSettings('resetSettingsPrompt')}
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
                onPress={() => executeReset(confirmReset)}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.error,
                }}
              />
            </View>
          </View>
        )}

        <View style={{ gap: 12 }}>
          <KuralButton
            title={tSettings('clearAllBookmarks')}
            variant="secondary"
            onPress={() => handleConfirmReset('bookmarks')}
          />
          <KuralButton
            title={tSettings('resetAllSettings')}
            variant="secondary"
            onPress={() => handleConfirmReset('all')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
