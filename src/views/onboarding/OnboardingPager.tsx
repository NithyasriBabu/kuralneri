import React from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { KuralButton } from 'src/components/common/KuralButton';
import { useTheme } from 'src/theme/ThemeContextProvider';

import { ONBOARDING_PAGE_COUNT } from 'src/views/onboarding/onboarding.types';

type OnboardingPagerProps = {
  pageWidth: number;
  activeStep: number;
  scrollX: Animated.Value;
  scrollRef: React.RefObject<ScrollView | null>;
  pages: React.ReactNode[];
  finishLabel: string;
  stepLabel: string;
  onFinish: () => void;
  onStepPress: (step: number) => void;
  onScrollBeginDrag: () => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function OnboardingPager({
  pageWidth,
  activeStep,
  scrollX,
  scrollRef,
  pages,
  finishLabel,
  stepLabel,
  onFinish,
  onStepPress,
  onScrollBeginDrag,
  onMomentumScrollEnd,
}: OnboardingPagerProps) {
  const { theme } = useTheme();

  return (
    <>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        style={{ flex: 1 }}
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {pages.map((page, index) => (
          <View key={`page-${index}`} style={{ width: pageWidth, paddingHorizontal: 4 }}>
            {page}
            {index === ONBOARDING_PAGE_COUNT - 1 ? (
              <KuralButton title={finishLabel} variant="primary" onPress={onFinish} style={{ alignSelf: 'stretch' }} />
            ) : null}
          </View>
        ))}
      </Animated.ScrollView>

      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {pages.map((_, index) => (
            <Pressable
              key={`step-${index}`}
              accessibilityRole="button"
              accessibilityLabel={stepLabel
                .replace('{step}', String(index + 1))
                .replace('{total}', String(ONBOARDING_PAGE_COUNT))}
              accessibilityState={{ selected: index === activeStep }}
              onPress={() => onStepPress(index)}
              style={{ padding: 6 }}
            >
              <Animated.View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  opacity: scrollX.interpolate({
                    inputRange: [pageWidth * (index - 1), pageWidth * index, pageWidth * (index + 1)],
                    outputRange: [0.45, 1, 0.45],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      scale: scrollX.interpolate({
                        inputRange: [pageWidth * (index - 1), pageWidth * index, pageWidth * (index + 1)],
                        outputRange: [0.85, 1.25, 0.85],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                  backgroundColor: index === activeStep ? theme.colors.primary : theme.colors.accent,
                  borderWidth: 1,
                  borderColor: theme.colors.background,
                }}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}
