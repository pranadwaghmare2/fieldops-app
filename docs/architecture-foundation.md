# FieldOps App — Foundation Architecture

Architecture for the Expo SDK 57 FieldOps consuming app. Three screens are **live**: work-order list, detail, and create/edit.

## Goals

- Consume [`@pranadwaghmare2/fieldops-ui`](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui) as a real **npm** package (not a monorepo, not a relative import).
- Feature-based MVVM: one hook ViewModel per screen; dumb screens/components.
- Isolate every third-party library behind `src/core/integrations/*` so vendors can be swapped in one place.
- FieldOps design tokens only (brief / library preset). No second theme or dark mode.
- Talk to local `mock-api/` (do not modify `server.js`). Reviewer path: clone → mock-api → `.env` → Expo Go / simulator (SDK 57).

## Why this shape

| Constraint | Response |
| --- | --- |
| Brief requires a published UI package boundary | App installs `@pranadwaghmare2/fieldops-ui`; hosts NativeWind + preset |
| Graders / future you must swap Axios, Query, RHF, Zod, NativeWind | One port folder per vendor family under `integrations/` |
| Three screens share models and error policy | Shared `core/types` + `core/utils`; feature folders own resource URLs |
| Mock-api envelopes and chaos | Thin http verbs; pure `toApiError`; Query for cache; feature hooks own optimism / 409 |

## Dependency direction

```
core/config|constants|theme|utils|types
        ↓
core/integrations/*   (http, query, form, styling, ui, image)
        ↓
features/*/services   (resource paths → httpGet/…)
        ↓
features/*/hooks      (ViewModels)
        ↓
features/*/components + screens
        ↓
app/                  (Expo Router shells — import screens / providers only)
```

Inner layers never import outer layers. Features never import Axios, `@tanstack/*`, `react-hook-form`, `zod`, `nativewind`, `expo-image`, or `@pranadwaghmare2/fieldops-ui` by package path. Law: `.cursor/rules/000-architecture.mdc`.

## Folder layout

```
app/                            # Expo Router only
  _layout.tsx                   # SafeArea + QueryProvider + styling side-effect
  work-orders/
    index (via app index)       # list
    [id]/index.tsx             # detail
    [id]/edit.tsx              # edit form
    new.tsx                     # create form
src/
  core/
    theme/                      # FieldOps tokens (match UI preset)
    config/                     # timeouts, page size, EXPO_PUBLIC_API_URL
    constants/                  # user-facing copy (messages) — not enums
    utils/                      # isApiError, toApiError, dates, …
    types/                      # Status, Priority, WorkOrder, envelopes
    integrations/
      http/                     # Axios client + thin verbs
      query/                    # QueryClient, wrappers, key factory
      form/                     # RHF + Zod adapters, applyServerFieldErrors
      styling/                  # NativeWind host → global.css
      ui/                       # re-export fieldops-ui + ScreenShell / SurfaceCard
      image/                    # expo-image AppImage
  features/
    work-orders/
      list|detail|form/
        types/ services/ hooks/ components/ screens/
        constants/ utils/ validations/ (form)
mock-api/                       # do not modify server.js
docs/
  architecture-foundation.md    # this file
DECISIONS.md
```

## Routes

| Route | Screen |
| --- | --- |
| `/` → work orders | List |
| `/work-orders/[id]` | Detail |
| `/work-orders/new` | Create (shared form, `mode: create`) |
| `/work-orders/[id]/edit` | Edit (shared form, `mode: edit`) |

## SOLID in practice

| Principle | Meaning here |
| --- | --- |
| S | Screen renders; hook orchestrates; service calls http; types stay pure |
| O | New vendor behaviour extends a port; screens stay stable |
| L | Loading / empty / error ViewModel contracts stay distinguishable |
| I | Narrow ports (`useAppForm`, `httpGet`) — not whole SDKs in features |
| D | Features depend on ports; integrations implement with vendors |

## Theme (`core/theme`)

Single FieldOps palette: `bg`, `surface`, `border`, `fg`, `fg-muted`, `primary`, `primary-fg`, `danger`, `warning`, `success`; status→tone maps; 4-point spacing; type scale; radius 10; hairline borders; system font; no shadows; no dark mode. List rows use `surface`. Urgent priority text uses `danger`.

Host Tailwind: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`. `ScreenShell` uses preset screens (`sm` 390 / `md` 768 / `lg` 1024) for responsive column width.

## Integrations

- **http** — Axios from `EXPO_PUBLIC_API_URL`; thin `httpGet`/…; Axios → `TransportFailure` then utils `toApiError`. Feature URLs stay in feature services.
- **query** — Provider + `useAppQuery` / `useAppMutation` / `useAppInfiniteQuery` + `workOrdersKeys`.
- **form** — `useAppForm`, Zod helpers, `applyServerFieldErrors` for 422 maps. Feature owns Zod schema under `form/validations/`.
- **styling** — NativeWind host entry (`global.css`).
- **ui** — Library `Button` / `Text` / `TextField` / `Select` / `Badge` plus host `ScreenShell` / `SurfaceCard`.
- **image** — `AppImage` when needed.

## Forms (shipped)

Zod mirrors documented mock-api rules: title 8–120, site required, priority enum, urgent due within 48h, checklist max 10 with non-empty labels. Undocumented server rules arrive as 422. Edit `PATCH` sends loaded `version`. 409 never silently drops typed input (Keep mine / Load theirs). Due is ISO text (date picker cut — see `DECISIONS.md`).

## List / detail behaviour (shipped)

- List: cursor infinite query, debounced search, status filter, pull-to-refresh, distinct empty / filtered-empty / error, FlatList with `getItemLayout` and memo rows.
- Detail: optimistic status `POST …/status` patches detail + list caches; rollback + Retry on ~20% 500; Delete with confirm.

## Decisions

Root [`DECISIONS.md`](../DECISIONS.md): five defendable decisions, NativeWind boundary, 409 UX, cuts, AI tools. Working notes below the divider.

## Explicit non-goals

Auth, offline sync, settings, EAS/store publishing, dark mode, splash polish, FlashList, modifying `mock-api/server.js`, checked-in APK / committed `android`/`ios` prebuild. Primary review path is Expo Go + local mock-api via `npm start`.
