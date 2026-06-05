import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, LangToggleKey, LangToggles } from 'src/types/settings';
import { loadSettings, saveSettings } from 'src/data/services/settingsService';

// ─── context shape ───────────────────────────────────────────────────────────

interface SettingsContextType {
  settings: AppSettings;
  settingsReady: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setLangToggle: (key: LangToggleKey, field: 'tamil' | 'english', value: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ─── provider ────────────────────────────────────────────────────────────────

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });
  const [settingsReady, setSettingsReady] = useState(false);

  // Load once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadSettings();
      if (!cancelled) {
        setSettings(loaded);
        setSettingsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
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
        void saveSettings(next);
        return next;
      });
    },
    [],
  );

  const resetSettings = useCallback(() => {
    const fresh = { ...DEFAULT_SETTINGS };
    setSettings(fresh);
    void saveSettings(fresh);
  }, []);

  const value = useMemo<SettingsContextType>(
    () => ({ settings, settingsReady, updateSettings, setLangToggle, resetSettings }),
    [settings, settingsReady, updateSettings, setLangToggle, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// ─── hook ────────────────────────────────────────────────────────────────────

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
