import { createGlobalStyles } from 'src/theme/global.styles';
import { createComponentStyles } from 'src/theme/component.styles';

type GlobalStylesType = ReturnType<typeof createGlobalStyles>;
type ComponentStylesType = ReturnType<typeof createComponentStyles>;

export interface ThemeContextType {
  theme: AppTheme;
  globalStyles: GlobalStylesType;
  componentStyles: ComponentStylesType;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

/** 'system' follows OS preference and is saved to DB */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorState {
  default: string;
  hover?: string;
  active?: string;
  disabled: string;
}

export interface AppTheme {
  isWideScreen: boolean;
  dark: boolean;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceElevated: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    disabledText: string;
    error: string;
    interactive: {
      primaryButton: ColorState;
      secondaryButton: ColorState;
      card: ColorState;
    };
  };
  typography: {
    fonts: {
      tamil: string;
      english: string;
    };
    sizes: {
      h1: number;
      h2: number;
      bodyLarge: number;
      bodyNormal: number;
      caption: number;
    };
  };
  layout: {
    isWideScreen: boolean;
    borderRadius: {
      small: number;
      medium: number;
      large: number;
    };
    minHeights: {
      button: number;
      input: number;
      card: number;
    };
    gridGap: number;
    screenPadding: number;
    maxContentWidth: number;
  };
}
