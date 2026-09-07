# FieldOps App

Expo SDK **57** work-order app. Consumes [`@pranadwaghmare2/fieldops-ui`](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui) from **npm** (not a monorepo).

| Doc | Purpose |
| --- | --- |
| [docs/architecture-foundation.md](docs/architecture-foundation.md) | Project structure and why |
| [DECISIONS.md](DECISIONS.md) | Trade-offs graders read closely |

**Review path:** clone → mock API → `.env` → `npm start` → Expo Go / simulator (SDK 57).  
No checked-in APK. No `expo prebuild` / native `android`/`ios` project required.

Works on **macOS**, **Windows**, and **Linux** for Node + Expo Go. iOS Simulator requires **macOS + Xcode**.

---

## 1. Prerequisites

### Required (any OS)

| Tool | Notes |
| --- | --- |
| **Git** | Clone the repo |
| **Node.js 18+** | LTS recommended |
| **npm** | Ships with Node (`package-lock.json` only — not yarn/pnpm) |
| **Expo Go matching SDK 57** | Phone/tablet, or use a simulator below. Older Expo Go = common start failure |

### Optional — Android emulator

| Tool | Notes |
| --- | --- |
| **Android Studio** | SDK + AVD (e.g. Pixel). Then `npm run android` or press `a` in Expo |

### Optional — iOS simulator

| Tool | Notes |
| --- | --- |
| **macOS + Xcode** | Open Xcode once to finish setup. Then `npm run ios` or press `i` |
| Windows / Linux | Cannot run iOS Simulator — use Expo Go on a physical iPhone |

### Optional — physical device on LAN

Phone and the machine running `mock-api` on the **same Wi‑Fi**. Use the machine’s LAN IP in `.env` (not `localhost`).

---

## 2. Clone

```bash
git clone https://github.com/pranadwaghmare2/fieldops-app.git
cd fieldops-app
```

Windows (PowerShell or Git Bash): same commands if Git and Node are on `PATH`.

---

## 3. Mock API (required for data)

Dedicated terminal — leave running:

```bash
npm install
npm run mock-api
```

- Base URL: `http://localhost:4000`
- Disable random status `500`s while debugging: `CHAOS=0 npm run mock-api`
- Do **not** modify `mock-api/server.js`

---

## 4. Configure `.env`

```bash
cp -n .env.example .env
```

Windows PowerShell if `cp -n` fails:

```powershell
Copy-Item .env.example .env -ErrorAction SilentlyContinue
```

Set **one** API URL for how you run the app:

| Where the app runs | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS Simulator (Mac) | `http://localhost:4000` |
| Android Emulator | `http://10.0.2.2:4000` |
| Physical device (Expo Go) | `http://<YOUR_LAN_IP>:4000` |

Find LAN IP:

- macOS: `ipconfig getifaddr en0` (or System Settings → Network)
- Windows: `ipconfig` (Wi‑Fi IPv4)
- Linux: `hostname -I` or `ip a`

**Restart Expo** after any `.env` change (`Ctrl+C`, then `npm start` again).

---

## 5. Install and start the app

Second terminal (mock-api still running):

```bash
npm install
npm start
```

Then:

| Action | How |
| --- | --- |
| Expo terminal | Press `i` (iOS sim, macOS), `a` (Android emu), or scan QR with **Expo Go SDK 57** |
| Or scripts | `npm run ios` / `npm run android` — both use **`expo start`**, not a native prebuild |

These commands open Metro and Expo Go / the simulator. They do **not** generate or require `android/` or `ios/` folders.

---

## 6. Physical device (Expo Go)

1. Install **Expo Go for SDK 57**.
2. `npm run mock-api` on your computer.
3. `.env`: `EXPO_PUBLIC_API_URL=http://<LAN-IP>:4000`.
4. Same Wi‑Fi as the computer.
5. `npm start` → scan QR.
6. If the list fails: firewall port **4000**, LAN IP not `localhost`, mock-api still running.

---

## 7. Emulators

### Android

1. Android Studio → create/start an AVD.
2. `.env`: `http://10.0.2.2:4000`.
3. `npm start` → `a`, or `npm run android`.

### iOS (macOS only)

1. Xcode installed and opened once.
2. `.env`: `http://localhost:4000`.
3. `npm start` → `i`, or `npm run ios`.

---

## 8. Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Expo Metro (`expo start`) |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` (macOS) |
| `npm run mock-api` | Local API on port 4000 |
| `npm test` | Jest |
| `npx tsc --noEmit` | Typecheck |

---

## 9. UI library and NativeWind

```bash
npm install @pranadwaghmare2/fieldops-ui
```

Already wired:

- Tailwind `content` includes `./node_modules/@pranadwaghmare2/fieldops-ui/lib/**/*.{js,jsx,ts,tsx}`
- Presets: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`
- Features import UI from `src/core/integrations/ui`

---

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Expo Go wrong SDK | Install Expo Go for **SDK 57** |
| Unstyled UI | Confirm NativeWind + UI preset + `content` scans `fieldops-ui/lib` |
| Phone cannot reach API | LAN IP in `.env`, same Wi‑Fi, mock-api up, firewall allows **4000** |
| Android emu API fail | Use `http://10.0.2.2:4000`, not `localhost` |
| `.env` ignored | Restart `npm start` |
| Expecting `android/` / `ios/` folders | Not used — Expo Go path only; do not run `expo prebuild` for review |

---

## 11. What ships

- **List** — cursor pagination, status filter, debounced search, pull-to-refresh, distinct empty / filtered / error
- **Detail** — full record, optimistic status + rollback + Retry, Edit, Delete (confirm), header **Back** to list
- **Create / edit** — one form (mode by route), Zod + 422 field map, 409 Keep mine / Load theirs, checklist add/remove/reorder
