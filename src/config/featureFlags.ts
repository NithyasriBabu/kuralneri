import Constants from 'expo-constants';

function parseBooleanFlag(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return null;
}

function readGuruFlagFromConfig(): boolean {
  const extraValue = Constants.expoConfig?.extra;
  if (extraValue && typeof extraValue === 'object' && 'featureFlags' in extraValue) {
    const featureFlags = (extraValue as { featureFlags?: { guruEnabled?: unknown } }).featureFlags;
    const parsed = parseBooleanFlag(featureFlags?.guruEnabled);
    if (parsed !== null) return parsed;
  }

  const parsed = parseBooleanFlag(process.env.EXPO_PUBLIC_ENABLE_GURU);
  return parsed ?? false;
}

export const featureFlags = {
  guruEnabled: readGuruFlagFromConfig(),
} as const;

export function isGuruEnabled(): boolean {
  return featureFlags.guruEnabled;
}
