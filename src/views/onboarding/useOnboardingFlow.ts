import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { useSettings } from 'src/context/SettingsContext';

export function useOnboardingFlow() {
  const { settings, updateSettings, setLanguage } = useSettings();
  const nameInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [nameInput, setNameInput] = useState(settings.userName);

  useEffect(() => {
    setNameInput(settings.userName);
  }, [settings.userName]);

  const finish = () => {
    updateSettings({
      userName: nameInput.trim(),
      onboardingStep: 0,
      onboardingStatus: 'completed',
    });
  };

  return {
    settings,
    updateSettings,
    setLanguage,
    nameInputRef,
    nameInput,
    setNameInput,
    finish,
  };
}
