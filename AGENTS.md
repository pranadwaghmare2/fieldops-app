# AGENTS.md — fieldops-app

Operating instructions for coding agents working in this repo.
Style and architecture live in `.cursor/rules/*.mdc` and `CLAUDE.md`. This file is *process*.

## Source of truth

1. Product brief / assignment requirements (and `docs/architecture-foundation.md` for foundation decisions)
2. How to build: `.cursor/rules/*.mdc` (always apply)
3. Trade-offs: root `DECISIONS.md` (see `030-decisions.mdc`)

If a rule and the requirements conflict, requirements win. Engineering defaults in the rules fill gaps the requirements leave open.

## Setup

npm only for this repo (lockfile `package-lock.json`):

```bash
# Terminal A — mock API (Node 18+)
npm run mock-api
# or: node mock-api/server.js

# Terminal B — app
cp -n .env.example .env   # set EXPO_PUBLIC_API_URL for physical devices to your LAN IP
npm install
npm start                 # then i / a / Expo Go (must match SDK 57)
```

- iOS simulator API: `http://localhost:4000`
- Android emulator API: `http://10.0.2.2:4000`
- Physical device: `http://<LAN-IP>:4000`

Before calling a task done: typecheck and relevant tests must pass once those scripts exist. A change that only looks right in source is not done.

## Rule index (current)

| File | Covers |
| --- | --- |
| `000-architecture.mdc` | Folder layers, dependency isolation, theme |
| `010-coding-and-docs.mdc` | TypeScript/RN, TSDoc, performance |
| `020-testing.mdc` | Risk-surface tests |
| `030-decisions.mdc` | Root `DECISIONS.md` |
| `040-git-commits.mdc` | Conventional Commits for this app repo |
| `050-ponytail.mdc` | Prefer simplest working solution |
| `060-styling-nativewind.mdc` | NativeWind host + UI preset |
| `070-integrations.mdc` | Third-party ports |
| `080-tanstack-query.mdc` | Query keys, cursor, optimism |
| `090-forms.mdc` | RHF + Zod adapters |

## Task loop

1. Read the relevant `.cursor/rules/*.mdc` file(s) for the area touched — do not rely on stale session memory.
2. Place code in the correct layer:
   - tokens → `core/theme`
   - config / messages → `core/config` / `core/constants`
   - pure helpers → `core/utils` or feature `utils/`
   - types/mappers → `core/types` (shared) or `features/.../types` (feature-local)
   - third-party wrappers → `core/integrations/*`
   - feature resource calls → `features/.../services/`
   - ViewModels → `features/<feature>/<area>/hooks/`
   - UI → `features/.../components` or `screens`
   - routes → thin `app/` files only
3. Features must not import vendor packages that have an integrations port.
4. Make the smallest coherent change that satisfies one requirement.
5. Add/update tests per `020-testing.mdc`.
6. Add/update TSDoc per `010-coding-and-docs.mdc`.
7. Log trade-offs in `DECISIONS.md` same turn per `030-decisions.mdc`.
8. Commit per `040-git-commits.mdc` only when the human asks for a commit (unless an explicit plan requires commit+push per layer).
9. Update `README.md` if run/install steps changed.

## Things an agent must never do unprompted

- Add a dependency not implied by the requirements without flagging for human review.
- Import Axios / Query / RHF / Zod / NativeWind / fieldops-ui / expo-image inside features.
- Put adapter code inside a feature folder.
- Collapse this repo into a monorepo with `fieldops-ui`.
- Modify `mock-api/server.js`.
- Widen scope (auth, offline, settings, dark mode, EAS) without an explicit ask.
- Disable a lint or type-check rule to force a green build instead of fixing the root cause.
- Commit unless the human explicitly asks (foundation plans that mandate per-layer push are the exception).
- Invent a second design theme.

## Decision logging

This repo owns root `DECISIONS.md`. Law: `030-decisions.mdc`.

Grader sections plus working feature notes in the **same** file.
