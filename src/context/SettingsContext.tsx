import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  APP_SETTINGS_LANG_TOGGLE_KEYS,
  AppSettings,
  AppSettingsScalar,
  DEFAULT_SETTINGS,
  LangToggleKey,
  LangToggles,
} from 'src/types/settings';
import {
  loadSettings,
  resetAllSettings,
  saveLangToggle,
  saveSettingsPatch,
} from 'src/data/services/settingsService';

// ─── context shape ───────────────────────────────────────────────────────────

interface SettingsContextType {
  settings: AppSettings;
  settingsReady: boolean;
  settingsLoadWarning: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setLangToggle: (key: LangToggleKey, field: 'tamil' | 'english', value: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ─── provider ────────────────────────────────────────────────────────────────

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsLoadWarning, setSettingsLoadWarning] = useState(false);

  // Load once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { settings: loaded, hadInvalidStoredValues } = await loadSettings();
      if (!cancelled) {
        setSettings(loaded);
        setSettingsLoadWarning(hadInvalidStoredValues);
        setSettingsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const { langToggles: patchLangToggles, ...scalarPatch } = patch;
      const next = {
        ...prev,
        ...scalarPatch,
        langToggles: patchLangToggles
          ? {
              ...prev.langToggles,
              ...patchLangToggles,
            }
          : prev.langToggles,
      };

      if (Object.keys(scalarPatch).length > 0) {
        void saveSettingsPatch(scalarPatch as Partial<AppSettingsScalar>);
      }

      if (patchLangToggles) {
        for (const key of APP_SETTINGS_LANG_TOGGLE_KEYS) {
          const togglePatch = patchLangToggles[key];
          if (togglePatch) {
            void saveLangToggle(key, next.langToggles[key]);
          }
        }
      }

      return next;
    });
  }, []);

  /**
   * Toggle a single language switch for a section.
   * Enforces the "at least one language on" rule.
   */
  const setLangToggle = useCallback(
    (key: LangToggleKey, field: 'tamil' | 'english', value: boolean) => {
      setSettings((prev) => {
        const currentToggle = prev.langToggles[key];
        const otherField = field === 'tamil' ? 'english' : 'tamil';

        // Block turning off if the other is already off
        if (!value && !currentToggle[otherField]) return prev;

        const nextToggles: LangToggles = {
          ...prev.langToggles,
          [key]: { ...currentToggle, [field]: value },
        };
        const next = { ...prev, langToggles: nextToggles };
        void saveLangToggle(key, nextToggles[key]);
        return next;
      });
    },
    [],
  );

  const resetSettings = useCallback(() => {
    const fresh = {
      ...DEFAULT_SETTINGS,
      langToggles: { ...DEFAULT_SETTINGS.langToggles },
    };
    setSettings(fresh);
    setSettingsLoadWarning(false);
    void resetAllSettings();
  }, []);

  const value = useMemo<SettingsContextType>(
    () => ({
      settings,
      settingsReady,
      settingsLoadWarning,
      updateSettings,
      setLangToggle,
      resetSettings,
    }),
    [settings, settingsReady, settingsLoadWarning, updateSettings, setLangToggle, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// ─── hook ────────────────────────────────────────────────────────────────────

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
