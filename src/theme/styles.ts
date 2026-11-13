import { AppTheme } from 'src/theme/types';
import { ColorScheme, ThemeMode } from 'src/types/settings';

const baseTypography = { fonts: { tamil: 'MuktaMalar-Regular', english: 'Inter-Regular' }, sizes: { h1: 24, h2: 20, bodyLarge: 18, bodyNormal: 15, caption: 12 } };
const baseLayout = { isWideScreen: false, screenWidth: 0, borderRadius: { small: 4, medium: 8, large: 12 }, minHeights: { button: 48, input: 48, card: 120 }, gridGap: 12, screenPadding: 16, maxContentWidth: 1200 };
type Palette = { background: string; surface: string; accent: string; primary: string; textPrimary: string; textSecondary: string; surfaceElevated: string; border: string; disabledText: string; error: string; dark: boolean };
type PaletteVariants = { light: Palette; dark: Palette };

export const COLOR_SCHEME_OPTIONS: readonly ColorScheme[] = ['earthySage', 'sandstone', 'forest', 'ocean', 'plum', 'highContrast', 'nightOcean', 'terracotta', 'lavender', 'monochrome'];

const palette = (values: Omit<Palette, 'dark'>, dark: boolean): Palette => ({ ...values, dark });
const variants: Record<ColorScheme, PaletteVariants> = {
  earthySage: {
    light: palette({ background: '#F5F0E6', surface: '#E5DFC8', accent: '#A68B5B', primary: '#4A4631', textPrimary: '#2D2E24', textSecondary: '#6B6A54', surfaceElevated: '#FFFCF5', border: '#CEC5A8', disabledText: '#858170', error: '#B23A3A' }, false),
    dark: palette({ background: '#171811', surface: '#28291F', accent: '#B7A56B', primary: '#D9D2B2', textPrimary: '#F5F1E5', textSecondary: '#C1BDA7', surfaceElevated: '#343528', border: '#555844', disabledText: '#898B77', error: '#FF817A' }, true),
  },
  sandstone: {
    light: palette({ background: '#FBF4E8', surface: '#E9D9BE', accent: '#C58B55', primary: '#7A4E2D', textPrimary: '#2F241C', textSecondary: '#6C5A4B', surfaceElevated: '#FFFDF8', border: '#D7BE9D', disabledText: '#88796C', error: '#B42318' }, false),
    dark: palette({ background: '#17110B', surface: '#261B12', accent: '#C58B55', primary: '#E8C59D', textPrimary: '#FFF5E8', textSecondary: '#CBB8A2', surfaceElevated: '#35261A', border: '#5A4431', disabledText: '#927D69', error: '#FF8A72' }, true),
  },
  forest: {
    light: palette({ background: '#EFF5EE', surface: '#D9E8D7', accent: '#7FA66F', primary: '#2F5D43', textPrimary: '#20352A', textSecondary: '#587060', surfaceElevated: '#FAFFFA', border: '#B8CFB5', disabledText: '#718276', error: '#B42318' }, false),
    dark: palette({ background: '#0C1710', surface: '#16261B', accent: '#7FA66F', primary: '#BBD9B2', textPrimary: '#F2FAF1', textSecondary: '#B4C8B3', surfaceElevated: '#203629', border: '#3D6048', disabledText: '#78907D', error: '#FF8175' }, true),
  },
  ocean: {
    light: palette({ background: '#EAF9F6', surface: '#CFEDE7', accent: '#3AB7A5', primary: '#167D78', textPrimary: '#123B3B', textSecondary: '#4E7672', surfaceElevated: '#F7FFFD', border: '#A5D4CC', disabledText: '#72918D', error: '#B42318' }, false),
    dark: palette({ background: '#081C1D', surface: '#0F3333', accent: '#2FC3B0', primary: '#8DE4D7', textPrimary: '#E8FFFB', textSecondary: '#A5CFCA', surfaceElevated: '#164444', border: '#2E6964', disabledText: '#709A96', error: '#FF8175' }, true),
  },
  plum: {
    light: palette({ background: '#FBF3F8', surface: '#EEDDEA', accent: '#B884A6', primary: '#6C3560', textPrimary: '#351F31', textSecondary: '#725D6C', surfaceElevated: '#FFF9FD', border: '#D8BBD0', disabledText: '#8C7887', error: '#B4235A' }, false),
    dark: palette({ background: '#1A0D17', surface: '#291522', accent: '#B884A6', primary: '#E6BFD8', textPrimary: '#FFF3FA', textSecondary: '#D0B6C7', surfaceElevated: '#3A1F32', border: '#69405C', disabledText: '#9D8194', error: '#FF7AAE' }, true),
  },
  highContrast: {
    light: palette({ background: '#FFFFFF', surface: '#F1F1F1', accent: '#FFD23F', primary: '#000000', textPrimary: '#111111', textSecondary: '#444444', surfaceElevated: '#FFFFFF', border: '#111111', disabledText: '#666666', error: '#B00020' }, false),
    dark: palette({ background: '#000000', surface: '#111111', accent: '#FFD23F', primary: '#FFD23F', textPrimary: '#FFFFFF', textSecondary: '#D9D9D9', surfaceElevated: '#1D1D1D', border: '#FFFFFF', disabledText: '#888888', error: '#FF6B6B' }, true),
  },
  nightOcean: {
    light: palette({ background: '#F0F2FA', surface: '#DDE2F2', accent: '#8293D3', primary: '#4456A6', textPrimary: '#1E2645', textSecondary: '#5E6785', surfaceElevated: '#FCFDFF', border: '#BBC5E0', disabledText: '#7B849F', error: '#B4235A' }, false),
    dark: palette({ background: '#0C1022', surface: '#171D38', accent: '#7488D5', primary: '#B7C3FF', textPrimary: '#F4F6FF', textSecondary: '#B5BEDD', surfaceElevated: '#232B4D', border: '#3E4C7A', disabledText: '#7E8AB0', error: '#FF7AAE' }, true),
  },
  terracotta: {
    light: palette({ background: '#FFF1EA', surface: '#F3D2C1', accent: '#D97757', primary: '#8C3F2F', textPrimary: '#3A211B', textSecondary: '#7C5A50', surfaceElevated: '#FFF9F5', border: '#E1B5A1', disabledText: '#9D8277', error: '#B42318' }, false),
    dark: palette({ background: '#24110C', surface: '#3A1D15', accent: '#E07B5F', primary: '#FFC0A5', textPrimary: '#FFF0E9', textSecondary: '#D8B2A3', surfaceElevated: '#4A281F', border: '#75483B', disabledText: '#A77C6D', error: '#FF8A72' }, true),
  },
  lavender: {
    light: palette({ background: '#F6F3FF', surface: '#E6DFFF', accent: '#9B8AE6', primary: '#5B4BA3', textPrimary: '#2E2850', textSecondary: '#6E6590', surfaceElevated: '#FCFAFF', border: '#CFC7F0', disabledText: '#8D86AA', error: '#B4235A' }, false),
    dark: palette({ background: '#151126', surface: '#24203F', accent: '#A99AF4', primary: '#D2C9FF', textPrimary: '#F7F5FF', textSecondary: '#BDB5DD', surfaceElevated: '#302A52', border: '#514A7A', disabledText: '#8982AA', error: '#FF7AAE' }, true),
  },
  monochrome: {
    light: palette({ background: '#F5F5F5', surface: '#E4E4E4', accent: '#777777', primary: '#222222', textPrimary: '#111111', textSecondary: '#555555', surfaceElevated: '#FFFFFF', border: '#CFCFCF', disabledText: '#888888', error: '#A00000' }, false),
    dark: palette({ background: '#0E0E0E', surface: '#1C1C1C', accent: '#BDBDBD', primary: '#FFFFFF', textPrimary: '#F5F5F5', textSecondary: '#C8C8C8', surfaceElevated: '#292929', border: '#555555', disabledText: '#888888', error: '#FF7777' }, true),
  },
};

function interactive(colors: Palette): AppTheme['colors']['interactive'] {
  return { primaryButton: { default: colors.primary, hover: colors.accent, active: colors.textSecondary, disabled: colors.disabledText }, secondaryButton: { default: 'transparent', hover: `${colors.accent}55`, active: colors.surface, disabled: 'transparent' }, card: { default: colors.surfaceElevated, hover: colors.surface, active: colors.surface, disabled: colors.background } };
}

export function createColorSchemeTheme(colorScheme: ColorScheme, mode: Exclude<ThemeMode, 'system'>): AppTheme {
  const colors = variants[colorScheme][mode];
  return { dark: colors.dark, isWideScreen: false, colors: { ...colors, interactive: interactive(colors) }, typography: baseTypography, layout: baseLayout };
}

export function getColorSchemeSwatches(
  colorScheme: ColorScheme,
  mode: Exclude<ThemeMode, 'system'>,
): string[] {
  const theme = createColorSchemeTheme(colorScheme, mode);
  return [theme.colors.background, theme.colors.surface, theme.colors.accent, theme.colors.primary];
}

export const EarthyTheme = createColorSchemeTheme('earthySage', 'light');
export const LightEarthyTheme = EarthyTheme;
export const DarkEarthyTheme = createColorSchemeTheme('earthySage', 'dark');
