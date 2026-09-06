# FieldOps App

Expo SDK **57** work-order app. Consumes [`@pranadwaghmare2/fieldops-ui`](https://www.npmjs.com/package/@pranadwaghmare2/fieldops-ui) from **npm** (not a monorepo).

| Doc | Purpose |
| --- | --- |
| [docs/architecture-foundation.md](docs/architecture-foundation.md) | Project structure and why |
| [DECISIONS.md](DECISIONS.md) | Trade-offs graders read closely |
| [docs/builds/](docs/builds/) | Optional Android release APK (install smoke only) |

**Primary review path:** clone → run mock API → set `.env` → Expo Go / simulator (steps below).  
**APK path:** convenience sideload only — it does **not** replace Expo Go for talking to your local mock-api unless you rebuild with a LAN URL.

Works on **macOS**, **Windows**, and **Linux** for Node + Expo Go. iOS Simulator requires **macOS + Xcode**.

---

## 1. Quick path — Android APK (optional)

Use this only to confirm the binary installs. For real list/detail/form data against mock-api, use sections 4–8.

1. Download [`docs/builds/fieldops-app-release.apk`](docs/builds/fieldops-app-release.apk) from this repo (or clone and open that path).
2. Copy the APK to an Android phone or emulator.
3. On the device: allow **Install unknown apps** / **Install from this source** for Files / Chrome / ADB (assessment APK is not from Play Store; it is safe to sideload for this review — no malware intent).
4. Open the APK and install.
5. Launch **FieldOps**.

**Important:** The release APK bakes `EXPO_PUBLIC_API_URL` at **build** time. The checked-in APK is a smoke build (typically `localhost`), so a physical phone will **not** reach your laptop’s mock-api without a rebuild. Prefer Expo Go + LAN `.env` for functional review.

More install notes: [docs/builds/README.md](docs/builds/README.md).

---

## 2. Prerequisites

### Required (any OS — to run from source)

| Tool | Notes |
| --- | --- |
| **Git** | Clone the repo |
| **Node.js 18+** | LTS recommended |
| **npm** | Ships with Node (this repo uses `package-lock.json` only — not yarn/pnpm) |

### Required for interactive app review

| Tool | Notes |
| --- | --- |
| **Expo Go matching SDK 57** | Phone or tablet. Older Expo Go = common start failure. Install from App Store / Play Store and confirm SDK 57. |

### Optional — Android emulator

| Tool | Notes |
| --- | --- |
| **Android Studio** | Install Android SDK + create an AVD (e.g. Pixel) |
| **ANDROID_HOME** | Point at the SDK (Studio usually sets this) |
| **JDK 17+** | Needed if you also build a local release APK |

### Optional — iOS simulator

| Tool | Notes |
| --- | --- |
| **macOS** | Required |
| **Xcode** (current stable) | Install from App Store; open once to finish setup |
| **Xcode Command Line Tools** | `xcode-select --install` if prompted |
| **CocoaPods** | Only if you generate a native `ios/` project; Expo Go path does not need it |

Windows and Linux **cannot** run the iOS Simulator. Use Expo Go on a physical iPhone, or Android emulator / Expo Go on Android.

### Optional — physical device on LAN

| Need | Notes |
| --- | --- |
| Same Wi‑Fi | Phone and the machine running `mock-api` |
| LAN IP of that machine | Used in `.env` (not `localhost`) |

---

## 3. Clone

```bash
git clone https://github.com/pranadwaghmare2/fieldops-app.git
cd fieldops-app
```

Windows (PowerShell or Git Bash): same commands if Git and Node are on `PATH`.

---

## 4. Mock API (required for data)

Open a **dedicated terminal** and leave it running:

```bash
npm install
npm run mock-api
```

- Base URL: `http://localhost:4000`
- Disable random status `500`s while debugging: `CHAOS=0 npm run mock-api`
- Do **not** modify `mock-api/server.js`

---

## 5. Configure `.env`

```bash
cp -n .env.example .env
```

On Windows PowerShell if `cp -n` is unavailable:

```powershell
Copy-Item .env.example .env -ErrorAction SilentlyContinue
```

Edit `.env` and set **one** of:

| Where the app runs | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS Simulator (Mac) | `http://localhost:4000` |
| Android Emulator | `http://10.0.2.2:4000` |
| Physical device (Expo Go) | `http://<YOUR_LAN_IP>:4000` |

Examples of finding LAN IP:

- macOS: System Settings → Network, or `ipconfig getifaddr en0`
- Windows: `ipconfig` (IPv4 of Wi‑Fi adapter)
- Linux: `ip a` or `hostname -I`

**Restart Expo** after any `.env` change (`Ctrl+C`, then `npm start` again).

Default in `.env.example` is `http://localhost:4000` (simulators).

---

## 6. Install and start the app

Second terminal (mock-api still running):

```bash
npm install
npm start
```

Then:

| Action | How |
| --- | --- |
| Open iOS Simulator | Press `i` in the Expo terminal (**macOS + Xcode** only) |
| Open Android emulator | Start an AVD in Android Studio, then press `a` |
| Expo Go on a phone | Scan the QR code with Expo Go (**SDK 57**) |

Also:

```bash
npm run ios      # macOS only — opens iOS
npm run android  # opens Android if emulator/device ready
```

---

## 7. Physical device (Expo Go)

1. Install **Expo Go for SDK 57** on the phone.
2. Run `npm run mock-api` on your computer.
3. Set `EXPO_PUBLIC_API_URL=http://<LAN-IP>:4000` in `.env`.
4. Phone and computer on the **same Wi‑Fi** (guest networks often block device-to-device).
5. `npm start` → scan QR with Expo Go.
6. If the list fails to load: confirm firewall allows port **4000**, URL is LAN IP not `localhost`, and mock-api is still running.

---

## 8. Emulators

### Android (Android Studio)

1. Install Android Studio → SDK Manager → install a recent platform + system image.
2. Device Manager → create Virtual Device → start it.
3. Set `.env` to `http://10.0.2.2:4000` (emulator alias for host `localhost`).
4. `npm start` → press `a`, or `npm run android`.

### iOS Simulator (macOS only)

1. Install Xcode → open once → install components if asked.
2. Set `.env` to `http://localhost:4000`.
3. `npm start` → press `i`, or `npm run ios`.

---

## 9. Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run ios` | Open iOS (macOS) |
| `npm run android` | Open Android |
| `npm run mock-api` | Local API on port 4000 |
| `npm test` | Jest |
| `npx tsc --noEmit` | Typecheck |

---

## 10. UI library and NativeWind (host duties)

```bash
npm install @pranadwaghmare2/fieldops-ui
```

Already wired in this repo:

- Tailwind `content` includes `./node_modules/@pranadwaghmare2/fieldops-ui/lib/**/*.{js,jsx,ts,tsx}`
- Presets: `nativewind/preset` + `@pranadwaghmare2/fieldops-ui/preset`
- Features import UI from `src/core/integrations/ui`, never the package path directly

If styles look “unstyled”, the host `content` scan or preset is wrong — see `DECISIONS.md` §2.

---

## 11. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Expo Go won’t open / wrong SDK | Install Expo Go that supports **SDK 57** (not an older Go) |
| Blank / unstyled components | Confirm NativeWind + UI preset + `content` includes `fieldops-ui/lib` |
| Phone cannot reach API | Use LAN IP in `.env`, same Wi‑Fi, mock-api running, firewall allows **4000** |
| Android emu cannot reach API | Use `http://10.0.2.2:4000`, not `localhost` |
| `.env` change ignored | Restart `npm start` |
| Cleartext / HTTP blocked | App enables cleartext for local mock-api; still use `http://` as documented |
| APK installs but no data | Expected for smoke APK — use Expo Go path for functional review |

---

## 12. What ships

- **List** — cursor pagination, status filter, debounced search, pull-to-refresh, distinct empty / filtered / error
- **Detail** — full record, optimistic status + rollback + Retry, Edit, Delete (confirm)
- **Create / edit** — one form (mode by route), Zod + 422 field map, 409 Keep mine / Load theirs, checklist add/remove/reorder
