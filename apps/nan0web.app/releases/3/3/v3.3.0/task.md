# 🌐 Архітектура та План: nan0web.app Runner, SSR/SSG Адаптери, Хостинг та Багатомовність

## 📌 1. Порівняльна Таблиця: Як працює SSR / SSG у різних типах додатків

У парадигмі **OLMUI (One Logic — Many UI)** модель та дані не знають про спосіб відображення. Залежно від цільового оточення використовуються відповідні адаптери:

| Тип Додатку / Адаптер | Спосіб SSR / Рендерингу | SSG / Білд Експорт | Як підключається до `nan0web.app` | Збереження стану та даних |
| :--- | :--- | :--- | :--- | :--- |
| **Lit / Web Components** (`@nan0web/ui-lit`) | **Streaming HTML + Declarative Shadow DOM (DSD)** або Importmap Shell з гідратацією у браузері | `server.exportStatic(outDir)` генерує статичні HTML-файли без потреби у Node.js на клієнті | `nan0web.nan0` конфіг визначає `ui: ["lit"]`. Сервер віддає importmap + модулі компонентів | Local DBFS (файли `.nan0`/`.yaml`) або REST API |
| **React / Next.js** (`@nan0web/ui-react` / `@nan0web/ui-next`) | **Поліморфний SSR**: виклик `renderToString(<App model={model} />)` на сервері або делегування Next.js SSR / Vite SSR | Статичний експорт через Next static export або Vite SSG (`npm run build:data && vite build`) | Через адаптер `@nan0web/ui-react/ssr` або як підмонтований саб-апп (micro-frontend / iframe sandbox) | PostgreSQL (для Payload CMS) або DBFS файли |
| **Pure HTML / Markdown Docs** | Чистий потоковий SSR: Markdown перетворюється в безпечні OLMUI блоки (`@nan0web/markdown`) | Прямий запис `index.html` та вкладених сторінок | За замовчуванням (Core). Працює без жодного JS-фреймворка | Локальні `.md` / `.yaml` файли |
| **CLI Terminal** (`@nan0web/ui-cli`) | ANSI/VT100 генератор (`renderForm`, `pageViewer`, `TerminalRenderer`) | Не застосовується (Live TTY) | `bin/nan0web` викликає `ShellModel` та `runGenerator` | In-Memory / File System |

---

## 🏛 2. Поліморфна Архітектура Шаблонів (`TemplateEngine`)

Замість жорсткого хардкоду HTML у `apps/nan0web.app/src/server/index.js`, створюється поліморфний прошарок шаблонів:

```
apps/nan0web.app/src/server/templates/
├── BaseTemplate.js          # Базовий контракт шаблонізатора (DocType, Head, ImportMap, Scripts, Body)
├── LitAppTemplate.js        # Шаблон для Lit / Web Components (Importmap esm.sh + local, WS sync)
├── ReactAppTemplate.js      # Шаблон для React додатків (Root div container, React SSR string injection)
├── DocsTemplate.js          # Шаблон документації (Sidebar, Breadcrumbs, Markdown CSS, Anchor links)
└── index.js                 # TemplateFactory: підбирає шаблон згідно з config.template або layout
```

Кожен шаблон — це **поліморфна стратегія**:
```js
export class BaseTemplate {
  renderHead({ title, meta, links, styles }) { /* ... */ }
  renderBody({ content, scripts, bridge }) { /* ... */ }
  render(state, blocks) { /* збирає докупи */ }
}
```

---

## 📚 3. Документація `nan0web.app`: Стандарти Багатомовності та Шляхів

1. **Багатомовність (i18n):**
   - Файли документації зберігаються у двох (або більше) мовах:
     - `docs/uk/` — Українська версія.
     - `docs/en/` — Англійська версія.
   - **Індексний файл:** За замовчуванням пріоритет:
     1. `index.md` (або `index.nan0`)
     2. `README.md`
   - Автоматичний редирект або вибір кореня згідно з локаллю запиту (`Accept-Language` або префікс `/uk/`, `/en/`).
2. **Абсолютні інтернет-посилання (Live Web References):**
   - Усі посилання в markdown документації перевіряються та нормалізуються:
     - Внутрішні посилання виду `[Документація](/docs/uk/...)` резолвляться роутером.
     - Зовнішні абсолютні посилання виду `https://nan0web.org/...` або `https://github.com/...` рендеряться з `target="_blank"` та атрибутами безпеки (`rel="noopener noreferrer"`).

---

## 🤖 4. `llms.txt` та `AGENTS.md` для Додатку

Для того, щоб мовні моделі (LLM) мали миттєвий доступ до всього API додатку:
1. **`/llms.txt` (Index Pointer):**
   - Легковажний покажчик на всі ключові модулі, ендпоінти та посилання на документацію.
2. **`/llms-full.txt` (Full Inlined Context):**
   - Зліпок ключової документації та описів API (до 400 KB).
3. **`/.agents/AGENTS.md` / `AGENTS.md`:**
   - Правила взаємодії, описи CLI команд, формати моделей.
4. **Службовий API роут `/api/help` та `/api/search`:**
   - Видає машиночитану OpenAPI / JSON схему всіх доступних функцій та пошуку по сайту для AI Tools.

---

## 🗄 5. Хостинг `nan0web.app`: Файлова система vs PostgreSQL (Payload CMS)

`nan0web.app` підтримує два режими хостингу даних через поліморфні адаптери бази даних:

1. **Режим 1: Local File System (DBFS / Flat Files):**
   - Документи зберігаються як `.nan0`, `.md`, `.yaml`, `.json`.
   - Синхронізація з комп'ютером користувача (через git або прямий доступ).
   - Мінімальний VPS або навіть статичний хостинг.
2. **Режим 2: Remote / Managed Hosting (PostgreSQL + Payload CMS):**
   - Для масштабних новинних порталів (як EA Ukraine).
   - Адаптер `@nan0web/db-server` або `@payloadcms/db-postgres`.
   - Надання REST/GraphQL API для динамічного оновлення контенту, авторизації та збереження ревізій.
3. **Поліморфний Диспетчер сховища:**
   - Моделі звертаються виключно через `db.fetch(uri)` або `db.set(uri, data)`. Драйвер (FS чи PostgreSQL) інжектується через DSN:
     - `file://data/` або `data/` -> `DBwithFSDriver`
     - `postgres://...` -> `PostgresDriver` / Payload CMS adapter
     - `https://api.site.com/` -> `BrowserDB`

---

## 📋 6. Покроковий План Впровадження

### Крок 1: Data-Driven рендеринг сторінок через `$content` та `@nan0web/ui`
- Винести генерацію HTML-шелу з `apps/nan0web.app/src/server/index.js` у легковажний модуль рендерера сторінки.
- Реалізувати рендеринг сторінки через послідовність компонентів масиву `$content: any[]` (`Header`, `Sidebar`, `Content`, `Footer`).
- Забезпечити автоматичне резолвлення `$ref` посилань у властивостях компонентів зі стану або сховища.
- Повністю очистити `apps/nan0web.app/src/server/index.js` від інлайнового `#renderHTML`.

### Крок 2: Документація `nan0web.app` (UK / EN, `index.md`/`README.md`, Посилання)
- Оформити документацію в `apps/nan0web.app/docs/` двома мовами з детальним API, інструкціями по запуску та зовнішніми веб-посиланнями.
- Додати генерацію або статичні файли `llms.txt` та `.agents/AGENTS.md` з картою API.

### Крок 3: Інтеграція новинних додатків (EA Ukraine / IP News)
- Підключити рендеринг новинного каталогу з підтримкою адаптерів (Lit для фронтенду, DBFS/PostgreSQL для сховища).

### Крок 4: Тестування та верифікація у 3-х інтерфейсах
- 📟 CLI (консоль).
- 🌐 Web (браузер / Lit / React).
- 💬 Chat / LLM API (пошук та інтерактивні відповіді по API сайту).

## 📌 5. Інтеграція LLiMo протоколу та Chat UI (пріоритет 3)
- Додати `ChatAdapter.js` у `src/ui/chat/` використовуючи `@nan0web/ui-chat`.
- Використовувати `LLiMo` markdown‑protocol для парсингу запитів та генерації контенту у чаті.
- Інтерфейс має працювати як `runGenerator` → `renderJSON()` → `ChatAdapter.render()`.
- Додати snapshot‑тести (`olmui-scenario-test`) для чат‑комунікації.

## 📌 6. Інтеграція Voice UI (пріоритет 4)
- Створити `VoiceAdapter.js` у `src/ui/voice/` з використанням `@nan0web/ui-voice` (STT/TTS).
- Підключити `renderJSON()` → `VoiceAdapter.renderSpeech()`.
- Реалізувати Barge‑in та буферизацію 20‑словних фрагментів.
- Тести: емуляція голосових сценаріїв через Playwright.

## 📌 7. i18n Правила (NaN0Web i18n)
- Усі тексти у шаблонах та адаптерах повинні братись через `t(Model.UI.key)`.
- Додати `data/i18n/` з файлами `.nan0`/`.yaml` для перекладів.
- Інтегрувати `@nan0web/i18n` у `TemplateEngine` та UI‑адаптери.
- Автоматична генерація `llms.txt` з ключами i18n.

## 📌 8. Універсальні патерни з Industrial Bank (generic)
- **Intent Registry**: Оголосити `intentRegistry.json` у `data/registry/` для всіх додатків.
- **Data Verse**: Використовувати `data/**/*.{nan0,md,yaml}` як єдине джерело правди.
- **Copy‑on‑Build**: При `nan0web build docs` копіювати контент у `dist/` зі збереженням `_origin.json`.
- **Pipeline 2**: Підключити ці патерни у `app-pipeline-04-adapter` та `app-pipeline-05-ui-cli`.

## ✅ Перевірка та реліз
- Запуск `npm run test:all` (всі інтерфейси).
- Побудова `nan0web build docs` → перевірка SSR via `nan0web serve docs`.
- Деплой в staging, тестування Chat та Voice через локальні симулятори.
