const originalEnv = process.env.EXPO_PUBLIC_ENABLE_GURU;
let mockConfig: unknown;
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockConfig;
    },
  },
}));

afterEach(() => {
  if (originalEnv === undefined) delete process.env.EXPO_PUBLIC_ENABLE_GURU;
  else process.env.EXPO_PUBLIC_ENABLE_GURU = originalEnv;
});

function readFlag(config: unknown, env?: string): boolean {
  mockConfig = config;
  if (env === undefined) delete process.env.EXPO_PUBLIC_ENABLE_GURU;
  else process.env.EXPO_PUBLIC_ENABLE_GURU = env;
  let enabled = false;
  jest.isolateModules(() => {
    enabled = require('../featureFlags').isGuruEnabled();
  });
  return enabled;
}
it('defaults off without configuration', () => {
  expect(readFlag(undefined)).toBe(false);
});
it('honors explicit build configuration over environment', () => {
  expect(readFlag({ extra: { featureFlags: { guruEnabled: false } } }, 'true')).toBe(false);
  expect(readFlag({ extra: { featureFlags: { guruEnabled: true } } }, 'false')).toBe(true);
});
it('rejects unrecognized flag values', () => {
  expect(readFlag({ extra: { featureFlags: { guruEnabled: 'unexpected' } } }, 'unexpected')).toBe(
    false,
  );
});
