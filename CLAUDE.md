# CLAUDE.md — fieldops-app

Entry point for Claude (or any AI assistant) in this repository.
Full detail lives under `.cursor/rules/*.mdc` — read those before non-trivial changes. This file is the map, not the territory.

## What this repo is

`fieldops-app` is a standalone Expo SDK 57 app:

- Consumes `@pranadwaghmare2/fieldops-ui` from npm (not a relative import, not a monorepo)
- Uses TanStack Query, Axios, React Hook Form, and Zod — only through `src/core/integrations/*`
- Hosts NativeWind v4 with the FieldOps UI preset
- Talks to the local `mock-api/` (do not modify `server.js`)

Nothing in this repo publishes a component library. That lives in `fieldops-ui`.

Architecture summary: `docs/architecture-foundation.md`.  
Implementation plan (foundation): `docs/plan-foundation.md`.  
Trade-offs: root `DECISIONS.md` (see `.cursor/rules/030-decisions.mdc`).

## Non-negotiable constraints

1. Expo **SDK 57**. Match Expo Go to that SDK. Do not pin an older Expo major to “fix” Go mismatches.
2. Feature screens/hooks never import Axios, TanStack Query, RHF, Zod, NativeWind, `expo-image`, or `fieldops-ui` by package path — only integration ports.
3. Theme = FieldOps tokens only (`src/core/theme` + UI preset). No second palette / dark theme.
4. TypeScript `strict`, no `any`. TSDoc on exports and non-trivial internal logic (see `010-coding-and-docs.mdc`).
5. Hook-as-ViewModel MVVM under `src/features/*/hooks`. Screens stay dumb.
6. API base URL via `EXPO_PUBLIC_API_URL` (see `.env.example`).
7. Do not modify `mock-api/server.js`. Work around quirks in `DECISIONS.md` if needed.

## Architecture (short)

```
core/theme|config|constants|utils|types
        → core/integrations/*
        → features/*/hooks
        → features/*/components|screens
        → app/ (Expo Router shells)
```

## Rule index

| File | Covers |
| --- | --- |
| `000-architecture.mdc` | Layers, SOLID, theme, folders |
| `010-coding-and-docs.mdc` | TS/RN, TSDoc, performance guardrails |
| `020-testing.mdc` | Risk surface |
| `030-decisions.mdc` | `DECISIONS.md` shape |
| `040-git-commits.mdc` | Conventional Commits |
| `050-ponytail.mdc` | YAGNI ladder |
| `060-styling-nativewind.mdc` | Host NW + UI preset |
| `070-integrations.mdc` | Vendor ban + ports |
| `080-tanstack-query.mdc` | Keys, cursor, optimistic cache |
| `090-forms.mdc` | RHF+Zod, 422/409, keyboard |

Process: `AGENTS.md`.

## When context is ambiguous

1. Assignment / product requirements win over rules if they conflict.
2. If there is no single correct answer: pick a defensible option, log it in `DECISIONS.md`, and continue.
3. Do not block shipping on perfect consensus.

## Out of scope — do not implement unprompted

- Auth, offline persistence, push, settings, profile, dark mode, splash polish, app icons, EAS/store
- Exhaustive test coverage theatre
- Collapsing this repo with `fieldops-ui` into a monorepo
- Feature screens beyond what the current task explicitly asks for
