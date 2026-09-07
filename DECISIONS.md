# DECISIONS.md — fieldops-app

Grader handoff (~one page). Folder walkthrough: [docs/architecture-foundation.md](docs/architecture-foundation.md).

## Contents

1. [Five decisions to defend](#1-five-decisions-to-defend)
2. [NativeWind / UI package boundary](#2-nativewind--ui-package-boundary)
3. [409 conflict behaviour](#3-409-conflict-behaviour) · [how to reproduce](#reproduce-a-409-locally)
4. [What we cut](#4-what-we-cut)
5. [AI tools used and where](#5-ai-tools-used-and-where)
6. [Working notes](#working-notes)

---

## 1. Five decisions to defend

The brief mandates two repositories, TanStack Query, RHF + Zod, NativeWind, and 409 / 422 handling. Those are constraints, not decisions. The five below are the places the brief left a genuine choice — with what each one cost.

### Publish the UI library to public npm as the install path
- **Why:** The package boundary only proves itself if a reviewer installs the library the way a real consumer would — no tokens, no access to my source tree.
- **What:** The app depends on the published `@pranadwaghmare2/fieldops-ui`; the host wires the library preset and scans its shipped `lib/` for classes.
- **Rejected:** Git URL, local tarball, `file:` link, or a monorepo — all work on my machine, and all hide the packaging work the exercise is asking for.
- **Benefit:** Clean-clone install is one `npm install`; the library version is explicit and upgradeable independently of the app.
- **Cost:** Publish discipline (build output, peer ranges, semver), and a component change becomes a two-repo dance instead of one commit.
- **How:** [npm](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui) · [GitHub](https://github.com/pranadwaghmare2/fieldops-ui). Features import only `src/core/integrations/ui`.

### Explicit Retry after a status-write rollback, never a silent auto-retry
- **Why:** `PATCH /work-orders/:id/status` fails ~20% with a 500 by design. Optimistic UI without a plan for that failure either lies to the technician or hides it.
- **What:** Optimistic patch into detail **and** list caches, snapshot rollback on error, the server message on screen, and a **Retry** that re-sends the same target status.
- **Rejected:** Automatic retry with backoff — it fires after the technician has already walked away from the asset, and this endpoint is not provably idempotent. Also rejected: no optimism, which makes every tap feel broken on a depot connection.
- **Benefit:** The screen never shows a status the server refused, and recovery is one tap with the original intent intact.
- **Cost:** Rollback and cache-coherence logic that has to be tested, and a failure the technician must acknowledge rather than one that quietly fixes itself.
- **How:** `features/work-orders/detail/hooks` + `utils/patchWorkOrderCaches.ts`.

### Tuned `FlatList` + debounced server-side search, not a list library
- **Why:** The list is the screen a technician lives in — infinite cursor pages with no total, a status filter, and a search box that re-keys the query. Two different things can wreck it: wrong data (filtering only the pages already fetched) and dropped frames (measuring every row on the JS thread while new pages append).
- **What (search):** The input owns a local draft string so typing never waits on the network; a debounce promotes that draft into the query key, which sends `q` and `status` to the **server**.
- **What (virtualization):** Plain `FlatList` with explicit knobs:
  - `getItemLayout` backed by a fixed `ROW_STRIDE` (`ROW_CONTENT_HEIGHT` 104 + `spacing[2]` gap) so scroll position is arithmetic instead of measurement.
  - `initialNumToRender: 10` (about one screen), `maxToRenderPerBatch: 8`, `windowSize: 7` — small batches keep each append cheap.
  - `onEndReachedThreshold: 0.4` with a guard so only one `fetchNextPage` is ever in flight, and the stream stops when `nextCursor` is null.
  - `keyExtractor` on the server `id` — never the index, because cursor pages append.
  - `memo` on the row, `useCallback` on `renderItem` / `keyExtractor`, so a keystroke does not re-render rows.
  - `removeClippedSubviews` on iOS only.
- **Rejected:** Filtering a fetched in-memory copy (silently wrong across pages) and binding the input straight to the query key (a request per character). For rendering: FlashList — a dependency and a different measurement model for a list that is already fixed-height; `ScrollView` + `.map` — no recycling, so every page fetched stays mounted forever; index keys — they reshuffle rows on append and defeat `memo`.
- **Benefit:** Correct results across the whole dataset, one request per typing pause, no measurement pass per row, and a bounded number of mounted rows no matter how many pages the technician scrolls.
- **Cost:** Two representations of one word (draft vs applied filter) and a visible gap after the last keystroke. `ROW_STRIDE` is a coupling to the row's design — if the card grows and the constant does not, scroll offsets drift, which is why it is a named constant with the arithmetic spelled out rather than `112` inline. `removeClippedSubviews` stays off on Android, where it blanks rows.
- **How:** `list/components/WorkOrderSearchBar.tsx` (draft) → ViewModel filters → `workOrders` key factory; knobs in `list/constants/listUi.ts`, applied in `list/screens/WorkOrderListScreen.tsx`.

### One layering law across both repositories
- **Why:** Two repos plus six vendors is where an assignment usually turns into spaghetti. I wanted a single rule that answers "where does this go?" in either codebase.
- **What:** `theme|config|constants|utils|types → integrations → services → hooks → components|screens → app/`. Vendors enter only through `core/integrations/*`; a screen calls exactly one hook ViewModel; the library holds no product logic and the app holds no design-system internals.
- **Rejected:** Vendor imports wherever convenient — a Query or Axios upgrade then touches every screen. Also rejected: screens that fetch and validate inline.
- **Benefit:** Swapping a vendor is a one-folder diff, and the risky logic (cursor merge, optimistic rollback, 422 mapping, 409 merge) sits in hooks and pure utils that test without rendering.
- **Cost:** Thin wrapper files that add nothing on day one, and a standing temptation to shortcut them under time pressure.
- **How:** `.cursor/rules/000-architecture.mdc` + `070-integrations.mdc`; tests mirror `src/` under `tests/`.

### Native date picker for due dates, ISO 8601 on the wire
- **Why:** The API speaks ISO 8601, but a technician in gloves should not be typing `2026-09-12T00:07:17.602Z`. A typed ISO field turns a UX problem into a validation problem.
- **What:** A tappable field shows the locale date **and time** and opens the system picker; the form value stays ISO. iOS gets one `datetime` sheet; Android chains its native date then time dialog. Time is shown because the urgent rule is hour-based (due within 48 hours).
- **Rejected:** The ISO `TextField` — accepted by the brief, hostile on a phone. Also rejected: a hand-rolled JS calendar, which is more code and worse than the platform control.
- **Benefit:** Malformed dates become unreachable instead of merely rejected, and the urgent window is judged against a value the technician can read.
- **Cost:** One dependency (`@react-native-community/datetimepicker`, bundled in Expo Go, so still no prebuild) behind a new `integrations/datetime` port, plus the platform branch above.
- **How:** `core/integrations/datetime` + `form/components/DueDateField.tsx`; `formatDisplayDateTime` in `core/utils`.

## 2. NativeWind / UI package boundary

- **Problem:** Published components ship `className` strings. Without host NativeWind + scanning `node_modules/@pranadwaghmare2/fieldops-ui/lib`, styles vanish. Without the shipped preset, tokens diverge from the brief.
- **Solution:** App owns babel / Metro / `global.css`; Tailwind presets: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`; features import `integrations/ui`.
- **Cost:** Host docs; peer pins; silent unstyled UI if `content` is wrong. Responsive breakpoints (`sm`/`md`/`lg`) live in the **library preset**; layout shells that use them live in the **app**.

## 3. 409 conflict behaviour

A stale `version` means someone else saved first. The form keeps every local value and shows a banner that explains **why** the write was refused, then a snapshot of the fields that actually differ — yours against theirs — so the technician is choosing between concrete values rather than guessing.

Three resolutions, all explicit:

- **Keep mine & save** — re-`PATCH` the local values with `version` taken from `error.current`. Never disabled by a conflict count: the race ends as soon as no other writer lands between the 409 and this retry, and the server owns the increment, so the app never invents a version number.
- **Load theirs** — behind a confirm, `reset` the form from `current` and adopt its `version` (reload-and-re-apply). The technician then re-applies their change on a base that is known good.
- **Merge field by field** — a sheet listing only the differing fields, each a two-way radio (yours / theirs) plus *use all mine* / *use all theirs*. Apply stays disabled until every differing field has a side, so nothing is resolved by accident; the merged result is written back into the form **before** the PATCH, so it survives another conflict. If the server changes again mid-merge, the snapshot and picks rebuild and the sheet says so rather than applying stale choices.

Checklist is merged as a whole list, not per item. **Rejected:** character-level diffs and item-level checklist reconciliation — they need id-level three-way merge and a diff renderer, which is real cost for a phone screen where the honest question is only ever "whose value ships?". A field-level snapshot answers that in one glance; a character diff mostly adds reading time on site. Also rejected: silent last-write-wins and discard-without-confirm.

Status write ~20% `500`: optimistic UI rolls back; show the backend message (else copy); explicit **Retry** re-sends the last target status.

### Reproduce a 409 locally

With `npm run mock-api` and the app running:

```bash
# 1. Note a work order's id and version.
curl -s "http://localhost:4000/work-orders?limit=1" | sed 's/,/,\n/g' | grep -E '"id"|"version"'

# 2. In the app: open that work order → Edit → change Title. Do not save.

# 3. Simulate another technician saving first (use the version from step 1).
curl -i -X PATCH http://localhost:4000/work-orders/<ID> \
  -H 'Content-Type: application/json' \
  -d '{"version":<VERSION>,"title":"Server edited — panel fault confirmed on site"}'

# 4. In the app: tap Save → 409 banner with the field snapshot.
```

The server bumps `version` on every accepted `PATCH`, so step 3 is what makes the form's loaded version stale.

## 4. What we cut

- **Cut:** Auth, offline, settings, EAS/store, dark mode, splash polish, FlashList, skeletons, RTL test dep, `GET /health` UI, Status field on form, detail checklist done-toggle.  
  **Why:** Brief non-goals / status chips own status / checklist edits on Edit.  
  **Rejected alternative:** Budget on polish or duplicate status paths.
- **Cut:** Character-level diff and item-level checklist merge in the 409 sheet.  
  **Why:** Field-level "yours vs theirs" already answers the only question on site; three-way item merge is disproportionate for a phone form.  
  **Rejected alternative:** A full diff view — better for prose-heavy edits; revisit if descriptions grow long.
- **Cut:** Release APK packaging and local `expo prebuild` / native `android`/`ios` review path.  
  **Why:** Reviewers run Expo Go + Metro only. Prebuild trees and bake-time env confuse the clean-clone path.  
  **Rejected alternative:** Checked-in APK or committed native projects as the primary handoff.
- **Not cut:** `DELETE /work-orders/:id` — mock-api exposes it; detail Delete + confirm uses it.

## 5. AI tools used and where

I defined the architecture (layers, integration ports, feature MVVM, NativeWind host boundary, 409/status cache rules). AI accelerated drafting under those constraints — it did not invent the system shape.

- **Primary tool:** [Cursor](https://cursor.com) IDE (Agent).
- **Skills / workflows used:**
  - **brainstorming** — explore options and lock design before implementation.
  - **writing-plans** — turn an approved design into step-by-step implementation plans.
  - **caveman** — compress chat output / keep agent turns token-efficient while preserving technical accuracy.
  - Other Cursor agent use — draft code, tests, and handoff docs for my review and edits.
- **Where:** Foundation (theme, config, integrations, router), work-order list / detail / form (services, ViewModels, optimism, 409), architecture rules, README / DECISIONS.
- **Not used for:** Modifying `mock-api/server.js`. Every architectural choice above remains mine to defend.

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
- Zod under `form/validations/`; 422 → `applyServerFieldErrors`; checklist add/remove/reorder; done checkbox in edit only.
- Due date via `DueDateField` → system picker; value stays ISO, label uses `formatDisplayDateTime`.
- 409: `buildConflictSnapshot` (pure, tested) feeds banner + merge sheet; picks apply through `applyConflictPicks`; PATCH sends fields + `version`, never `status`.
