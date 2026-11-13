# Kuralneri agent guidelines

Work only on the user-requested scope. Keep responses concise and bullet-based. Do not push code, create commits, or make unrelated refactors. Ask before proceeding when a requirement is materially ambiguous.

## Project contract

- Expo + React Native + TypeScript in strict mode; support mobile and web.
- Use the existing service-oriented architecture and follow nearby patterns before introducing new ones.
- Keep views presentational. Put reusable behavior in hooks and all database access, transformations, and business rules in `src/data/services/`.
- Use React Context only for global settings/theme state. Avoid unnecessary prop drilling.
- Define explicit types in `src/types/` for new domain data and public APIs.
- Add or update unit tests for changed services, hooks, settings, feature flags, and failure states.

## Current architecture

- `src/views/`: screens, navigation, onboarding pages, and presentation.
- `src/components/`: shared controls, Kural cards, filters, notes, and error UI.
- `src/hooks/`: pagination/search, navigation, onboarding, notes, Kural of the Day, and Guru controllers.
- `src/data/services/`: `kuralService`, `settingsService`, and `guruService`; this is the business/data gateway.
- `src/data/`: SQLite schema/bootstrap/migrations, queries, web DB queue, and web routes.
- `src/context/`: persisted settings context.
- `src/theme/`: theme context, color schemes, typography, layout, and component styles.
- `src/content/`: i18next catalogs and transliteration; use `tamil.json`, `english.json`, and `translation.ts` for app copy.
- `src/types/`: shared Kural, settings, and Guru types.
- `api/detail.json` and `api/thirukkural.json`: bundled corpus source used to seed SQLite.

## Implemented behavior to preserve

- Home Kural of the Day; Explore with search, taxonomy filters, pagination, responsive grids, and full/compact cards.
- Persistent bookmarks, seeded author commentary, daily personal notes, and Kural detail navigation.
- First-run onboarding with resumable/skippable setup.
- Settings for identity, preferred author, theme mode, ten color schemes, fonts, font size, language toggles, compact-card fields, and reset.
- SQLite schema/content versioning, safe migrations, content upsert, database retry UI, root/screen error boundaries, and serialized web SQLite work.
- Experimental Guru is disabled by default and enabled only through `EXPO_PUBLIC_ENABLE_GURU=true`. It is currently a local rule-based/citation workflow, not external AI inference.

## Future work

- Learn is not currently a navigation tab; future learning work should add it only when the feature and tests are ready.
- Speech/audio playback, offline model download/inference, cloud sync, authentication, and backup/export workflows remain outside the current scope.

## Data rules

- Runtime flow is service → SQLite. Fresh installs and content refreshes seed from `api/*.json`.
- Preserve the schema hierarchy `paals → iyals → adhikarams → kurals` and existing notes/settings/Guru tables.
- Current schema version is 3; content version is 1. Any schema change needs a safe migration/backfill for existing installs.
- Preserve platform branching: sync SQLite on native, async SQLite on web, and `runWebDbTask` for serialized web access.
- Do not add direct SQLite calls to views or components.
- Keep Kural verse text Tamil-only unless the feature explicitly requires translation.

## Translation and settings rules

- Add every user-visible string to both locale catalogs and read it through `useTranslation`/`translation.ts`.
- Do not add ad hoc bilingual literals or a parallel string catalog.
- When changing settings, update defaults, persistence, reset behavior, validation, and migration/backfill together.
- Preserve Tamil display names for people shown in Tamil.
- Use shared themed primitives and existing theme tokens. Maintain responsive layouts with dynamic 1/2/3-column behavior where applicable.

## Verification

Before handoff, run the smallest relevant checks plus:

```sh
npm run check
npm run build:web
```

For translation, settings, schema, or navigation changes, run the full check and verify both web and native-sensitive branches. Check loading, empty, error, accessibility, narrow, and wide layouts when UI changes.
