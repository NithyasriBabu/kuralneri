export const ONBOARDING_PAGE_COUNT = 3 as const;

export enum OnboardingPage {
  Setup = 0,
  Tour = 1,
  Review = 2,
}

export type OnboardingPageIndex = OnboardingPage.Setup | OnboardingPage.Tour | OnboardingPage.Review;

export function clampOnboardingPageIndex(value: number): OnboardingPageIndex {
  if (value <= OnboardingPage.Setup) return OnboardingPage.Setup;
  if (value >= OnboardingPage.Review) return OnboardingPage.Review;
  return value as OnboardingPageIndex;
}
