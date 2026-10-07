# Журнал та Метрики Релізу @nan0web/inspect v3.6.0 / v3.7.0

## Зауваження Архітектора (Append-Only)
- **2026-10-06**: **Розділення OLMUI Intent `render` vs `ask` для Markdown View**:
  - `yield ask('Markdown', { content })` — інтерактивний режим опитування/перегляду з пейджером, status bar та очікуванням клавіш навігації (`[Enter] Select [Tab/S-Tab] Focus`).
  - `yield render('Markdown', { content })` або `yield show(...)` — потоковий неінтерактивний вивід результату/таблиці без блокування терміналу, без status bar та без підказок клавіш управління.
- **2026-10-06**: **Ієрархія та Схема Конфігурації Інспектора**:
  - Конфіг має бути строгою моделлю `InspectConfig extends Model` з повним JSDoc & typedef (без магічних безтипних об'єктів).
  - Підтримка каскадного пошуку: `~/.nan0web/inspect/config.nan0` $\rightarrow$ `<repo_root>/inspect.config.{nan0,yaml,js}` $\rightarrow$ `<project_dir>/inspect.config.{nan0,yaml,js}`.
  - Можливість тонкого налаштування правил (наприклад, селективне відключення `export_default`, правила для snapshots).
- **2026-10-06**: **План Запуску Industrial Bank та Оптимізації Інспекторів (3 Сесії)**:
  - **Головний План Запуску Проєкту**:
    1. Налаштувати конвеєр розробки AI Agents через `nan0web/inspect`.
    2. Ручний контроль та завершення сідінгу (BankSeedModel, 100% зв'язки продуктів і медіа).
    3. Автоматична збірка на сервері (`pnpm build`).
    4. Розгортання згідно DEPLOY.md: `git pull && pnpm install && pnpm build && pnpm start`.
    5. Налаштування фронтенду, перевірка сторінок і синхронізації CMS з git & @nan0web/db.
    6. Запуск версії у production.
    7. Документація для менеджерів та програмістів + Додаткова угода про Дизайн-Партнерство.
  - **Сесія 1 (Зараз)**: Виправлення ядра `@nan0web/ui-cli` та `@nan0web/ui`:
    - `Markdown.js`: передавати `print: true` або прямий `renderMarkdown` для неінтерактивного `render` / `show` (усунення блокування TTY Pager).
    - `JsIntentAuditor.js`: додати `.next`, `.next-playwright`, `dist`, `coverage` в `IGNORE_DIRS`.
  - **Сесія 2 (Завершено)**: Конфігурація та адаптація для монорепозиторію банку:
    - Підтримка виключень для Payload CMS / адмінських компонентів (`OlmuiThemingAuditor` `isIgnored` / `IGNORE_PATTERNS`).
    - Підтримка м'якого пропуску знімків у `SnapshotAuditor` (`optional: true` / `allowEmpty: true`).
    - Статичні `alias = 'intents'` для аудиторів (`JsIntentAuditor`, `PyIntentAuditor`).
    - Успішна валідація контракту §5 у `packages/inspect/releases/3/6/v3.6.0/task.spec.js` (12/12 pass).
    - Перевірено збірки типів `@nan0web/ui` та `@nan0web/inspect`, OLMUI Theming Auditor та Intent Auditor проходять чисто (0% hardcode / 0 leaks).
  - **Сесія 3 (Новий чат)**: Чиста верифікація та запуск конвеєра:
    - Зелений прогін `pnpm inspect cms`, `pnpm inspect:seed`.
    - Перевірка серверної збірки та деплойного ланцюжка.
