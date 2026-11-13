# Kuralneri

Kuralneri is a bilingual Tamil/English Thirukkural reader for Expo, React Native, and the web. It is local-first, responsive, and uses SQLite for the searchable corpus and user data.

## Progress

Implemented:

- Home: Kural of the Day with taxonomy context, commentary, translation, and responsive presentation.
- Explore: paginated Kural browsing, debounced search, Paal/Iyal/Adhikaram filters, responsive 1/2/3-column grids, full and compact card modes, and deep links to Kural details.
- Bookmarks: persistent bookmarks, bookmark-only filtering, pagination, and clear-all support.
- Kural details: Tamil couplet, transliteration, English translation, commentary by author, and daily personal notes.
- Onboarding: first-run setup, bilingual display choices, name capture, and resumable/skippable flow.
- Settings: personal preferences, theme mode, ten color schemes, Tamil/English font selection, font scaling, per-section language toggles, compact-card controls, author preference, and reset.
- Reliability: database bootstrap/retry UI, screen/root error boundaries, SQLite schema/content versioning, safe migrations, and web database serialization.
- Guru (experimental): feature-flagged local chat sessions with intent detection, Kural search/citations, summaries, session management, and a 30-message context limit. It is not an external or generative AI integration.

## Future work

- Learn content and learning workflows.
- Speech/audio playback, offline model download/inference, cloud sync, authentication, and backup/export workflows.
- Production native signing, store metadata, and release validation.

## Architecture

The application follows a presentation → hook → service → data flow:

- `src/views/`: screen composition and presentation.
- `src/components/`: reusable themed UI, Kural cards, filters, controls, and error states.
- `src/hooks/`: view behavior such as pagination, navigation, onboarding, Kural notes, and Guru state.
- `src/data/services/`: typed business/data gateway for Kurals, settings, and Guru.
- `src/data/`: SQLite bootstrap, schema/migrations, queries, web serialization queue, and route helpers.
- `src/content/`: i18next setup, Tamil/English UI catalogs, and transliteration helpers.
- `src/context/`: persisted settings context.
- `src/theme/`: theme context, color schemes, typography, layout constants, and shared styles.
- `src/types/`: shared domain, settings, and Guru types.
- `api/detail.json`, `api/thirukkural.json`: bundled taxonomy, Kural text, translations, and commentary source data.
- `src/data/kuralneri.db`: runtime SQLite database location; the app can create and seed it from the bundled JSON.

## Data and platform patterns

- SQLite is the source used at runtime. Fresh installs and content refreshes are seeded from `api/*.json`.
- The schema models `paals → iyals → adhikarams → kurals`, authors, seeded notes, user notes, settings, and Guru chat tables.
- Current database schema version is 3 and bundled content version is 1. Existing installs are migrated before content refresh.
- Mobile uses synchronous SQLite APIs where supported; web uses async APIs and serializes all database work through `src/data/webDbQueue.ts`.
- Services own queries, persistence, transformations, and platform branching. Views do not call SQLite directly.
- User-visible UI copy belongs in `src/content/tamil.json` and `src/content/english.json`, accessed through `src/content/translation.ts`.
- Kural verse text remains Tamil-first; translations and commentary are separately controlled by language toggles.

## Development

Use Node `22.22.2` from `.nvmrc`.

```sh
nvm use
npm ci
npm start
```

Run a target with `npm run web`, `npm run android`, or `npm run ios`.

## Quality checks

```sh
npm run check       # typecheck, lint with zero warnings, and Jest
npm run build:web   # production web export
```

Tests live beside the relevant feature under `__tests__/` and cover services, hooks, settings/theme behavior, feature flags, and failure states. Native device behavior and real SQLite persistence still require platform testing.

## Guru flag

Guru is disabled by default. Enable it at build/start time with:

```sh
EXPO_PUBLIC_ENABLE_GURU=true npm start
```

Restart Expo after changing the flag. The flag controls navigation, direct Guru routes, and onboarding promotion; it is not an authorization boundary.

## Release checklist

- Run `npm run check` and `npm run build:web`.
- Test fresh install and upgrade/migration on iOS, Android, and web.
- Verify bookmarks, notes, settings, reset behavior, onboarding, loading, empty, and failure states.
- Test Tamil/English combinations, themes, fonts, scaling, accessibility, and narrow/wide layouts.
- Confirm Guru is absent when disabled and `#/GURU` returns home.
- Configure production web hosting with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` for web SQLite. Metro adds these headers only in development.
- Complete signing, identifiers, store metadata, and release-build testing before distribution.
