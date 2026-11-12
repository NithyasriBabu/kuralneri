import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'குறள்நெறி',
  slug: config.slug ?? 'kuralneri',
  extra: {
    ...config.extra,
    featureFlags: {
      guruEnabled: process.env.EXPO_PUBLIC_ENABLE_GURU === 'true',
    },
  },
});
