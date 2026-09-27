import { Platform } from 'react-native';
import { loadSettings, saveSettings, resetAllSettings } from '../settingsService';
import { DEFAULT_SETTINGS } from 'src/types/settings';

const mockScalars = new Map<string, string>();
const mockToggles = new Map<string, { tamil: number; english: number }>();
function mockRead(sql: string, [key]: string[]): unknown {
  if (sql.includes('app_settings_lang_toggles')) return mockToggles.get(key) ?? null;
  return mockScalars.has(key) ? { value: mockScalars.get(key) } : null;
}
function mockRun(sql: string, args: (string | number)[] = []): void {
  const toggles = sql.includes('app_settings_lang_toggles');
  if (sql.startsWith('DELETE')) {
    if (toggles) mockToggles.clear();
    else mockScalars.clear();
  } else if (toggles) {
    mockToggles.set(String(args[0]), { tamil: Number(args[1]), english: Number(args[2]) });
  } else mockScalars.set(String(args[0]), String(args[1]));
}
jest.mock('src/data/database', () => ({
  db: {
    getFirstSync: (...args: [string, string[]]) => mockRead(...args),
    getFirstAsync: async (...args: [string, string[]]) => mockRead(...args),
    runSync: (...args: [string, (string | number)[]?]) => mockRun(...args),
    runAsync: async (...args: [string, (string | number)[]?]) => mockRun(...args),
  },
}));

beforeEach(() => {
  mockScalars.clear();
  mockToggles.clear();
});
describe.each(['ios', 'web'])('%s settings persistence', (platform) => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: platform });
  });
  it('loads defaults for an existing install with missing settings', async () => {
    expect((await loadSettings()).settings).toEqual(DEFAULT_SETTINGS);
  });
  it('round trips preferences and onboarding, then resets to defaults', async () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      userName: 'Reader',
      themeMode: 'dark' as const,
      onboardingStatus: 'completed' as const,
      langToggles: { ...DEFAULT_SETTINGS.langToggles, navLabels: { tamil: true, english: false } },
    };
    await saveSettings(settings);
    expect((await loadSettings()).settings).toEqual(settings);
    await resetAllSettings();
    expect((await loadSettings()).settings).toEqual(DEFAULT_SETTINGS);
  });
  it('recovers invalid stored theme and onboarding values', async () => {
    mockScalars.set('themeMode', 'invalid');
    mockScalars.set('onboardingStatus', 'invalid');
    const result = await loadSettings();
    expect(result.hadInvalidStoredValues).toBe(true);
    expect(result.settings.themeMode).toBe(DEFAULT_SETTINGS.themeMode);
    expect(result.settings.onboardingStatus).toBe(DEFAULT_SETTINGS.onboardingStatus);
  });
});
