import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TextInput,
} from 'react-native';

import { useSettings } from 'src/context/SettingsContext';
import { OnboardingStatus } from 'src/types/settings';

import { clampOnboardingPageIndex, OnboardingPageIndex } from 'src/views/onboarding/onboarding.types';

export function useOnboardingFlow(pageWidth: number) {
  const { settings, updateSettings } = useSettings();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const nameInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const activeStepRef = useRef<OnboardingPageIndex>(
    clampOnboardingPageIndex(settings.onboardingStep),
  );
  const [scrollX] = useState(() => new Animated.Value(0));
  const [nameInput, setNameInput] = useState(settings.userName);
  const [activeStep, setActiveStep] = useState<OnboardingPageIndex>(
    clampOnboardingPageIndex(settings.onboardingStep),
  );

  useEffect(() => {
    setNameInput(settings.userName);
  }, [settings.userName]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: activeStepRef.current * pageWidth,
      animated: false,
    });
  }, [pageWidth]);

  useEffect(() => {
    if (activeStep !== 0) {
      nameInputRef.current?.blur();
      Keyboard.dismiss();
    }
  }, [activeStep]);

  const persistProgress = (step: OnboardingPageIndex, status: OnboardingStatus) => {
    updateSettings({
      onboardingStep: step,
      onboardingStatus: status,
    });
  };

  const goToStep = (step: number) => {
    const nextStep = clampOnboardingPageIndex(step);
    persistProgress(nextStep, 'in_progress');
    activeStepRef.current = nextStep;
    setActiveStep(nextStep);
    if (nextStep !== 0) {
      nameInputRef.current?.blur();
      Keyboard.dismiss();
    }
    scrollRef.current?.scrollTo({ x: nextStep * pageWidth, animated: true });
  };

  const skip = () => {
    persistProgress(activeStep, 'skipped');
  };

  const finish = () => {
    updateSettings({
      userName: nameInput.trim(),
      onboardingStep: 0,
      onboardingStatus: 'completed',
    });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextStep = clampOnboardingPageIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
    activeStepRef.current = nextStep;
    setActiveStep(nextStep);
    if (nextStep !== 0) {
      nameInputRef.current?.blur();
      Keyboard.dismiss();
    }
    persistProgress(nextStep, 'in_progress');
  };

  const handleScrollBeginDrag = () => {
    nameInputRef.current?.blur();
    Keyboard.dismiss();
  };

  return {
    settings,
    updateSettings,
    scrollRef,
    nameInputRef,
    scrollX,
    nameInput,
    setNameInput,
    activeStep,
    pageWidth,
    goToStep,
    skip,
    finish,
    handleMomentumScrollEnd,
    handleScrollBeginDrag,
  };
}
