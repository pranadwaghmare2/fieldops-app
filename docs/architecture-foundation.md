# FieldOps App — Foundation Architecture

Approved design for the Expo app foundation (rules + scaffold). Feature screens come later.

## Goals

- Expo SDK 57 app that consumes `@pranadwaghmare2/fieldops-ui` as a real npm package.
- Feature-based MVVM with hook ViewModels.
- All third-party libraries isolated behind `src/core/integrations/*`.
- FieldOps design tokens only (brief / library preset). No second theme.
- Reviewer path: `npm install` → `npm start` → iOS / Android / Expo Go (SDK 57 match).

## Dependency direction

```
core/config|constants|theme|utils|types
        ↓
core/integrations/*   (http verbs, query, form, styling, ui, image)
        ↓
features/*/services   (resource paths → httpGet/…)
        ↓
features/*/hooks      (ViewModels)
        ↓
features/*/components + screens
        ↓
app/                  (Expo Router shells — import screens only)
```

Inner layers never import outer layers. Screens never import Axios, TanStack Query, RHF, Zod, NativeWind, `expo-image`, or `fieldops-ui` by package path. Layering law: `.cursor/rules/000-architecture.mdc`.

## Folder layout

```
app/                            # Expo Router only
src/
  core/
    theme/                      # FieldOps tokens (match UI preset)
    config/                     # JSON + EXPO_PUBLIC_API_URL
    constants/                  # copy + static config values (not enums)
    utils/                      # app-wide pure helpers (incl. toApiError)
    types/                      # enums, WorkOrder / User / envelopes
    integrations/
      http/                     # Axios client + thin verbs only
      query/                    # QueryClient + wrappers + key factory
      form/                     # RHF + Zod adapters
      styling/                  # NativeWind host bridge
      ui/                       # re-export fieldops-ui components
      image/                    # expo-image AppImage adapter
  features/
    work-orders/
      list|detail|form/
        types/
        services/               # resource paths → http verbs
        hooks/
        components/
        screens/
        constants/              # feature-local only
        utils/
mock-api/                       # do not modify server.js
DECISIONS.md
```

## SOLID in practice

| Principle | Meaning here |
| --- | --- |
| S | Screen renders; hook orchestrates; http transports; types stay pure |
| O | New API behaviour lands in integrations/repos; screens stay stable |
| L | Loading / empty / error ViewModel contracts stay consistent across screens |
| I | Narrow ports (`useAppForm`, `httpGet`) and feature services — not whole SDKs |
| D | Features depend on ports; integrations implement with vendors |

## Theme (`core/theme`)

Single FieldOps palette: `bg`, `surface`, `border`, `fg`, `fg-muted`, `primary`, `primary-fg`, `danger`, `warning`, `success`; status→tone maps; 4-point spacing; type scale; radius 10; hairline borders; system font; no shadows; no dark mode.

Tailwind host uses `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`. App theme does not invent competing colours.

## Integrations

- **http** — Axios instance from `EXPO_PUBLIC_API_URL`; thin `httpGet`/… verbs; Axios → `TransportFailure` then utils `toApiError`. Feature URLs live in feature services (see `.cursor/rules/000-architecture.mdc`).
- **query** — Provider + `useAppQuery` / `useAppMutation` / `useAppInfiniteQuery` + query key factory.
- **form** — `useAppForm`, Zod helpers, `applyServerFieldErrors` for 422 maps.
- **styling** — NativeWind host wiring.
- **ui** — Re-export library components.
- **image** — `AppImage` wrapping `expo-image` for fast cached images when needed.

## Forms (when features land)

Mirror mock-api rules in Zod (title 8–120, site required, priority enum, urgent due within 48h, checklist max 10). Hidden server rule (`asbestos`) stays server-only via 422. Edit PATCH sends `version`. 409 must never silently drop typed input.

## Performance guardrails

Rules, not fixed recipes (decide at feature time):

- Keep scroll/type jank-free; virtualize long lists.
- Prefer server query params for filter/search over filtering huge local copies.
- Stable list keys; `React.memo` / `useCallback` / `useMemo` when list or profiler shows churn — not blanket.
- Debounce search before query key changes.
- Animations: `useNativeDriver` / Reanimated worklets when motion is added.

## Decisions

One root `DECISIONS.md`: grader sections (five defendable decisions, NativeWind boundary, 409 UX, cuts, AI tools) plus working feature notes below a divider.

## Explicit non-goals (foundation)

Auth, offline, settings, EAS, store icons, dark mode, work-order feature UI, modifying `mock-api/server.js`.
