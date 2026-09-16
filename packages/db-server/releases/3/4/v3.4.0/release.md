---
name: release-db-server-v3.4.0
version: 3.4.0
type: feature
status: active
locale: uk
models:
  - DBServerApp
  - ExplorerModel
knowledge_base:
  - /packages/db-server/README.md
  - /docs/uk/workflows/model-as-app.md
  - /docs/uk/workflows/release.md
---

# 🚀 Release: @nan0web/db-server (v3.4.0)

> **Мета Релізу:** Офіційний MVP реліз HTTP REST-сервера бази даних `@nan0web/db-server` v3.4.0. Включає повноцінний Web File Explorer з живим пошуком файлів, навігацією, метаданими розміру, підтримкою режимів `fetch/get`, повною локалізацією через `ExplorerModel`, автотестованою документацією `README.md.js`, та застосуванням інструменту для інспекції і міграції даних під PayloadCMS.

---

## 👥 1. User Stories & Ролі

### 🔹 Роль: Системний інженер / DevOps (CLI & Automation)

- **Story:** Як інженер, Я хочу запускати `pnpm exec nan0db [dir]` або `nan0db [dir]` або `DBServer.create({ db })`, щоб миттєво підняти REST API та Explorer над будь-яким деревом NaN0 документів (yaml, json, md, csv, csv0, nan0, jsonl) без складної конфігурації.
  - _Критерій успіху:_ Сервер стартує за <100мс, повертає 200 на `/health`, валідний OpenAPI 3.0 на `/api/help`, та коректно обслуговує CRUD запити.

### 🔹 Роль: Аналітик даних / Розробник міграцій (Web & Analysis)

- **Story:** Як розробник міграцій для банківського продукту, Я хочу переглядати контент документів банку через веб-інтерфейс Explorer з фільтрацією за назвою, перемиканням режимів `db.fetch()` / `db.get()`, та перевіряти статус документів для безпомилкового імпорту в PayloadCMS.
  - _Критерій успіху:_ Web Explorer відображає файли, підтримує live-search, відображає розмір файлу та дозволяє редагувати/зберігати YAML/JSON через браузер.

---

## 📋 2. Завдання Релізу та Контракти (Tasks & Contracts)

### Етап 1: REST API & Explorer UI Вдосконалення

#### 🔹 Задача 1.1: REST API Контракти та Ендпоінти

- **User Story:** _Як клієнт API, Я хочу мати стабільний REST інтерфейс для читання, створення, оновлення та видалення документів з підтримкою wildcard-шляхів._
- **Контракт (Test):** [task.spec.js](/packages/db-server/releases/3/4/v3.4.0/task.spec.js)
- **Цільові файли:**
  - `[MODIFY]` [DBServer.js](/packages/db-server/src/DBServer.js)
  - `[MODIFY]` [renderExplorerHTML.js](/packages/db-server/src/renderExplorerHTML.js)
  - `[MODIFY]` [ExplorerModel.js](/packages/db-server/src/ExplorerModel.js)
- **Критерії (DoD):**
  - [x] Контракти проходять (`pnpm run test`)
  - [x] Всі ендпоінти повертають JSON та підтримують UTF-8
- **Статус:** 🟢 Виконано

#### 🔹 Задача 1.2: Explorer UI з живим пошуком та розміром файлів

- **User Story:** _Як користувач Explorer, Я хочу швидко знаходити документи через рядок пошуку та бачити точний розмір обраного файлу._
- **Контракт (Test):** [task.spec.js](/packages/db-server/releases/3/4/v3.4.0/task.spec.js)
- **Цільові файли:**
  - `[MODIFY]` [renderExplorerHTML.js](/packages/db-server/src/renderExplorerHTML.js)
  - `[MODIFY]` [ExplorerModel.js](/packages/db-server/src/ExplorerModel.js)
- **Критерії (DoD):**
  - [x] Поле вводу пошуку фільтрує список файлів на клієнті
  - [x] `stat` повертає розмір файлу та форматується в B/KB/MB
  - [x] i18n ключі зареєстровані у `ExplorerModel`
- **Статус:** 🟢 Виконано

#### 🔹 Задача 1.3: Автотестована документація `src/README.md.js`

- **User Story:** _Як користувач бібліотеки, Я хочу мати перевірену документацію, приклади з якої виконуються під час CI._
- **Контракт (Test):** [README.md.js](/packages/db-server/src/README.md.js)
- **Цільові файли:**
  - `[NEW]` [src/README.md.js](/packages/db-server/src/README.md.js)
  - `[NEW]` [README.md](/packages/db-server/README.md)
- **Критерії (DoD):**
  - [x] `pnpm run test:docs` проходить успішно
  - [x] Згенеровано `README.md` та `.datasets/README.dataset.jsonl`
- **Статус:** 🟢 Виконано

---

## 🧪 3. Критерії Прийомки та Релізний Gate (Definition of Done)

- [x] **Контрактні тести (TDD):** Всі тести у `task.spec.js` зелені (100% Pass).
- [x] **Zero-Procedural Code:** Робота з документацією виключно через `@nan0web/db`.
- [x] **TypeScript Typings:** `tsc` генерує повний комплект `.d.ts` без помилок.
- [x] **Пакетна гігієна:** `knip` перевірка проходить без зауважень.
- [x] **Real Data Verification:** Скрипт `play/test-api.js` підтверджує працездатність на реальних даних банку.
- [x] **RRS Score:** Release Readiness Score ≥ 324 бали.

---

## 📝 4. Журнал Зворотного Зв'язку (Feedback & Decisions)

- **[2026-09-03 11:20]**: Ініціалізовано реліз v3.4.0 для `@nan0web/db-server`.
- **[2026-09-03 11:22]**: Додано локалізований живий пошук у панель файлів Explorer та відображення розміру файлу через `/api/stat/:uri`.
- **[2026-09-03 11:24]**: Створено тестований `README.md.js` з автоматичною екстракцією прикладів та згенеровано `README.md`.
