# Kuralneri

A Tamil/English Thirukkural reader built with React Native, Expo, and TypeScript for mobile and web.

## Current scope

- Daily Kural, browsing and filtering, commentary, and verse details.
- Bookmarks and personal notes stored locally in SQLite.
- Language, font, theme, and reading preferences, with first-run onboarding.
- Learn remains a placeholder. Guru is experimental and hidden by default; actual AI model integration is not implemented.

## Development

Use the Node version in `.nvmrc` (22.22.2).

```sh
nvm use
npm ci
npm start
```

Use `npm run web`, `npm run android`, or `npm run ios` for the target platform.

## Quality checks

```sh
npm run check
npm run build:web
```

`check` runs TypeScript, lint with zero warnings, and Jest regression tests. CI also exports the production web bundle. Tests mock native dependencies using the [Expo Jest preset](https://docs.expo.dev/develop/unit-testing/); they do not replace device or real SQLite persistence testing.

## Experimental Guru

Guru is disabled unless `EXPO_PUBLIC_ENABLE_GURU=true` is set when starting or building Expo. Restart the development server after changing it. Keep it unset or `false` for reader releases. The flag controls navigation, direct Guru routes, and onboarding promotion. It is a build configuration, not a user preference or an authorization boundary.

## Remaining dependency work

The dependency audit after compatible updates reports 13 findings (11 moderate, 2 high; no critical). Review the remaining Expo toolchain dependencies before release; the suggested full fix includes a major Expo upgrade. Do not treat a passing build as security clearance.

## Before release

- Verify fresh install, onboarding completion, and upgrade from an existing database on iOS, Android, and web.
- Verify bookmarks, notes, and settings survive restarts and upgrades; verify reset actions.
- Exercise Tamil/English, light/dark/system themes, font scaling, accessibility, and narrow/wide layouts.
- Check loading, empty, and failure states, including unavailable storage.
- Verify Guru is absent and `#/GURU` returns home in the release build.
- Configure the production web host with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` for SQLite. Metro supplies these headers only during development.
- Complete native signing, app identifiers, store metadata, and device release-build testing before distribution.

Offline AI guidance, learning tools, speech, and backups are future work. No model download, inference engine, or cloud backup is included in the current reader.
