# Vetra FE - Folder Purpose and Coding Flow

This document defines where code should live so AI and developers can implement features consistently.

## Core Principles

- Organize by feature/domain first, then extract shared code.
- Keep `app/` focused on routing and composition, not heavy business logic.
- Prefer imports via `@/` aliases.
- One file, one clear responsibility.

## Folder Purposes

- `app/`: Next.js routes, layouts, and page entrypoints only.
- `features/`: Domain logic grouped by feature (UI, hooks, service, model per feature).
- `components/`: Shared reusable UI components.
- `services/`: Shared API client and request helpers.
- `store/`: Global app state only (auth/session/theme/app-wide states).
- `hooks/`: Shared reusable hooks.
- `lib/`: Framework-agnostic utils, formatters, validators, constants.
- `types/`: Shared cross-feature types.
- `styles/`: Global styles, tokens, and theme foundations.
- `public/`: Public URL assets (e.g. `/logo.svg`, `/robots.txt`).
- `md/`: Project documentation and AI coding conventions.

## Recommended Feature Structure

Use this pattern for each feature:

```txt
features/<feature-name>/
  components/
  hooks/
  model/
  services/
  index.ts
```

- Place feature-specific models in `features/<feature-name>/model/`.
- Put only truly shared models/types in `types/`.

## Required Coding Flow

1. Start from route needs in `app/`.
2. Implement domain behavior in `features/<feature-name>/`.
3. Extract reusable UI into `components/`.
4. Move shared data access to `services/`.
5. Place shared helpers in `lib/`.
6. Keep page files as thin composition layers.
7. Re-export public APIs using feature `index.ts` where practical.
8. Run lint/type/build checks before finishing.

## Import and Dependency Rules

- Prefer:
  - `@/features/...`
  - `@/components/...`
  - `@/services/...`
  - `@/lib/...`
  - `@/types/...`
- Avoid feature-to-feature tight coupling.
- If two features need the same code, move it to a shared layer.

## Asset Placement Rules

- This project uses `public/` only for static files.
- Store all images/icons/static assets in `public/` (for example `public/icons`, `public/images`, `public/logos`).
- Reference assets via URL paths such as `"/icons/file.svg"` or `"/logos/vercel.svg"`.

## Anti-Patterns to Avoid

- Putting all business logic in `app/page.tsx`.
- Calling APIs directly inside shared presentational components.
- Using global store for local screen state.
- Mixing shared and feature-specific types in one place.

## AI Execution Notes

- Respect the folder boundaries above before creating new files.
- Default to feature-scoped code first, then extract to shared only after reuse appears.
- Update this document when architectural conventions evolve.
