---
version: 3.6.0
type: minor
status: done
locale: uk
models: ["CSV0Format", "FormatResolver"]
packages: ["@nan0web/csv0", "@nan0web/db", "@nan0web/db-browser", "@nan0web/db-fs"]
---

# 🚀 Реліз v3.6.0 — .csv0: Самоописові Таблиці (Model-as-Schema, Formulas & Edit CSV)

## 🏁 Overview (Огляд)

Цей реліз перетворює `@nan0web/csv0` на повноцінне джерело правди для табличних даних з метаданими у форматі `.csv0` (FrontMatter + Tabular Body).

### Ключові Архітектурні Концепції `.csv0`:
1. **Ізоляція формату `.csv0`**:
   - Файли `.csv0` зберігають FrontMatter (`NaN0`/YAML) та табличне тіло.
   - Звичайний `.csv` залишається простим та сумісним.
   - VS Code / Antigravity підтримують `.csv0` через розширення `Edit CSV` (асоціація файлів + PR патч).
2. **Уніфікація `head` (Model-as-Schema)**:
   - `head:` у FrontMatter є первинним джерелом опису колонок (`head: { id: number, name: string }`).
   - Якщо `head` задано — перший рядок тіла містить заголовки колонок, суворо вирівняні за полями.
   - Якщо вказано `model: UserModel` (або `model: "@pkg/Model"`, `model: "git://..."`) — типи колонок та підказки автоматично беруться зі статичної схеми моделі.
3. **Обчислювані Формули та Підсумки**:
   - **Варіант А (Колонки-формули у рядках)**: `head: { total: { formula: "price * qty" } }`.
   - **Варіант Б (Агрегати / Підсумки таблиці у FrontMatter)**:
     ```yaml
     totals:
       subtotal: "=sum(amount)"
       vat: "=subtotal * vatRate"
       total: "=subtotal + vat"
     ```
4. **Zero-Duplication у монорепо**:
   - `@nan0web/csv0` (v3.6.0) експортує чисті `parseCSV`, `stringifyCSV`, `parseCSV0`, `stringifyCSV0`.
   - `@nan0web/db` (v3.5.0) експортує чисті `parseJSONL`, `stringifyJSONL`.
   - `@nan0web/db-browser` (v3.5.1) та `@nan0web/db-fs` (v3.5.2) використовують спільні утиліти з автоматичним вибором `.csv` лише для 100% однорідних за формою об'єктів.

---

## 🎯 Scope & Статус Задач

### Етап 1: Базовий рефакторинг та ліквідація дублювання [ГОТОВО ✅]
- [x] Підтримка FrontMatter у коментарях (`# ---` для Edit CSV).
- [x] Fallback парсинг звичайного CSV без FrontMatter у `rows`.
- [x] Експорт чистих функцій `parseCSV`, `stringifyCSV`, `parseCSVObjects`, `decodeValue` з `@nan0web/csv0`.
- [x] Суворе вирівнювання значень за заголовками HEAD у `stringifyCSV` (незалежно від порядку ключів у рядках).
- [x] Експорт чистих утиліт `parseJSONL`, `stringifyJSONL` з `@nan0web/db`.
- [x] Рефакторинг `@nan0web/db-browser` та `@nan0web/db-fs` без дублювання коду.
- [x] Перевірка форми масиву в `DBBrowser.determineExtension` (однорідні плоскі об'єкти -> `.csv`, неоднорідні/вкладені -> `.jsonl`).
- [x] Підняття версій пакетів (`@nan0web/csv0`: 3.6.0, `@nan0web/db`: 3.5.0, `@nan0web/db-browser`: 3.5.1, `@nan0web/db-fs`: 3.5.2).

### Етап 2: Повноцінний Контракт `.csv0` (Head, Model & Formulas) [ГОТОВО ✅]
- [x] **Канонізація `head`**:
  - `parseCSV0`: якщо у FrontMatter задано `head` як словник (`head: { id: number }`), сприймати його як опис колонок (alias/superseded для `columns`).
  - Підтримка булевого `head: false` (тіло без рядка заголовків, лише дані).
  - `stringifyCSV0`: запис `head` у FrontMatter за замовчуванням.
- [x] **Підтримка `model` (Model-as-Schema)**:
  - Резолв схеми колонок через `FormatResolver` за ім'ям класу, шляхом чи специфікатором пакета.
  - Автоматична підстановка `head` на основі статичних властивостей моделі (`Model.schema` / `static properties`).
- [x] **Обчислення формул (Formulas & Totals)**:
  - **Варіант А (Рядкові формули)**: обчислення віртуальних колонок `head: { col: { formula: "..." } }`.
  - **Варіант Б (Агрегати таблиці)**: обчислення блоку `totals` (наприклад, `=sum(field)`) та експорт у результат парсингу `result.totals`.
- [x] Контрактні тести у `src/test/releases/3/6/v3.6.0/task.test.js`.

### Етап 3: Інтеграція Edit CSV та PR [ГОТОВО ✅]
- [x] PR-специфікація для розширення `vscode-edit-csv` у `edit-csv-pr.md`.
- [x] Опис розширення конфігурації VS Code / Antigravity для файлів `*.csv0`.

