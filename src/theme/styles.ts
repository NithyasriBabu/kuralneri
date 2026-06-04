import { AppTheme } from 'src/theme/types';

const baseTypography = {
  fonts: {
    tamil: 'MuktaMalar-Regular',
    english: 'Inter-Regular',
  },
  sizes: {
    h1: 24,
    h2: 20,
    bodyLarge: 18,
    bodyNormal: 15,
    caption: 12,
  },
};

const baseLayout = {
  isWideScreen: false,
  borderRadius: { small: 4, medium: 8, large: 12 },
  minHeights: { button: 48, input: 48, card: 120 },
  gridGap: 12,
  screenPadding: 16,
  maxContentWidth: 1200,
};

export const LightEarthyTheme: AppTheme = {
  dark: false,
  isWideScreen: false,
  colors: {
    primary: '#344E41',
    accent: '#A3B18A',
    background: '#FAF9F6',
    surface: '#DAD7CD',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#2A3F34',
    textSecondary: '#4A6153',
    border: '#A3B18A',
    disabledText: '#9A9A9A',
    error: '#D90429',
    interactive: {
      primaryButton: {
        default: '#344E41',
        hover: '#3A5A40',
        active: '#2A3F34',
        disabled: '#A3B18A80',
      },
      secondaryButton: {
        default: 'transparent',
        hover: '#DAD7CD50',
        active: '#DAD7CD',
        disabled: 'transparent',
      },
      card: {
        default: '#FFFFFF',
        hover: '#FAF9F6',
        active: '#DAD7CD',
        disabled: '#F0F0F0',
      },
    },
  },
  typography: baseTypography,
  layout: baseLayout,
};

export const DarkEarthyTheme: AppTheme = {
  dark: true,
  isWideScreen: false,
  colors: {
    primary: '#A3B18A',
    accent: '#C7B08A',
    background: '#111814',
    surface: '#1B2621',
    surfaceElevated: '#24342D',
    textPrimary: '#F2EFE8',
    textSecondary: '#C0C7B9',
    border: '#3F564A',
    disabledText: '#738078',
    error: '#FF6B7A',
    interactive: {
      primaryButton: {
        default: '#A3B18A',
        hover: '#B4C4A0',
        active: '#8DA078',
        disabled: '#5D6B63',
      },
      secondaryButton: {
        default: 'transparent',
        hover: '#24342D',
        active: '#1E2A25',
        disabled: 'transparent',
      },
      card: {
        default: '#1B2621',
        hover: '#24342D',
        active: '#2B3A33',
        disabled: '#18211D',
      },
    },
  },
  typography: baseTypography,
  layout: baseLayout,
};

export const EarthyTheme = LightEarthyTheme;
