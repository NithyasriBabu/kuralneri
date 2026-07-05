export const NATIVE_THEME_COLORS = {
  light: {
    background: '#F7F3EB',
    surface: '#FFFDF8',
    surfaceMuted: '#DAD7CD',
    border: '#D1C4AF',
    borderAccent: '#A3B18A',
    primary: '#344E41',
    primarySoft: '#2A3F34',
    primaryInverse: '#FAF9F6',
    secondary: '#3A5A40',
    body: '#536559',
    title: '#1F2D26',
    accent: '#8EA47C',
    accentSoft: '#ECE2D0',
    error: '#D90429',
    loading: '#344E41',
  },
  dark: {
    background: '#0D1210',
    surface: '#18211C',
    surfaceMuted: '#202E28',
    border: '#354A40',
    borderAccent: '#5D6761',
    primary: '#C8D3C0',
    primarySoft: '#BCC6BA',
    primaryInverse: '#0D1210',
    secondary: '#D8E1D1',
    body: '#BCC6BA',
    title: '#F3F0E8',
    accent: '#B89567',
    accentSoft: '#273630',
    error: '#FF7181',
    loading: '#C8D3C0',
  },
} as const;

export type NativeThemeVariant = keyof typeof NATIVE_THEME_COLORS;

export function getNativeThemeColors(isDark: boolean) {
  return NATIVE_THEME_COLORS[isDark ? 'dark' : 'light'];
}
