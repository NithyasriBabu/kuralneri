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
    primary: '#2F4A3D',
    accent: '#8EA47C',
    background: '#F7F3EB',
    surface: '#ECE2D0',
    surfaceElevated: '#FFFDF8',
    textPrimary: '#1F2D26',
    textSecondary: '#536559',
    border: '#D1C4AF',
    disabledText: '#7D7D7D',
    error: '#D90429',
    interactive: {
      primaryButton: {
        default: '#2F4A3D',
        hover: '#395847',
        active: '#22352C',
        disabled: '#B7BDAF',
      },
      secondaryButton: {
        default: 'transparent',
        hover: '#ECE2D055',
        active: '#ECE2D0',
        disabled: 'transparent',
      },
      card: {
        default: '#FFFDF8',
        hover: '#FBF8F1',
        active: '#ECE2D0',
        disabled: '#F3EDE1',
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
    primary: '#C8D3C0',
    accent: '#B89567',
    background: '#0D1210',
    surface: '#18211C',
    surfaceElevated: '#202E28',
    textPrimary: '#F3F0E8',
    textSecondary: '#BCC6BA',
    border: '#354A40',
    disabledText: '#738176',
    error: '#FF7181',
    interactive: {
      primaryButton: {
        default: '#C8D3C0',
        hover: '#D8E1D1',
        active: '#AFBBA7',
        disabled: '#5D6761',
      },
      secondaryButton: {
        default: 'transparent',
        hover: '#24342D',
        active: '#1A241F',
        disabled: 'transparent',
      },
      card: {
        default: '#18211C',
        hover: '#202E28',
        active: '#273630',
        disabled: '#151D19',
      },
    },
  },
  typography: baseTypography,
  layout: baseLayout,
};

export const EarthyTheme = LightEarthyTheme;
