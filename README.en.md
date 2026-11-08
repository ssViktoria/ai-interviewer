# 🎤 AI Mock Interviewer

[🇺🇦 Українська](./README.md) · 🇬🇧 English

A desktop app for preparing for technical interviews. The AI runs a realistic screening on your chosen topic, asks questions one at a time, comments on each answer, and finishes with a structured final report.

The project is built on **Expo (React Native + Expo Router)**, runs as a web app, and is packaged as a desktop app with **Electron** (Windows, Linux, macOS).

---

## ✨ Features

- **4 interview tracks:**
  - 📱 **React Native Core**: lifecycle, hooks (`useState`, `useEffect`, `useCallback`), JSX, `FlatList`, styling
  - ⚡ **JavaScript & TypeScript**: Event Loop, promises, `async/await`, Generics, closures, prop typing
  - 🧭 **Navigation & State**: Expo Router, file-based routing, React Context, Zustand / Redux Toolkit
  - 🤝 **Soft Skills & Behavioral Questions**: teamwork, conflict resolution, estimating deadlines, Code Review
- **3 difficulty levels:**

  | Level | Number of questions |
  | --- | --- |
  | Trainee / Intern | 3 |
  | Junior Dev | 5 |
  | Junior+ Dev | 6 |

- **AI model selection** (free, budget, mid-tier, and flagship) via OpenRouter
- Full-screen interview mode on top of the tabs
- Final report: overall score (X out of 10), strengths, areas for improvement, topics to review
- Settings screen: API key and model selection
- Dark theme

---

## 🔄 How it works

1. You pick a **topic** and a **level** on the home screen.
2. The app builds a system prompt (`src/services/prompts.ts`): the AI plays a Senior Mobile Engineer / Tech Lead and speaks Ukrainian.
3. The AI asks **one question at a time** in the format `[Question X/N]`. After each of your answers it gives brief feedback (1–2 sentences) and asks the next question.
4. After the last question, the AI produces a **final report**.
5. Requests go straight from the app to [OpenRouter](https://openrouter.ai/) via the official `@openrouter/sdk`. `<think>…</think>` tags from reasoning models are stripped automatically.

---

## 🧱 Tech stack

| Area | Stack |
| --- | --- |
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Navigation | Expo Router, React Navigation (Bottom Tabs) |
| Styling | NativeWind 4 + Tailwind CSS 3 |
| Animations | React Native Reanimated 4, Gesture Handler |
| AI | [OpenRouter SDK](https://openrouter.ai/) (`@openrouter/sdk`) |
| Storage | `expo-secure-store` |
| Desktop | Electron 44 + electron-builder |
| Language | TypeScript |

---

## 📋 Requirements

- **Node.js** LTS (20 or newer recommended) and **npm**
- **Git**
- An [OpenRouter](https://openrouter.ai/keys) API key
- To build for a specific OS, it's best to build **on that same OS** (see the "Building" section)

---

## 🚀 Quick start

```bash
# 1. Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd ai-interviewer

# 2. Install dependencies
npm install

# 3. (Optional) create .env.local with your API key
echo "EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx" > .env.local
```

### Running in development

**As a desktop app (Electron + Fast Refresh):**

```bash
npm run electron:dev
```

This command runs in parallel:
1. starts the Expo web server at `http://localhost:8081` (with cache reset `-c`);
2. waits until port `8081` is available (`wait-on`);
3. launches Electron (`electron/main.js`) with `NODE_ENV=development`, and the window connects to Metro.

**Browser only:**

```bash
npm run web
```

**On a mobile device / emulator:**

```bash
npm start          # Expo Dev Tools (QR code for Expo Go)
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
```

> ⚠️ The main target platform is **desktop (Electron)**. Mobile launches are available but are not a priority.

---

## 🔑 API key setup

If no key is found, the home screen shows a **"Потрібно налаштувати ключ" (API key required)** badge.

The key is looked up in this order (`src/services/storage.ts`):

1. **App settings**: a key entered manually on the Settings tab, stored via `expo-secure-store`.
2. **Environment variable** `EXPO_PUBLIC_OPENROUTER_API_KEY` from `.env.local` (fallback).

Get a key at [openrouter.ai/keys](https://openrouter.ai/keys).

> 🔒 **Important:** variables prefixed with `EXPO_PUBLIC_` are **embedded into the JavaScript bundle** at build time. If you build an installer (`electron:dist*`) with a key in `.env.local`, it ends up in `dist/` and is accessible to anyone who gets your build. For public releases, remove the key from `.env.local` and let users enter their own in Settings. Never commit `.env.local` to git.

---

## 🤖 Models

The model list lives in `src/constants/models.ts`. The default model is `openrouter/free` (automatically picks the least-loaded free model).

| Tier | Examples | Approx. price |
| --- | --- | --- |
| 🆓 Free | OpenRouter Free Router, NVIDIA Nemotron 3 Ultra 550B, Nemotron 3.5 Lightning, Cohere North Mini Code | Free |
| 💸 Budget | Llama 3.1 8B, Llama 3.3 70B, GPT-4o-mini, DeepSeek V3 | ~$0.05–0.25 / 1M tokens |
| ⚖️ Mid | DeepSeek R1, Claude Haiku 4.5, o3 Mini, Claude Sonnet 5.5, GPT-4o | ~$0.70–2.50 / 1M |
| 🏆 Flagship | Claude Opus 5.5, Claude Fable 5.1, OpenAI o1, Claude Opus 4.1 | ~$4–15 / 1M |

> Prices are approximate; see [openrouter.ai/models](https://openrouter.ai/models) for current rates. Free models have rate limits: on a 429 error the app asks you to retry in a minute.

If the saved model is no longer in the list, the app falls back to the default model automatically.

---

## 📦 Building the desktop app

All builds run in two stages (already combined into npm scripts):

1. `expo export --platform web` builds the web version into `dist/`
2. `electron-builder` packages `dist/` + `electron/` into an installer

Finished files appear in **`dist-electron/`**.

### Command summary

| Task | Command |
| --- | --- |
| Build the web version only | `npm run build:web` |
| Unpacked build without an installer (for testing) | `npm run electron:pack` |
| Build for the current OS | `npm run electron:dist` |
| Build for Windows | `npm run electron:dist:win` |
| Build for Linux | `npm run electron:dist:linux` |
| Build for macOS | `npm run electron:dist:mac` |

### 🪟 Windows

```bash
npm install
npm run electron:dist:win
```

Output in `dist-electron/`:
- `*.exe`: **NSIS** installer
- `*-portable.exe`: portable version, no installation required

### 🐧 Linux

```bash
npm install
npm run electron:dist:linux
```

Output in `dist-electron/`:
- `*.AppImage`: runs without installation
- `*.deb`: package for Debian / Ubuntu

```bash
# AppImage
chmod +x "AI Mock Interviewer-1.0.0.AppImage"
./"AI Mock Interviewer-1.0.0.AppImage"

# deb
sudo dpkg -i ai-interviewer_1.0.0_amd64.deb
```

> Exact file names depend on the version in `package.json`. On Linux the app automatically disables Vulkan (`disable-features=Vulkan`) to avoid Wayland compatibility issues.

### 🍎 macOS

```bash
npm install
npm run electron:dist:mac
```

Output: a `*.dmg` in `dist-electron/`.

> ⚠️ Building for macOS is **only possible on macOS**. Without an Apple Developer signature, you may need to *right-click the app → Open* on first launch.

### Cross-platform builds

`electron-builder` can build for other OSes, with limitations:

- `dmg` can only be built on macOS;
- building `nsis` for Windows on Linux/macOS requires Wine;
- the most reliable approach is to build on each OS separately (or use GitHub Actions with a `windows-latest` / `ubuntu-latest` / `macos-latest` matrix).

---

## 🖥 How Electron works here

The `electron/main.js` file:

- **Development mode** (`NODE_ENV=development`): the window opens `http://localhost:8081` (Metro / Expo web) with Fast Refresh.
- **Production**: the app starts a lightweight built-in HTTP server on `127.0.0.1` on a random free port and serves the contents of `dist/`. This solves the absolute `/_expo/...` path problem in the static bundle without external dependencies. The server supports an SPA fallback to `index.html`, clean URLs (`/settings` → `settings.html`), and directory traversal protection.
- **Window**: initial size 480×850, minimum 400×600, menu bar hidden, `contextIsolation` on, `nodeIntegration` off, `preload.js` attached.
- **External links** (`http(s)://`) open in the OS default browser, not inside the app window.
- The server stops when all windows are closed. On macOS the app stays in the dock until explicitly quit.

---

## 🗂 Project structure

```text
ai-interviewer/
├── electron/
│   ├── main.js                # Electron main process (window, built-in server)
│   └── preload.js             # Preload script
├── src/                       # The "@/" alias points here
│   ├── app/                   # Screens and routes (Expo Router)
│   │   ├── _layout.tsx        # Root layout: SafeAreaProvider, Stack, fonts
│   │   ├── +html.tsx          # HTML wrapper for web (window height, background)
│   │   ├── interview.tsx      # Full-screen interview screen
│   │   └── (tabs)/            # Bottom tab navigation
│   │       ├── _layout.tsx    # Tab configuration
│   │       ├── index.tsx      # Home: topic and level selection
│   │       └── settings.tsx   # Settings: API key, model selection
│   ├── components/
│   │   ├── AppModal.tsx       # Modal dialog
│   │   └── MessageBubble.tsx  # Chat message bubble
│   ├── constants/
│   │   ├── models.ts          # List of available AI models
│   │   └── topics.ts          # Interview topics and levels
│   ├── services/
│   │   ├── openrouter.ts      # OpenRouter requests, error handling
│   │   ├── prompts.ts         # Interviewer system prompt
│   │   └── storage.ts         # API key and model (SecureStore / .env)
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── assets/                    # Icons, images
├── global.css                 # Tailwind / NativeWind
├── .env.local                 # Local API key (do not commit!)
├── app.json                   # Expo config
├── dist/                      # build:web output (generated)
├── dist-electron/             # Finished installers (generated)
└── package.json
```

---

## 🧩 Customization

**Add a new interview topic:** add an object to `INTERVIEW_TOPICS` (`src/constants/topics.ts`):

```ts
{
  id: "testing",
  title: "Testing",
  icon: "🧪",
  description: "Jest, React Native Testing Library, mocks.",
}
```

**Change levels or the number of questions:** edit `INTERVIEW_LEVELS` in `src/constants/topics.ts`.

**Add or remove an AI model:** edit `AVAILABLE_MODELS` in `src/constants/models.ts` (find model IDs at [openrouter.ai/models](https://openrouter.ai/models)).

**Change interviewer behavior** (tone, language, report format): `buildInterviewSystemPrompt` in `src/services/prompts.ts`.

---

## 🛠 Troubleshooting

**Icons don't show in the bottom bar**
The Ionicons font must be loaded in the root `src/app/_layout.tsx`:

```tsx
const [fontsLoaded] = useFonts({ ...Ionicons.font });
if (!fontsLoaded) return null;
```

**Bottom bar is cut off / extends past the window**
Make sure `src/app/+html.tsx` exists with the rule `html, body, #root { height: 100%; overflow: hidden; }`, and that `tabBarStyle` has no fixed `height`.

**`electron:dev` hangs waiting for the port**
Check that port `8081` isn't used by another process and that Expo started successfully. Try running `npm run web` separately.

**White screen after build**
Make sure `npm run build:web` created a `dist/` folder containing `index.html`. In production, `electron/main.js` serves exactly that folder.

**"Invalid API key" error (401)**
Check the key in Settings. A key stored in SecureStore takes priority over `.env.local`, so an old saved key may override the new one from `.env`.

**429 error on a free model**
Free models are rate-limited. Wait a minute or pick another model in Settings.

**Stale Metro cache**

```bash
npx expo start --web -c
```

---

## 📜 Scripts

| Script | Description |
| --- | --- |
| `start` | Expo Dev Server |
| `android` / `ios` / `web` | Run on the respective platform |
| `lint` | Lint the code (`expo lint`) |
| `electron:dev` | Develop in Electron with Fast Refresh |
| `build:web` | Export the web version to `dist/` |
| `electron:pack` | Build without an installer (folder) |
| `electron:dist` | Installer for the current OS |
| `electron:dist:win` / `:linux` / `:mac` | Installer for a specific OS |

---

## 👤 Author

**Alex**: alexwork24@outlook.com