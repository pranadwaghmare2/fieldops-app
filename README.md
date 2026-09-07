# FieldOps App

Expo SDK **57** work-order app. Consumes the FieldOps UI library as a **published npm package** (not a monorepo, not a relative import).

| Link | What |
| --- | --- |
| [npm `@pranadwaghmare2/fieldops-ui`](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui) | Hosted package reviewers install via `npm install` |
| [GitHub `fieldops-ui`](https://github.com/pranadwaghmare2/fieldops-ui) | UI library source repository |
| [GitHub `fieldops-app`](https://github.com/pranadwaghmare2/fieldops-app) | This app |
| [docs/architecture-foundation.md](docs/architecture-foundation.md) | Project structure and why |
| [DECISIONS.md](DECISIONS.md) | Trade-offs graders read closely |

**Review path:** clone → mock API → `.env` → `npm start` → **Expo Go** (SDK 57) on a phone, or a simulator/emulator if you already have one.  
No checked-in APK. No `expo prebuild` / native `android/` / `ios/` project required.

Works on **macOS**, **Windows**, and **Linux** for Node + Expo Go. iOS Simulator requires **macOS + Xcode**.

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone](#2-clone)
3. [Mock API](#3-mock-api-required-for-data)
4. [Configure `.env`](#4-configure-env)
5. [Install and start](#5-install-and-start-the-app)
6. [Physical device (Expo Go) — primary](#6-physical-device-expo-go--primary)
7. [Android emulator (when you need it)](#7-android-emulator-when-you-need-it)
8. [iOS Simulator (macOS, when you need it)](#8-ios-simulator-macos-when-you-need-it)
9. [Scripts](#9-scripts)
10. [UI library and NativeWind](#10-ui-library-and-nativewind)
11. [Troubleshooting](#11-troubleshooting)
12. [What ships](#12-what-ships)

---

## 1. Prerequisites

### Required on every machine

| Tool | Notes |
| --- | --- |
| **Git** | Clone the repos |
| **Node.js 20.19.4+** | React Native 0.86 requires `^20.19.4 \|\| ^22.13.0 \|\| ^24.3.0 \|\| >=25`. Node 22 LTS is the safe pick. (`mock-api` alone runs on Node 18+.) |
| **npm** | Ships with Node (`package-lock.json` only — not yarn/pnpm) |
| **Expo Go matching SDK 57** | The app that runs this project on a real phone — [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779). Wrong Expo Go major = common start failure |

### Path choice

| How you run the app | What you need |
| --- | --- |
| **Physical device + Expo Go** (recommended) | Required tools above + same Wi‑Fi as the machine running `mock-api` |
| **Android emulator** | Android Studio + SDK + Platform-Tools (`adb`) + one AVD — see [§7](#7-android-emulator-when-you-need-it). Skip install steps if already working. |
| **iOS Simulator** | **macOS only:** Xcode + iOS Simulator runtime — see [§8](#8-ios-simulator-macos-when-you-need-it). Skip install steps if already working. Windows / Linux cannot run iOS Simulator — use Expo Go on an iPhone. |

Android Studio and Xcode are **prerequisites for the emulator/simulator path**, not for Expo Go on a phone. If those tools are already installed and an emulator/simulator already boots, treat the install sections as optional and jump to the checklists.

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
  (Windows PowerShell: `$env:CHAOS=0; npm run mock-api`)
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
| Expo terminal | Press `i` (iOS Simulator, macOS), `a` (Android emulator), or scan QR with **Expo Go SDK 57** |
| Or scripts | `npm run ios` / `npm run android` — both use **`expo start`**, not a native prebuild |

These commands open Metro and Expo Go / the simulator. They do **not** generate or require `android/` or `ios/` folders.

---

## 6. Physical device (Expo Go) — primary

Expo Go is the mobile app that loads this project over Metro — no APK, no Xcode build.

1. Install **Expo Go for SDK 57**: [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779).
2. `npm run mock-api` on your computer.
3. `.env`: `EXPO_PUBLIC_API_URL=http://<LAN-IP>:4000`.
4. Same Wi‑Fi as the computer.
5. `npm start` → scan QR.
6. If the list fails: firewall port **4000**, LAN IP not `localhost`, mock-api still running.

---

## 7. Android emulator (when you need it)

Use this section only if you want the Android emulator instead of (or in addition to) a physical device. Official docs are the source of truth for Studio UI labels — they change between Studio versions.

### Install Android Studio (Windows / macOS / Linux)

Follow the OS section in Google’s install guide (do not invent alternate menu paths):

- **Install guide (Windows, macOS, Linux):** [Install Android Studio](https://developer.android.com/studio/install)
- **Download latest Studio:** [Android Studio download](https://developer.android.com/studio)
- **SDK Manager / update tools:** [Update the IDE and SDK tools](https://developer.android.com/studio/intro/update)
- **Environment variables (`ANDROID_HOME`, PATH):** [Environment variables](https://developer.android.com/tools/variables)

Complete the Setup Wizard so the Android SDK is downloaded.

### Platform-Tools and `adb`

Expo’s Android workflow expects Platform-Tools (includes `adb`) from the SDK:

- [SDK Platform-Tools](https://developer.android.com/tools/releases/platform-tools)
- [Android Debug Bridge (`adb`)](https://developer.android.com/tools/adb)

Prefer installing Platform-Tools via **SDK Manager** inside Android Studio (see the update guide above). Put `platform-tools` on your `PATH` if the shell cannot find `adb` ([environment variables](https://developer.android.com/tools/variables)).

### Create and start an AVD

- [Create and manage virtual devices](https://developer.android.com/studio/run/managing-avds)

### Checklist (skip items already true)

- [ ] Android Studio installed for your OS via the install guide
- [ ] SDK installed (Setup Wizard / SDK Manager completed)
- [ ] Platform-Tools present — `adb version` works in a terminal
- [ ] At least one system image + AVD created
- [ ] Emulator boots from Device Manager / AVD Manager
- [ ] `.env` uses `http://10.0.2.2:4000`
- [ ] mock-api running

### Run it once the emulator exists

Start the emulator from Android Studio (Device Manager), then in this repo:

```bash
# macOS / Linux / Windows (Git Bash or PowerShell)
npm run android          # = expo start --android
# or: npm start, then press "a"
```

Expo Go is installed into the emulator automatically on first run.

---

## 8. iOS Simulator (macOS, when you need it)

**Windows and Linux:** iOS Simulator is not available. Use [§6](#6-physical-device-expo-go--primary) on a physical iPhone.

### Install Xcode and Simulator (macOS)

Use Apple’s current docs (Xcode Settings UI names change; prefer these hubs over blog posts):

- **Xcode:** [Xcode on the Apple Developer site](https://developer.apple.com/xcode/) (App Store or developer downloads)
- **Run on Simulator or device:** [Running your app in Simulator or on a device](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
- **Simulator runtimes / extra platforms:** [Installing additional simulator runtimes](https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes)

Open Xcode once after install so first-launch components finish. Install an **iOS** Simulator runtime if none is present (Xcode Settings → Platforms, or the doc above).

Command-line tools (when `xcodebuild` / Simulator CLI are needed):

```bash
xcode-select -p
# If unset, point at Xcode (path may vary):
# sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### Checklist (skip items already true)

- [ ] macOS with Xcode installed and opened once
- [ ] iOS Simulator runtime installed
- [ ] Simulator boots (Xcode → Open Developer Tool → Simulator, or Expo `i`)
- [ ] `.env` uses `http://localhost:4000`
- [ ] mock-api running

### Run it once Xcode is set up

```bash
# macOS only
npm run ios              # = expo start --ios
# or: npm start, then press "i"
```

Expo picks a booted simulator, or boots one for you.

---

## 9. Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Expo Metro (`expo start`) |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` (macOS) |
| `npm run mock-api` | Local API on port 4000 |
| `npm test` | Jest |
| `npx tsc --noEmit` | Typecheck |

---

## 10. UI library and NativeWind

Package: [`@pranadwaghmare2/fieldops-ui` on npm](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui)  
Source: [`fieldops-ui` on GitHub](https://github.com/pranadwaghmare2/fieldops-ui)

```bash
npm install @pranadwaghmare2/fieldops-ui
```

Already wired in this app:

- Tailwind `content` includes `./node_modules/@pranadwaghmare2/fieldops-ui/lib/**/*.{js,jsx,ts,tsx}`
- Presets: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`
- Features import UI from `src/core/integrations/ui`

---

## 11. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Expo Go wrong SDK | Install Expo Go for **SDK 57** |
| Unstyled UI | Confirm NativeWind + UI preset + `content` scans `fieldops-ui/lib` |
| Phone cannot reach API | LAN IP in `.env`, same Wi‑Fi, mock-api up, firewall allows **4000** |
| Android emu API fail | Use `http://10.0.2.2:4000`, not `localhost` |
| `.env` ignored | Restart `npm start` |
| `adb` not found | Install Platform-Tools via SDK Manager; add to PATH ([variables](https://developer.android.com/tools/variables)) |
| Expecting `android/` / `ios/` folders | Not used — Expo Go path only; do not run `expo prebuild` for review |

---

## 12. What ships

- **List** — cursor pagination, status filter, debounced search, pull-to-refresh, distinct empty / filtered / error
- **Detail** — full record, optimistic status + rollback + Retry, Edit, Delete (confirm), header **Back** to list
- **Create / edit** — one form (mode by route), Zod + 422 field map, native due-date picker (ISO on the wire), checklist add/remove/reorder
- **409 conflicts** — banner explains why the save was refused and shows yours-vs-theirs per field; resolve with **Keep mine**, **Load theirs**, or **Merge field by field**. Typed input is never discarded silently ([DECISIONS §3](DECISIONS.md#3-409-conflict-behaviour))
