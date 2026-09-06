# DECISIONS.md — fieldops-app

One-page handoff artifact for graders. Working notes live below the divider.

## 1. Five decisions to defend

### Hook ViewModels with feature folders
- **Why:** Need MVVM clarity without class boilerplate for three screens.
- **What:** Screen calls one hook ViewModel; feature areas use `hooks/`, `components/`, `screens/`.
- **Rejected:** Class ViewModels — too much ceremony for the time budget.
- **How:** `src/features/work-orders/{list,detail,form}/…`

### Integrations isolate every vendor
- **Why:** Team must be able to swap Axios / Query / RHF / Zod / NativeWind / expo-image in one place.
- **What:** Features import only `src/core/integrations/*` ports.
- **Rejected:** Direct vendor imports in screens — couples UI to SDKs.
- **How:** Ports `http`, `query`, `form`, `styling`, `ui`, `image`.

### npm `@pranadwaghmare2/fieldops-ui`
- **Why:** Brief requires a real package boundary, not a monorepo.
- **What:** Install from public npm; host NativeWind + UI preset.
- **Rejected:** Relative `file:` / monorepo — easier but fails the exercise.
- **How:** See README NativeWind `content` + preset wiring.

### `EXPO_PUBLIC_API_URL` for API host
- **Why:** Simulators, emulators, and phones need different base URLs.
- **What:** Documented env var; reviewer sets LAN IP for physical devices.
- **Rejected:** In-app settings screen — out of scope and costs budget.
- **How:** `.env.example` + `src/core/config/env.ts`

### Expo SDK 57 blank-typescript + Expo Router
- **Why:** Brief pins SDK 57; blank template keeps scaffold lean.
- **What:** `blank-typescript@sdk-57`, then add Expo Router and NativeWind.
- **Rejected:** Copying library `example-expo` (SDK 51) — breaks Expo Go.
- **How:** `docs/plan-foundation.md` Task 3

## 2. NativeWind / UI package boundary

- **Problem:** Published components carry class strings. Without host NativeWind + scanning `node_modules/@pranadwaghmare2/fieldops-ui/lib`, styles vanish. Without the shipped preset, tokens diverge.
- **Solution:** App owns babel/metro/`global.css`; Tailwind presets include `nativewind/preset` and `@pranadwaghmare2/fieldops-ui/preset`; features use `integrations/ui`.
- **Cost:** Host setup docs; peer pins; silent unstyled `className` if `content` is wrong.

## 3. 409 conflict behaviour

Not implemented yet (foundation only). Will choose an approach that **never silently discards** typed input; document the technician UX here when the form feature lands.

## 4. What we cut

- **Cut:** Work-order list / detail / form screens in this foundation pass  
  **Why:** Plan scoped to rules + scaffold + ports  
  **Rejected alternative:** Building screens before architecture landed
- **Cut:** Auth, offline, settings, EAS, dark mode, splash polish  
  **Why:** Explicitly not required by the brief  
  **Rejected alternative:** Spending budget on polish

## 5. AI tools used and where

- **Tool:** Cursor Agent  
  **Where:** Foundation architecture, Cursor rules, Expo scaffold, integration stubs, docs  
  **Not used for:** Final feature UX decisions still pending human review

---

## Working notes

### Feature: work-order list
(pending)

### Feature: work-order detail
(pending)

### Feature: work-order form
(pending)
