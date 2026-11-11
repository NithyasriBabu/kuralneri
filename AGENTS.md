# Kuralneri AI Agent Guidelines

You are an expert AI developer specializing in React Native, Expo, and TypeScript, working on the **Kuralneri** codebase. Your goal is to provide highly precise, context-aware code that aligns with our established architecture.

---

The primary goal is to build an interactive, multi-lingual explorer for Thirukkural using **React Native (Expo)**, enforcing strict TypeScript typing, and maintaining a scholarly, earthy aesthetic. All generated code must be production-ready, testable, and adhere to the established separation of concerns.

The application should be responsive in both **Web** and **Mobile**.

---

## 1. Project Context & Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript (Strict mode)
- **Database:** SQLite via `expo-sqlite`
- **Navigation:** Component-driven tab switching (Home, Explore, Favorites, Learn, Guru)
- **State Management/Context:** React Context API (`src/context/*`) for global state (e.g., theme, settings).
- **Data Persistence:** SQLite database (`src/data/kuralneri.db`) for local caching and complex querying, supplemented by static JSON files for base content (`src/content/*.json`).
- **Styling:** Modular CSS/TypeScript approach (`src/styles/*`, `src/theme/*`).
- **Build Tooling:** Metro (implied by `metro.config.cjs`).

### **High-Level Architecture:**

The architecture follows a clean, service-oriented pattern layered on top of React components:

1.  **Presentation Layer:** Components (`src/components/*`) and Views (`src/views/*`) handle UI rendering. They consume logic from Hooks or Contexts.
2.  **Logic Layer:** Custom Hooks (`src/hooks/*`) encapsulate complex view or data-fetching behaviors (e.g., pagination, feeds).
3.  **Service Layer:** Business logic is abstracted into services within `src/data/services/` (e.g., `kuralService.ts`), which interface with the underlying data sources.
4.  **Data Layer:** Data sources include an SQLite DB (`.db`) for transactional data and JSON files (`.json`) for read-only, static content.

## 🧱 Architectural Constraints & Principles

### 1. Separation of Concerns (SoC) - CRITICAL

- **Views (`src/views/*`):** Must be purely presentational. They receive data via props or hooks and render UI; they **must not** contain data-fetching logic, complex state management, or business rules.
- **Hooks (`src/hooks/*`):** Should encapsulate reusable _behavior_. They manage local component state derived from services (e.g., `usePaginatedKuralsFeed`).
- **Services (`src/data/services/*`):** This is the **Business Logic Gateway**. All data access, transformation, and complex querying logic must reside here (e.g., `kuralService.ts`). Services abstract away whether the source is SQLite or JSON.

### 2. Data Flow Priority

1.  **Request:** View calls a Service function (`kuralService.getKural(id)`).
2.  **Service Logic:** The service determines the data source (DB first, then fallback to static JSON).
3.  **Data Access:** The service interacts with the underlying Data Layer (e.g., `expo-sqlite` wrapper or file reader).
4.  **Return:** Clean, typed data structure is returned up through the Hook/View.

### 3. State Management

- Use **React Context API (`src/context/*`)** only for truly global state (Theme, Language Locale, User Settings).
- Avoid passing props deeply; utilize context providers where appropriate to manage shared state efficiently.

## 🎨 Design System & Styling Rules

All styling must adhere strictly to the following tokens:

| Token                        | Hex Code                                            | Usage Context                                        |
| :--------------------------- | :-------------------------------------------------- | :--------------------------------------------------- |
| **Primary/Shell Background** | `#344E41` (Deep Green)                              | Main container backgrounds, primary navigation bars. |
| **Accent/Active Surfaces**   | `#A3B18A` (Sage Green)                              | Active tabs, selected items, primary buttons.        |
| **Background Layers**        | `#DAD7CD` (Muted Grey/Green), `#FAF9F6` (Off-White) | Card backgrounds, content areas, secondary surfaces. |
| **Supporting Tones**         | `#2A3F34`, `#3A5A40`, `#4A6153`                     | Text accents, borders, subtle dividers.              |

**Responsive Design:** Always compute dynamic column counts for grid views (e.g., 1 col on mobile, 2-3 cols on web).

## 💾 Data Layer Reference

### SQLite Schema Reminder

The core data model revolves around:

- `paals` $\rightarrow$ `iyals` $\rightarrow$ `adhikarams` $\rightarrow$ `kurals`.
- Commentary is linked via `notes` (Kural ID $\leftrightarrow$ Author ID).

### Data Source Fallback

When fetching content, the service layer must implement a robust fallback mechanism: **SQLite Query $\rightarrow$ JSON Content Check**. Never assume data exists in one place.

## 💻 Development Workflow & Best Practices

1.  **TypeScript First:** All new interfaces (`src/types/*`) and function signatures _must_ be explicitly typed.
2.  **Testing:** Unit tests for services and hooks are mandatory before any feature completion. Mock external dependencies (DB connections, network calls).
3.  **File Structure Adherence:** When implementing a feature:
    - If it's logic $\rightarrow$ `src/data/services/` or `src/hooks/`.
    - If it's UI $\rightarrow$ `src/components/` (reusable) or `src/views/` (screen).
    - If it's global state $\rightarrow$ `src/context/`.

## Translation and Settings Protocol

- Use `src/content/translation.ts` plus locale JSON files as the single source of truth for app copy.
- Do not introduce parallel string catalogs or ad hoc bilingual literals in views/components.
- When adding user-visible copy, update both locale files and the relevant `useTranslation` call sites in the same change.
- Keep Thirukkural verse text Tamil-only unless a feature explicitly requires translation.
- If a setting changes what users see, update persistence, defaults, reset behavior, and any backfill/migration in the same change.
- Add Tamil display names for user-facing people data when the UI renders names in Tamil.
- Prefer shared themed primitives over one-off inline UI blocks.
- Remove superseded code paths in the same change that introduces the replacement.
- Run `npx tsc --noEmit` after translation, settings, or schema refactors.
- For schema changes, add a safe backfill path for existing installs.

## ⚠️ Agent Self-Correction Checklist (Before Submitting Code)

1.  **Did I use the correct hex codes?** (Check against the table above).
2.  **Is data fetching logic isolated in a Service or Hook?** (No direct DB calls in Views).
3.  **Are all new types defined and used throughout?**
4.  **Have I considered both Mobile and Web breakpoints for layout components?**

## Other Instructions

1. **Ask When In Doubt:** If any requirement or piece of code seems ambiguous, stop and ask you clarification before proceeding. **DO NOT ASSUME**.
2. **Follow Repo Patterns**: Actively analyze existing files (src/data/services/_, src/components/_, etc.) to mimic established patterns in structure, typing, and logic flow without using too many tokens.
3. **Proactive Pattern Creation Protocol:** If a clear gap exists and a new pattern would significantly improve the architecture (e.g., a missing utility hook or a better service abstraction), propose it for review before implementing it.

---
