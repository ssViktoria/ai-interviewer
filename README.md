# 🎤 AI Mock Interviewer

🇺🇦 Українська · [🇬🇧 English](./README.en.md)

Десктопний застосунок для підготовки до технічних співбесід. ШІ проводить реалістичний скринінг за обраною темою, ставить запитання по одному, коментує кожну відповідь і наприкінці видає структурований підсумковий звіт.

Проєкт побудований на **Expo (React Native + Expo Router)**, працює як веб-застосунок і пакується в десктопний через **Electron** (Windows, Linux, macOS).

---

## ✨ Можливості

- **4 напрямки співбесіди:**
  - 📱 **React Native Core**: життєвий цикл, хуки (`useState`, `useEffect`, `useCallback`), JSX, `FlatList`, стилізація
  - ⚡ **JavaScript & TypeScript**: Event Loop, проміси, `async/await`, Generics, замикання, типізація пропсів
  - 🧭 **Навігація та Стан**: Expo Router, файлова структура маршрутів, React Context, Zustand / Redux Toolkit
  - 🤝 **Soft Skills & Поведінкові питання**: робота в команді, вирішення конфліктів, оцінка дедлайнів, Code Review
- **3 рівні складності:**

  | Рівень | Кількість запитань |
  | --- | --- |
  | Trainee / Intern | 3 |
  | Junior Dev | 5 |
  | Junior+ Dev | 6 |

- **Вибір ШІ-моделі** (безкоштовні, бюджетні, середнього класу та флагмани) через OpenRouter
- Повноекранний режим співбесіди поверх табів
- Підсумковий звіт: загальна оцінка (X з 10), сильні сторони, зони розвитку, теми для повторення
- Екран налаштувань: API-ключ і вибір моделі
- Темна тема

---

## 🔄 Як це працює

1. Ви обираєте **тему** та **рівень** на головному екрані.
2. Застосунок формує системний промпт (`src/services/prompts.ts`): ШІ виступає як Senior Mobile Engineer / Tech Lead і говорить українською.
3. ШІ задає **одне запитання за раз** у форматі `[Питання X/N]`. Після кожної вашої відповіді дає короткий фідбек (1–2 речення) і ставить наступне запитання.
4. Після останнього запитання ШІ видає **підсумковий звіт**.
5. Запити йдуть напряму з застосунку до [OpenRouter](https://openrouter.ai/) через офіційний `@openrouter/sdk`. Теги `<think>…</think>` з відповідей reasoning-моделей автоматично вирізаються.

---

## 🧱 Технології

| Область | Стек |
| --- | --- |
| Фреймворк | Expo SDK 57, React Native 0.86, React 19 |
| Навігація | Expo Router, React Navigation (Bottom Tabs) |
| Стилі | NativeWind 4 + Tailwind CSS 3 |
| Анімації | React Native Reanimated 4, Gesture Handler |
| ШІ | [OpenRouter SDK](https://openrouter.ai/) (`@openrouter/sdk`) |
| Зберігання | `expo-secure-store` |
| Десктоп | Electron 44 + electron-builder |
| Мова | TypeScript |

---

## 📋 Вимоги

- **Node.js** LTS (рекомендовано 20 або новіший) та **npm**
- **Git**
- API-ключ [OpenRouter](https://openrouter.ai/keys)
- Для збірки під конкретну ОС бажано збирати **на цій самій ОС** (див. розділ «Збірка»)

---

## 🚀 Швидкий старт

```bash
# 1. Клонувати репозиторій
git clone <URL_ВАШОГО_РЕПОЗИТОРІЮ>
cd ai-interviewer

# 2. Встановити залежності
npm install

# 3. (Опційно) створити .env.local з API-ключем
echo "EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx" > .env.local
```

### Запуск у режимі розробки

**Як десктопний застосунок (Electron + Fast Refresh):**

```bash
npm run electron:dev
```

Команда паралельно:
1. запускає Expo web-сервер на `http://localhost:8081` (з очищенням кешу `-c`);
2. чекає, поки порт `8081` стане доступним (`wait-on`);
3. запускає Electron (`electron/main.js`) із `NODE_ENV=development`, і вікно підключається до Metro.

**Лише в браузері:**

```bash
npm run web
```

**На мобільному пристрої / емуляторі:**

```bash
npm start          # Expo Dev Tools (QR-код для Expo Go)
npm run android    # Android-емулятор
npm run ios        # iOS-симулятор (лише macOS)
```

> ⚠️ Основна цільова платформа — **десктоп (Electron)**. Мобільні запуски доступні, але не є пріоритетом.

---

## 🔑 Налаштування API-ключа

Якщо ключ не знайдено, на головному екрані з'явиться плашка **«Потрібно налаштувати ключ»**.

Ключ шукається в такому порядку (`src/services/storage.ts`):

1. **Налаштування застосунку**: ключ, введений вручну на вкладці «Налаштування», зберігається через `expo-secure-store`.
2. **Змінна оточення** `EXPO_PUBLIC_OPENROUTER_API_KEY` з файлу `.env.local` (запасний варіант).

Отримати ключ: [openrouter.ai/keys](https://openrouter.ai/keys).

> 🔒 **Важливо:** змінні з префіксом `EXPO_PUBLIC_` **вшиваються в JavaScript-бандл** під час збірки. Якщо ви збираєте інсталятор (`electron:dist*`) із ключем у `.env.local`, він потрапить у `dist/` і буде доступний будь-кому, хто отримає ваш білд. Для публічних збірок видаляйте ключ із `.env.local` і нехай користувачі вводять власний у налаштуваннях. Файл `.env.local` не повинен потрапляти в git.

---

## 🤖 Моделі

Список моделей лежить у `src/constants/models.ts`. Модель за замовчуванням: `openrouter/free` (автоматичний вибір найменш завантаженої безкоштовної моделі).

| Категорія | Приклади | Орієнтовна ціна |
| --- | --- | --- |
| 🆓 Free | OpenRouter Free Router, NVIDIA Nemotron 3 Ultra 550B, Nemotron 3.5 Lightning, Cohere North Mini Code | Безкоштовно |
| 💸 Budget | Llama 3.1 8B, Llama 3.3 70B, GPT-4o-mini, DeepSeek V3 | ~$0.05–0.25 / 1M токенів |
| ⚖️ Mid | DeepSeek R1, Claude Haiku 4.5, o3 Mini, Claude Sonnet 5.5, GPT-4o | ~$0.70–2.50 / 1M |
| 🏆 Flagship | Claude Opus 5.5, Claude Fable 5.1, OpenAI o1, Claude Opus 4.1 | ~$4–15 / 1M |

> Ціни орієнтовні, актуальні тарифи дивіться на [openrouter.ai/models](https://openrouter.ai/models). Безкоштовні моделі мають ліміти запитів: у разі помилки 429 застосунок попросить спробувати за хвилину.

Якщо збережена модель зникла зі списку, застосунок автоматично використає модель за замовчуванням.

---

## 📦 Збірка десктопного застосунку

Усі збірки виконуються у два етапи (вони вже об'єднані в npm-скрипти):

1. `expo export --platform web` збирає веб-версію в папку `dist/`
2. `electron-builder` пакує `dist/` + `electron/` в інсталятор

Готові файли з'являються в **`dist-electron/`**.

### Зведена таблиця команд

| Завдання | Команда |
| --- | --- |
| Зібрати лише веб-версію | `npm run build:web` |
| Розпакована збірка без інсталятора (для перевірки) | `npm run electron:pack` |
| Збірка під поточну ОС | `npm run electron:dist` |
| Збірка під Windows | `npm run electron:dist:win` |
| Збірка під Linux | `npm run electron:dist:linux` |
| Збірка під macOS | `npm run electron:dist:mac` |

### 🪟 Windows

```bash
npm install
npm run electron:dist:win
```

Результат у `dist-electron/`:
- `*.exe`: інсталятор **NSIS**
- `*-portable.exe`: портативна версія, встановлення не потрібне

### 🐧 Linux

```bash
npm install
npm run electron:dist:linux
```

Результат у `dist-electron/`:
- `*.AppImage`: запускається без встановлення
- `*.deb`: пакет для Debian / Ubuntu

```bash
# AppImage
chmod +x "AI Mock Interviewer-1.0.0.AppImage"
./"AI Mock Interviewer-1.0.0.AppImage"

# deb
sudo dpkg -i ai-interviewer_1.0.0_amd64.deb
```

> Точні назви файлів залежать від версії в `package.json`. На Linux застосунок автоматично вимикає Vulkan (`disable-features=Vulkan`), щоб уникнути проблем із Wayland.

### 🍎 macOS

```bash
npm install
npm run electron:dist:mac
```

Результат: `*.dmg` у `dist-electron/`.

> ⚠️ Збірка під macOS можлива **лише на macOS**. Без підпису Apple Developer при першому запуску може знадобитися: *ПКМ по застосунку → Відкрити*.

### Крос-платформна збірка

`electron-builder` вміє збирати під інші ОС, але з обмеженнями:

- `dmg` збирається лише на macOS;
- збірка `nsis` під Windows на Linux/macOS потребує Wine;
- найнадійніше: збирати на кожній ОС окремо (або через GitHub Actions із матрицею `windows-latest` / `ubuntu-latest` / `macos-latest`).

---

## 🖥 Як працює Electron

Файл `electron/main.js`:

- **Режим розробки** (`NODE_ENV=development`): вікно відкриває `http://localhost:8081` (Metro / Expo web) із Fast Refresh.
- **Production**: застосунок піднімає легкий вбудований HTTP-сервер на `127.0.0.1` із випадковим вільним портом і роздає вміст папки `dist/`. Так вирішується проблема абсолютних шляхів `/_expo/...` у статичному бандлі без зовнішніх залежностей. Сервер підтримує SPA-fallback на `index.html`, «чисті» URL (`/settings` → `settings.html`) і захист від directory traversal.
- **Вікно**: стартовий розмір 480×850, мінімум 400×600, меню приховане, `contextIsolation` увімкнено, `nodeIntegration` вимкнено, підключено `preload.js`.
- **Зовнішні посилання** (`http(s)://`) відкриваються в браузері ОС, а не у вікні застосунку.
- Сервер зупиняється при закритті всіх вікон. На macOS застосунок залишається в доці до явного виходу.

---

## 🗂 Структура проєкту

```text
ai-interviewer/
├── electron/
│   ├── main.js                # Головний процес Electron (вікно, вбудований сервер)
│   └── preload.js             # Preload-скрипт
├── src/                       # Алиас "@/" вказує сюди
│   ├── app/                   # Екрани та маршрути (Expo Router)
│   │   ├── _layout.tsx        # Кореневий layout: SafeAreaProvider, Stack, шрифти
│   │   ├── +html.tsx          # HTML-обгортка для web (висота вікна, фон)
│   │   ├── interview.tsx      # Повноекранний екран співбесіди
│   │   └── (tabs)/            # Нижня таб-навігація
│   │       ├── _layout.tsx    # Налаштування табів
│   │       ├── index.tsx      # Головна: вибір теми та рівня
│   │       └── settings.tsx   # Налаштування: API-ключ, вибір моделі
│   ├── components/
│   │   ├── AppModal.tsx       # Модальне вікно
│   │   └── MessageBubble.tsx  # Повідомлення в чаті
│   ├── constants/
│   │   ├── models.ts          # Список доступних ШІ-моделей
│   │   └── topics.ts          # Теми та рівні співбесіди
│   ├── services/
│   │   ├── openrouter.ts      # Запити до OpenRouter, обробка помилок
│   │   ├── prompts.ts         # Системний промпт інтерв'юера
│   │   └── storage.ts         # API-ключ і модель (SecureStore / .env)
│   └── types/
│       └── index.ts           # Спільні TypeScript-типи
├── assets/                    # Іконки, зображення
├── global.css                 # Tailwind / NativeWind
├── .env.local                 # Локальний API-ключ (не комітити!)
├── app.json                   # Конфіг Expo
├── dist/                      # Результат build:web (генерується)
├── dist-electron/             # Готові інсталятори (генерується)
└── package.json
```

---

## 🧩 Кастомізація

**Додати нову тему співбесіди:** додайте об'єкт у `INTERVIEW_TOPICS` (`src/constants/topics.ts`):

```ts
{
  id: "testing",
  title: "Тестування",
  icon: "🧪",
  description: "Jest, React Native Testing Library, моки.",
}
```

**Змінити рівні або кількість запитань:** редагуйте `INTERVIEW_LEVELS` у `src/constants/topics.ts`.

**Додати або прибрати ШІ-модель:** редагуйте `AVAILABLE_MODELS` у `src/constants/models.ts` (ідентифікатори моделей дивіться на [openrouter.ai/models](https://openrouter.ai/models)).

**Змінити поведінку інтерв'юера** (тон, мову, формат звіту): `buildInterviewSystemPrompt` у `src/services/prompts.ts`.

---

## 🛠 Часті проблеми

**Не відображаються іконки в нижній панелі**
Шрифт Ionicons має бути завантажений у кореневому `src/app/_layout.tsx`:

```tsx
const [fontsLoaded] = useFonts({ ...Ionicons.font });
if (!fontsLoaded) return null;
```

**Нижня панель обрізана / виходить за межі вікна**
Переконайтеся, що є `src/app/+html.tsx` із правилом `html, body, #root { height: 100%; overflow: hidden; }`, а у `tabBarStyle` не задана фіксована `height`.

**`electron:dev` зависає на очікуванні порту**
Перевірте, що порт `8081` не зайнятий іншим процесом і що Expo успішно стартував. Спробуйте запустити `npm run web` окремо.

**Білий екран після збірки**
Перевірте, що `npm run build:web` створив папку `dist/` з `index.html`. У production `electron/main.js` роздає саме її.

**Помилка «Невірний API-ключ» (401)**
Перевірте ключ у налаштуваннях. Ключ із SecureStore має пріоритет над `.env.local`, тож старий збережений ключ може перекривати новий із `.env`.

**Помилка 429 на безкоштовній моделі**
Безкоштовні моделі мають ліміти. Зачекайте хвилину або виберіть іншу модель у налаштуваннях.

**Застарілий кеш Metro**

```bash
npx expo start --web -c
```

---

## 📜 Скрипти

| Скрипт | Опис |
| --- | --- |
| `start` | Expo Dev Server |
| `android` / `ios` / `web` | Запуск на відповідній платформі |
| `lint` | Перевірка коду (`expo lint`) |
| `electron:dev` | Розробка в Electron із Fast Refresh |
| `build:web` | Експорт веб-версії в `dist/` |
| `electron:pack` | Збірка без інсталятора (папка) |
| `electron:dist` | Інсталятор під поточну ОС |
| `electron:dist:win` / `:linux` / `:mac` | Інсталятор під конкретну ОС |

---

## 👤 Автор

**Alex**: alexwork24@outlook.com