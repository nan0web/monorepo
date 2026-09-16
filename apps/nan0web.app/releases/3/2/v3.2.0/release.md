---
name: release-v3.2.0
version: 3.2.0
type: feature
status: active
locale: uk
models:
  - NaN0WebConfig
  - ShellModel
  - AppRunner
  - SSRServer
knowledge_base:
  - /docs/uk/workflows/model-as-app.md
  - /docs/uk/workflows/release.md
  - /docs/uk/workflows/llimo.md
---

# 🚀 Release: Sovereign OLMUI Engine MVP (@nan0web/nan0web.app v3.2.0)

> **Мета Релізу:** Валідація та стабілізація запуску `nan0web.app` MVP як суверенного data-driven ранера на основі оновленого ядра `@nan0web/db` (v3.4.0), наскрізна верифікація OLMUI конвеєрів (CLI, SSR, PagesRouter, i18n auto-detection) та готовність до автономного запуску.

---

## 👥 1. User Stories & Ролі

### 🔹 Роль: Веб-майстер / Розробник екосистеми (SSOT & Web Runner)
- **Story:** Як веб-майстер, я хочу запускати `nan0web.app` з DSN та конфігом, щоб суверенно піднімати SSR/SSG сторінки з каталогу markdown-файлів та локалізованих словників.
  - *Критерій успіху:* `AppRunner` та `SSRServer` успішно віддають HTML, обробляють роутинг з breadcrumbs та підхоплюють i18n словники з файлової структури.

### 🔹 Роль: Оператор CLI / Користувач терміналу (OLMUI Interactive)
- **Story:** Як оператор CLI, я хочу викликати команди `run`, `build`, `help` або інтерактивний OLMUI інтерфейс, щоб керувати застосунком без написання імперативних скриптів.
  - *Критерій успіху:* `ShellModel` коректно транслює позиційні та іменовані прапорці у виклики генератора `runGenerator`.

---

## 📋 2. Завдання Релізу та Контракти (Tasks & Contracts)

### Етап 1: Інтеграція оновленого ядра `@nan0web/db` (v3.4.0)

#### 🔹 Задача 1.1: Сумісність з кешованим та гідратованим DB
- **User Story:** *Як розробник застосунку, я хочу, щоб `nan0web.app` використовував оновлений `@nan0web/db` через workspace, гарантуючи швидке завантаження файлів конфігурацій та сторінок.*
- **Контракт (Test):** [task.spec.js](file:///Users/i/src/nan.web/apps/nan0web.app/releases/3/2/v3.2.0/task.spec.js)
- **Цільові файли (Target Files):**
  - `[MODIFY]` [package.json](file:///Users/i/src/nan.web/apps/nan0web.app/package.json)
  - `[NEW]` [task.spec.js](file:///Users/i/src/nan.web/apps/nan0web.app/releases/3/2/v3.2.0/task.spec.js)
- **Критерії (DoD):**
  - [x] Всі існуючі 83 юніт-тести та 22 сценарні тести проходять (100% Pass).
  - [x] Контрактний тест перевіряє `AppRunner` з інжектованим `@nan0web/db`.

### Етап 2: Верифікація CLI та OLMUI Runner

#### 🔹 Задача 2.1: Контрактна перевірка ShellModel та CLI Dispatcher
- **User Story:** *Як користувач, я хочу викликати CLI з прапорцем `--help` або без аргументів і отримувати стабільну роботу моделі.*
- **Контракт (Test):** [task.spec.js](file:///Users/i/src/nan.web/apps/nan0web.app/releases/3/2/v3.2.0/task.spec.js)
- **Критерії (DoD):**
  - [x] CLI валідує опції та зв'язується з `ShellModel`.
  - [x] Запуск конвеєра `test:all` залишається 100% зеленим.

---

## 🧪 3. Критерії Прийомки та Релізний Gate (Definition of Done)
- [x] **Контрактні тести (TDD):** Всі `*.spec.js` та регресії зелені (100% Pass).
- [x] **Data-First:** Відсутність прямого несанкціонованого `fs` у доменних моделях, використання `@nan0web/db`.
- [x] **Zero-Trust Git Diff:** Немає випадкових або процедурних файлів.
- [x] **Стабільність збірки:** `tsc` компілює типи без помилок.
