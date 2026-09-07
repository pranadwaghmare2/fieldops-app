# DECISIONS.md — fieldops-app

Grader handoff. Keep dense. Deep folder walkthrough: [docs/architecture-foundation.md](docs/architecture-foundation.md).

## Menu

1. [Five decisions to defend](#1-five-decisions-to-defend)
2. [NativeWind / UI package boundary](#2-nativewind--ui-package-boundary)
3. [409 conflict behaviour](#3-409-conflict-behaviour)
4. [What we cut](#4-what-we-cut)
5. [AI tools used and where](#5-ai-tools-used-and-where)
6. [Working notes](#working-notes)

---

## 1. Five decisions to defend

### Hook ViewModels with feature folders
- **Why:** Three screens need clear MVVM without class boilerplate.
- **What:** Each screen calls one hook ViewModel; areas use `hooks/`, `components/`, `screens/`, `services/`, `types/`.
- **Rejected:** Class ViewModels — ceremony over budget; fat route files — breaks layering.
- **How:** `src/features/work-orders/{list,detail,form}/…` → thin `app/` routes.

### Integrations isolate every vendor
- **Why:** Swap Axios / Query / RHF / Zod / NativeWind / expo-image in one place.
- **What:** Features import only `src/core/integrations/*` ports.
- **Rejected:** Direct vendor imports in screens — couples UI to SDKs and fails architecture review.
- **How:** Ports `http`, `query`, `form`, `styling`, `ui`, `image`.

### npm `@pranadwaghmare2/fieldops-ui` (library vs app)
- **Why:** Brief requires a real package boundary, not a monorepo.
- **What:** App installs published npm package; library owns five components + preset tokens; app owns screens, NativeWind host, `ScreenShell` / `SurfaceCard`, and product logic.
- **Rejected:** `file:` / monorepo / copying library source into the app — easier, fails the exercise.
- **How:** README NativeWind `content` + preset; features use `integrations/ui` only. No library republish needed to change which Button `variant`/`size` the app passes.

### `EXPO_PUBLIC_API_URL` for API host
- **Why:** iOS sim, Android emu, and phones need different base URLs.
- **What:** Documented env var; reviewer sets LAN IP for physical Expo Go.
- **Rejected:** In-app settings screen — out of scope.
- **How:** `.env.example` + `src/core/config/env.ts`. Restart Expo after changes.

### Expo SDK 57 + Expo Router
- **Why:** Brief pins SDK 57; Router fits file-based screens.
- **What:** SDK 57 app; Expo Go must match; routes for list / detail / new / edit.
- **Rejected:** Older SDK or library `example-expo` (SDK 51) — breaks Expo Go.
- **How:** `docs/architecture-foundation.md` routes table.

## 2. NativeWind / UI package boundary

- **Problem:** Published components ship `className` strings. Without host NativeWind + scanning `node_modules/@pranadwaghmare2/fieldops-ui/lib`, styles vanish. Without the shipped preset, tokens diverge from the brief.
- **Solution:** App owns babel / Metro / `global.css`; Tailwind presets: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`; features import `integrations/ui`.
- **Cost:** Host docs; peer pins; silent unstyled UI if `content` is wrong. Responsive breakpoints (`sm`/`md`/`lg`) live in the **library preset**; layout shells that use them live in the **app**.

## 3. 409 conflict behaviour

Technician never loses typed input. On stale `version`, the form keeps local values and shows a banner (backend `message` when present).

- **Keep mine & save** — retry `PATCH` with `version` from `error.current` plus current form values.
- **Load theirs** — confirm, then `reset` from `current` and adopt its `version`.

Rejected silent overwrite and discard-without-confirm. Rejected field-by-field merge (too slow on site).

Status write ~20% `500`: optimistic UI rolls back; show backend message (else copy); explicit **Retry** re-POSTs last target status.

## 4. What we cut

- **Cut:** Auth, offline, settings, EAS/store, dark mode, splash polish, FlashList, skeletons, RTL test dep, `GET /health` UI, Status field on form, detail checklist done-toggle.  
  **Why:** Brief non-goals / status chips own status / checklist edits on Edit.  
  **Rejected alternative:** Budget on polish or duplicate status paths.
- **Cut:** Native due **date picker** (kept ISO `TextField`).  
  **Why:** Brief accepts ISO and will not mark down.  
  **Rejected alternative:** `@react-native-community/datetimepicker` — **better field UX** for technicians; upgrade if this ships past assessment.
- **Cut:** Release APK packaging and local `expo prebuild` / native `android`/`ios` review path.  
  **Why:** Reviewers run Expo Go + Metro only (`npm start` / `expo start --android|ios`). Prebuild trees and APK bake-time env confuse the clean-clone path.  
  **Rejected alternative:** Checked-in APK or committed native projects as the primary handoff.
- **Not cut:** `DELETE /work-orders/:id` — mock-api exposes it; detail Delete + confirm uses it.

## 5. AI tools used and where

- **Tool:** Cursor Agent  
  **Where:** Foundation, list, detail + create/edit (services, ViewModels, 409 / status optimism), architecture rules, README / DECISIONS handoff.  
  **Not used for:** Modifying `mock-api/server.js`.

---

## Working notes

### Feature: work-order list
- Enums / models / envelopes in `core/types`; copy in `core/constants/messages`.
- Infinite cursor list; debounce search in `WorkOrderSearchBar`; FlatList `getItemLayout` via `ROW_STRIDE` (surface cards + gap); memo rows; Android `removeClippedSubviews` off.
- Distinct empty / filtered-empty / error; pull-to-refresh without full-screen spinner.

### Feature: work-order detail
- Route `app/work-orders/[id]/index.tsx`.
- Optimistic status patches detail + list caches; rollback + Retry; checklist read-only (tap → edit hint); Delete confirm.
- Header **Back** always returns to list (`router.back()` or `replace('/')`) because list lives outside the nested stack.

### Feature: work-order form
- Shared screen/hook; create `/work-orders/new`, edit `/work-orders/[id]/edit`.
- Zod under `form/validations/`; 422 → `applyServerFieldErrors`; 409 Keep mine / Load theirs; checklist add/remove/reorder; done checkbox in edit only.
- PATCH sends fields + `version`, never `status`.
