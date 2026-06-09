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
import {
  LANG_TOGGLE_LABELS,
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
  const { t: tChrome } = useTranslation('uiChrome');
  const toggle = settings.langToggles[toggleKey];
  const labels = LANG_TOGGLE_LABELS[toggleKey];

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
            {labels.tamil}
          </KuralText>
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
            {labels.english}
          </KuralText>
        </View>

        <View style={{ flexDirection: 'row', gap: 20 }}>
          {/* Tamil toggle */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <KuralText variant="caption" isTamil style={{ color: theme.colors.textSecondary }}>
              தமிழ்
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
              English
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
          {tChrome('atLeastOneLanguage')}
        </KuralText>
      )}
    </View>
  );
}

// ─── main view ───────────────────────────────────────────────────────────────

export default function SettingsView() {
  const { theme } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { t: tChrome } = useTranslation('uiChrome');

  const [nameInput, setNameInput] = useState(settings.userName);
  const [nameInputTamil, setNameInputTamil] = useState(settings.userNameTamil);
  const [confirmReset, setConfirmReset] = useState<'none' | 'bookmarks' | 'all'>('none');

  const isDark = theme.dark;
  const backgroundColors = isDark ? BG_PRESETS_DARK : BG_PRESETS_LIGHT;
  const foregroundColors = isDark ? FG_PRESETS_DARK : FG_PRESETS_LIGHT;

  const AUTHORS = [
    { label: tChrome('allAuthors'), value: '' },
    { label: tChrome('youAuthor'), value: 'self' },
    { label: `${tChrome('authorMVaradarajan')} (mv)`, value: 'mv' },
    { label: `${tChrome('authorSolomonPappaiah')} (sp)`, value: 'sp' },
    { label: `${tChrome('authorMKarunanidhi')} (mk)`, value: 'mk' },
  ];

  const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
    { label: `☀ ${tChrome('light')}`, value: 'light' },
    { label: `☾ ${tChrome('dark')}`, value: 'dark' },
    { label: `⚙ ${tChrome('system')}`, value: 'system' },
  ];

  const FONT_SIZE_OPTIONS: { label: string; value: FontSizeScale }[] = [
    { label: tChrome('small'), value: 'small' },
    { label: tChrome('medium'), value: 'medium' },
    { label: tChrome('large'), value: 'large' },
    { label: tChrome('xlarge'), value: 'xlarge' },
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
        type === 'bookmarks' ? tChrome('clearAllBookmarks') : tChrome('resetAllSettings');
      const msg =
        type === 'bookmarks' ? tChrome('clearBookmarksPrompt') : tChrome('resetSettingsPrompt');
      Alert.alert(title, msg, [
        { text: tChrome('cancel'), style: 'cancel' },
        {
          text: tChrome('reset'),
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
            {tChrome('settingsTitle')}
          </KuralText>
        </View>

        {/* ── 1. Personal ─────────────────────────────────────── */}
        <SectionHeader label={tChrome('personal')} />

        <View style={row}>
          <RowLabel label={tChrome('yourName')} sub={tChrome('usedToGreetYou')} />
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            onBlur={() => updateSettings({ userName: nameInput.trim() })}
            onSubmitEditing={() => updateSettings({ userName: nameInput.trim() })}
            placeholder={tChrome('namePlaceholder')}
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
          <RowLabel label={tChrome('yourNameTamil')} sub={tChrome('usedToGreetYouTamil')} />
          <TextInput
            value={nameInputTamil}
            onChangeText={setNameInputTamil}
            onBlur={() => updateSettings({ userNameTamil: nameInputTamil.trim() })}
            onSubmitEditing={() => updateSettings({ userNameTamil: nameInputTamil.trim() })}
            placeholder={tChrome('namePlaceholder')}
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
              fontFamily: theme.typography.fonts.tamil,
              fontSize: theme.typography.sizes.bodyNormal,
            }}
            returnKeyType="done"
          />
        </View>

        <View style={row}>
          <RowLabel label={tChrome('preferredAuthor')} sub={tChrome('commentaryShownFirst')} />
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
        <SectionHeader label={tChrome('display')} />

        <View style={row}>
          <RowLabel label={tChrome('theme')} />
          <KuralSegmentedControl
            options={THEME_OPTIONS}
            selected={settings.themeMode}
            onSelect={(v) => {
              updateSettings({ themeMode: v, customBackground: '', customForeground: '' });
            }}
          />
        </View>

        <View style={row}>
          <RowLabel label={tChrome('fontSize')} />
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
          <RowLabel label={tChrome('tamilFont')} sub={tChrome('affectsTamilRendering')} />
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
          <RowLabel label={tChrome('englishFont')} sub={tChrome('affectsEnglishRendering')} />
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
                    {tChrome('fontPreviewSample')} — {opt.label}
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
          <RowLabel label={tChrome('backgroundColor')} sub={tChrome('defaultSwatchHint')} />
          <KuralColorSwatches
            presets={backgroundColors}
            selected={settings.customBackground}
            onSelect={(v) => updateSettings({ customBackground: v })}
            defaultLabel={tChrome('defaultSwatchLabel')}
          />
        </View>

        <View style={{ paddingVertical: 10 }}>
          <RowLabel label={tChrome('textColor')} sub={tChrome('primaryTextApplies')} />
          <KuralColorSwatches
            presets={foregroundColors}
            selected={settings.customForeground}
            onSelect={(v) => updateSettings({ customForeground: v })}
            defaultLabel={tChrome('defaultSwatchLabel')}
          />
        </View>

        {/* ── 3. Language visibility ───────────────────────────── */}
        <SectionHeader label={tChrome('languageDisplay')} />
        <KuralText
          variant="caption"
          style={{ color: theme.colors.textSecondary, marginBottom: 12 }}
        >
          {tChrome('languageDisplayHelp')}
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
            <RowLabel label={tChrome('fallbackLanguage')} sub={tChrome('fallbackLanguageHelp')} />
            <KuralSegmentedControl
              options={[
                { label: tChrome('tamilLanguage'), value: 'tamil' },
                { label: tChrome('englishLanguage'), value: 'english' },
              ]}
              selected={settings.fallbackLanguage}
              onSelect={(v) => updateSettings({ fallbackLanguage: v })}
              containerStyle={{ alignSelf: 'center' }}
            />
          </View>
        </View>

        {/* ── 4. Reset ────────────────────────────────────────── */}
        <SectionHeader label={tChrome('reset')} />

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
                ? tChrome('clearBookmarksPrompt')
                : tChrome('resetSettingsPrompt')}
            </KuralText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <KuralButton
                title={tChrome('cancel')}
                variant="secondary"
                onPress={() => setConfirmReset('none')}
                style={{ flex: 1 }}
              />
              <KuralButton
                title={tChrome('confirmReset')}
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
            title={tChrome('clearAllBookmarks')}
            variant="secondary"
            onPress={() => handleConfirmReset('bookmarks')}
          />
          <KuralButton
            title={tChrome('resetAllSettings')}
            variant="secondary"
            onPress={() => handleConfirmReset('all')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
