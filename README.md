# FieldOps App

Expo SDK **57** work-order app that consumes [`@pranadwaghmare2/fieldops-ui`](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui) from npm.

Architecture: [`docs/architecture-foundation.md`](docs/architecture-foundation.md).  
Decisions: [`DECISIONS.md`](DECISIONS.md).  
Agent map: [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md).

## Prerequisites

- Node 18+
- npm
- Expo Go matching **SDK 57** (or iOS Simulator / Android Emulator)

Do **not** use an Expo Go build for an older SDK — that mismatch is a common start failure.

## Run from a clean clone

```bash
git clone https://github.com/pranadwaghmare2/fieldops-app.git
cd fieldops-app
cp .env.example .env
```

### 1. Mock API

```bash
npm run mock-api
# http://localhost:4000
# CHAOS=0 npm run mock-api   # disable random status 500s while debugging
```

Do not modify `mock-api/server.js`.

### 2. API URL (`.env`)

| Target | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS simulator | `http://localhost:4000` |
| Android emulator | `http://10.0.2.2:4000` |
| Physical device (Expo Go) | `http://<your-machine-LAN-IP>:4000` |

Phone and laptop must be on the same network. Restart Expo after changing `.env`.

### 3. App

```bash
npm install
npm start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with Expo Go (SDK 57).

Scripts:

- `npm start` — Expo dev server
- `npm run ios` / `npm run android` — open platform
- `npm run mock-api` — local API
- `npm test` — Jest
- `npx tsc --noEmit` — typecheck

## UI library

```bash
npm install @pranadwaghmare2/fieldops-ui
```

NativeWind host wiring (already in this repo):

- Tailwind `content` includes `./node_modules/@pranadwaghmare2/fieldops-ui/lib/**/*.{js,jsx,ts,tsx}`
- Presets: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`
- Features import components from `src/core/integrations/ui`, not the package path

## Project layout (short)

```
app/                 Expo Router shells + providers
src/core/            theme, config, types, integrations
src/features/        work-orders (list screen live; detail/form stubs)
mock-api/            local Node API
```

## Status

Screen 1 (work-order list) is live: cursor pagination, status filter, debounced search, pull-to-refresh, distinct empty/error states. Detail and create routes are placeholders for now.
