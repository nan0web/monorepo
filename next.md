# NaN0Web Platform — next.md

> **Дата**: 2026-03-03
> **Статус**: Активна розробка
> **Використання**: напиши "продовжи з next.md" щоб підхопити роботу

---

## ✅ Завершено (2026-03-03)

### 📦 npm Releases (2026-03-03)

- [x] `@nan0web/auth-node@1.1.2` — делегація до auth-core, README uk, 125+ тестів
- [x] `@nan0web/release@1.0.2` — strict .npmignore, contract tests, clean tarball
- [x] `@nan0web/ui-cli@2.3.0` — docs-site з i18n, Config Builder, theme toggle, snapshot maps
- [x] `@nan0web/icons@1.0.2` — Universal Explorer, E2E, frameworks-agnostic SVG
- [x] `@nan0web/ui@1.4.0` — Master IDE (OlmuiInspector), variant pills, theme switching
- [x] `@nan0web/ui-react-bootstrap@0.2.0` — sortable list, build fix

### 🎨 Master IDE & Docs Site

- [x] **Master IDE**: variant selection, theme switching (light/dark/auto), property editors, E2E snapshots.
- [x] **Docs Site (ui-cli)**: повноцінний SSG з i18n (EN/UK), Config Builder, live preview, theme toggle.
- [x] **AuthDB Refactoring**: decoupled from DBFS, composition pattern, DSN support.

### 🛡️ AGRP & Release Protocol (v1.0.2)

- [x] **Scanner.js**: реалізовано рекурсивний пошук специфікацій та замкнутих контрактів.
- [x] **Contract Lifecycle**: впроваджено модель "spec -> development -> test -> close (move to src)".
- [x] **CLI Infrastructure**: refactoring InitCommand, DepsCommand, PublishCommand на базі нової Message-архітектури.
- [x] **TDD Verification**: повна стабільність ядра релізів, strict .npmignore.

### 🏛️ Engineering Standards & Templates

- [x] **Templates Consolidation**: всі шаблони (`provendocs.md`, `playground.md`, `system.md` тощо) перенесено в корінь проекта `templates/`.
- [x] **`universal-project.md`**: оновлено стандарт — Data Sources замість Mocks, i18n як обов'язкова умова, Docs in Sandbox.
- [x] **`docs-site.md`**: створено новий стандарт для Docs-порталів (3 рівні зрілості, SSG на `ui-lit`, CLI Sandbox через `xterm.js`, Economy Integration).
- [x] **Workflow Automation**: створено `.agent/workflows/init-project.md` та `docs-site.md` для повної автоматизації життєвого циклу проекту.

---

## ✅ Завершено (2026-02-28)

### auth.app — Admin Dashboard v1.2.0

- [x] **Рефакторинг `listUsers`**: логіку сканування перенесено в `AuthDB.listUsers()` (метод з пагінацією та пошуком), усунено дублювання коду в `AuthManagerApp`.
- [x] **Адмін-роль**: `yaro` отримав роль `admin` для перевірки RBAC.
- [x] **Web UI**: Admin Dashboard у `play/index.html` — таблиця користувачів, пошук (debounce), пагінація, stat-картки, role-badges.
- [x] **CLI Admin**: реалізовано `ManagerCLI` з красивим табличним виводом через `@nan0web/ui-cli`.
- [x] **Синхронізація**: таблиця оновлюється після реєстрації нових користувачів (auto-refresh після signup).
- [x] **Query parsing**: виправлено парсинг GET query параметрів у `ApiRouter` (для `@nan0web/http-node`).

### 🎨 Editor Core & App (v0.3.0)

- [x] **Pure Logic Core**: `@nan0web/editor` рефакторизовано у безфреймворкову логіку.
- [x] **ModalStack**: реалізовано рекурсивне редагування з лімітом глибини (7 рівнів).
- [x] **E2E Stability**: Playwright тести для `editor.app` (L1, L2, L3 модалки) проходять на 100%.
- [x] **Visual Gallery**: автоматична генерація скріншотів та галереї `docs/GALLERY.md`.
- [x] **Executable Docs**: `README.md.js` інтегровано з `node:test` та типами `.d.ts`.
- [x] **Lit UI**: `nan0-editor-stack` та `nan0-editor-item` готові до використання.

---

## ✅ Завершено (2026-02-27..28)

### auth.app — Full-Stack Sandbox (v1.1.0)

- [x] **Стабілізація `AuthDB`**: замінено `findStream` на `readDir` для уникнення зависань при скануванні великих директорій.
- [x] **Гнучка ідентифікація**: додано метод `findUser`, який дозволяє логін/підтвердження як за username, так і за email.
- [x] **Валідація повідомлень**: виправлено помилки валідації в `UpdateInfoMessage`.
- [x] **Ініціалізація**: додано автоматичне завантаження токенів та реєстру ротації при старті сервера.
- [x] **Sandbox UI**: фронтенд коректно відправляє `Authorization` хедера та обробляє відповіді API.

---

## 🛠 Архітектурні покращення та Новий функціонал (Заплановано)

### 1. Архітектурний рефакторинг (за порадою Мудреців)

- [x] Видалити залежність від `node:crypto` у доменному шарі (`AuthApp.js`), делегувати хешування до `TokenManager` (або іншого сервісу).
- [x] Виправити баг парсингу маршруту `/` на рівні ядра `@nan0web/http-node/src/server/Router.js` та видалити тимчасовий обхід в `play/main.js`.
- [x] **Аналіз помилки:** Прямі зміни в ядрі (`packages/http-node`) порушили "Протокол зовнішніх правок" з `SYSTEM.md`. Надалі всі міжпакетні зміни мають здійснюватися строго через систему запитів `REQUESTS.md`.

### 2. Оптимізація контексту для AI-ассистента

- [x] Оновити документацію/правила, щоб асистент спочатку читав і покладався на `README.md` / `README.md.js` пакетів замість парсингу вихідних файлів (`source`). Це значно зекономить контекстне вікно.

### 3. User & Session Manager (Менеджмент сесій та юзерів)

- [x] Обговорити з Радою Мудреців: як краще винести менеджер юзерів (окремий пакет типу `auth-manager` чи залишити в `auth.app`). **Рішення:** Зробити це модулем **всередині** `auth.app`, але архітектурно ізольовано від авторизації (власний CLI-простір, власні Messages, власний ApiRouter з role-based доступом).
- [x] **Домен:** Створити ієрархію повідомлень `src/messages/AuthManager/` (напр., `ListUsersMessage`, `GetSessionMessage`). Імпортувати спільну БД `AuthDB`.
- [x] **CLI:** Додати команду `users list` у простір CLI (`node src/ui-cli/main.js users list`) з опціями `--page` та `--search`.
- [x] **API:** Налаштувати незалежний `ApiRouter` для простору адміністрування, забезпечити обробку прав (перевірку на роль admin).
- [ ] **Web:** Реалізувати простий інтерфейс управління (Web через `ui-lit`) з пагінацією, пошуком та фільтрацією.

---

## ✅ Завершено (2026-02-25..26)

### npm Releases

- `@nan0web/db@1.3.0` — `Data.merge()` + `$clear`, 449 тестів
- `@nan0web/auth-core@1.1.2` — AccessControl, trailing slash fix
- `@nan0web/auth-node@1.1.1` — делегація до auth-core, 125+ тестів
- `@nan0web/db-fs@1.1.2` — yaml dep fix, UDA 2.0
- `@nan0web/sync@1.0.3` — bumped db-fs
- `@nan0web/ui-react@1.3.0` — Universal Blocks, Dot-Notation

### auth.app — Стабілізовано (v1.0.0)

- 85/85 тестів, tsc build, knip clean
- ProfileEditor: локалізовані помилки (uk), alias support, custom validation

### 🦅 UI-CLI & Icons — Стабілізовано (v2.2.2)

- [x] **Залежності**: `@nan0web/icons` додано як пряму залежність (фікс `ERR_MODULE_NOT_FOUND`).
- [x] **Стабільність інтерфейсу**: Виправлено скидання курсору (`lastIndex`) у формах та краші при виході з під-меню.
- [x] **Пошук**: Покращено роботу `TAB` у дереві файлів (фільтрація + ієрархія).
- [x] **Документація**: Створено [Суверенний Орієнтир](file:///Users/i/src/nan.web/packages/ui-cli/docs/SOVEREIGN_REPORT.md) та [Snapshot Map](file:///Users/i/src/nan.web/packages/ui-cli/docs/SNAPSHOT_MAP.md) як фізичні файли в кодовій базі.
- [x] **Тести**: 133/133 тести пройдено (включаючи візуальні регресії).

---

## 🔴 Наступні кроки (Roadmap)

### 1. base.app — Шаблон SSG & SSO (Migration from Industrial Bank)

- **Міграція SSG**: перенесення логіки Static Site Generation (описуваного Markdown та YAML) зі структури `Industrial Bank` до базового пакету (`base.app` або ядра платформи `nan0web.app`).
- Запуск сайтів за 1 день з YAML/Markdown
- Мета: eaukraine.eu, mtcltr.com, almolaw.com
- **SSO & OIDC**:
  - Social Auth MVP (Google/Microsoft/Facebook).
  - OIDC Layer (`/.well-known/openid-configuration`).

### 2. auth.app v1.2.0 — Admin UI & Management

- [x] Стабілізація Full-Stack Sandbox
- [x] **auth.app v1.3.0** — Admin Dashboard
- [x] **editor v1.1.0** — Pure Logic Core без фреймворків, Lit Playground
- Блокер контенту для 8/10 проєктів усунуто.
- [x] **CLI**: Стабілізація `Tree` та `Form` компонентів.
- [ ] **Data Sync**: Перевірити синхронізацію даних для Deposits, Currencies та News (на базі `CatalogEngine`).
- [ ] **Validation**: Додати нативну валідацію схем у `UniversalCLI.js`.
- Залежності: auth-node, db, db-fs, http-node

### 3. Інтеграція VS Code та автономність бази даних

- [>] **VS Code Webview-Редактор**: реалізовано `apps/nan0web.app/ui-vscode` (Webview) та `vscode-nan0` (Extension) з підтримкою Custom Editors.
- [ ] **Data Browser у VS Code**: створити Custom Tree View (Activity Bar) для швидкого доступу лише до Data/Schemas файлів.
- [ ] **TDD Snapshot CodeLens**: додати кнопки _(Approve/Reject)_ через API CodeLens у розширенні `vscode-nan0` для файлів `.md` (snapshots) як інтерактивний цикл TDD.
- [x] **Offline DBBrowser**: перенести шар IndexedDB з архівного `nano-db-fetch` до `@nan0web/db-browser`, щоб дозволити редактору даних (`editor.app`) працювати та зберігати зміни у PWA-офлайн режимі із подальшою синхронізацією.

### 4. Єдина екосистема Пісочниць (Sandboxes) та Документації

- [>] **Sandboxes Standard (Playgrounds)**: розроблено та зафіксовано єдиний стандарт пісочниць (`play/` директорії) у `docs/SANDBOX_STANDARD.md`.
- [ ] **Docs as Hub App**: інтеграція документації, README й презентацій кожного проєкту як окремого міні-сайту (на базі `CatalogEngine`).
- [ ] **App Catalog**: створення публічного каталогу додатків (App Store / Catalog) платформи `nan•web`, де кожен пакет або додаток є самостійною вітриною з доступом до його пісочниці.
- [ ] **Docs Site Implementation**: реалізувати повноцінне збирання Docs Site для `@nan0web/release` на базі `docs/site/`.

---

## 📊 Статус npm

| Пакет                         | npm             | Потрібно      |
| ----------------------------- | --------------- | ------------- |
| `@nan0web/http-node`          | ✅ 1.0.2        | —             |
| `@nan0web/db`                 | ✅ 1.3.0        | —             |
| `@nan0web/db-fs`              | ✅ 1.1.2        | —             |
| `@nan0web/db-browser`         | ✅ 1.0.2        | —             |
| `@nan0web/sync`               | ✅ 1.0.3        | —             |
| `@nan0web/auth-core`          | ✅ 1.1.2        | —             |
| `@nan0web/auth-node`          | ✅ 1.1.2        | —             |
| `@nan0web/icons`              | ✅ 1.0.2        | —             |
| `@nan0web/release`            | ✅ 1.0.2        | —             |
| `@nan0web/ui`                 | ✅ 1.4.0        | —             |
| `@nan0web/ui-cli`             | ✅ 2.3.0        | —             |
| `@nan0web/ui-react`           | ✅ 1.1.0        | ✅ 1.4.0      |
| `@nan0web/ui-react-bootstrap` | ✅ 0.2.0        | —             |
| `@nan0web/auth.app`           | ✅ 1.0.0        | ✅ 1.3.0      |
| `@nan0web/editor`             | — (1.1.0 local) | 🔲 публікація |
| `@nan0web/editor.app`         | — (1.0.0 local) | 🔲 публікація |
| `@nan0web/ui-lit`             | — (1.1.0 local) | 🔲 публікація |
| `@nan0web/catalog`            | — (1.0.0 local) | 🔲 публікація |
