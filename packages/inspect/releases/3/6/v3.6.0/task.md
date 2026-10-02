---
version: 3.6.0
type: feature
status: active
locale: uk
models:
  - packages/inspect/types/domain/modules/ModuleRegistry.d.ts
  - packages/inspect/types/domain/modules/ModuleItem.d.ts
---

# 🚀 Mission: Module Registry, Canonical UI Tags & Fluent Batch Updates (v3.6.0)

## 🏁 Overview (Огляд)

Впровадження живого реєстру модулів монорепозиторію (`ModuleRegistry`) на базі архітектури `ModelAsApp` / `Model` та інжектованого `@nan0web/db`.

1. **Канонічне визначення UI-стеку (`m.ui`)**:
   - Єдине джерело правди (Single Source of Truth) — `package.json#exports`:
     - Підшлях `./ui/react` (або `./react`) $\rightarrow$ тег `'ui-react'`.
     - Підшлях `./ui/lit` (або `./lit`) $\rightarrow$ тег `'ui-lit'`.
     - Підшлях `./ui/cli` (або `./cli`) $\rightarrow$ тег `'ui-cli'`.
     - Підшлях `./ui/web` (або `./web`, `./dom`) $\rightarrow$ тег `'ui-web'`.
   - Прямий збіг імені пакету (`@nan0web/ui-react`, `@nan0web/ui-cli` тощо).
   - Еквівалент для інспекторів: `WARN`, якщо є dependency без відповідного `exports['./ui/*']`.

2. **Три ізольовані зони індексування**:
   - `packages/` $\rightarrow$ `packages/index.md`, `packages/modules.csv` (або `.jsonl`).
   - `apps/` $\rightarrow$ `apps/index.md`, `apps/modules.csv`.
   - `apps/3rdparty/` $\rightarrow$ `apps/3rdparty/index.md`, `apps/3rdparty/modules.csv` (автономна зона).

3. **Компактні структуровані індекси (csv0 format & Typed Columns)**:
   - `modules.csv` / `modules.csv0` — компактний табличний зліпок (`name,dir,version,ui,profile,private`) з FrontMatter формату `@nan0web/csv0`:
     ```csv0
     ---
     columns:
       private: boolean
       version: @nan0web/version
     ---
     name,dir,version,ui,profile,private
     @nan0web/csv0,packages/csv0,3.4.0,,,0
     ```
   - Булеві значення серіалізуються як `1` (true) та `0` (false) для компактності.
   - `index.md` — структурований Markdown з чіткою розміткою таблиць модулів.

4. **Архітектурний стандарт моделі форматів (`FormatModel` & i18n)**:
   - Адаптери форматів колонок проєктуються як повноцінні моделі `Model` із простором імен `package.json#exports['./format/csv0']`:
     ```javascript
     class Format extends Model {
       stringify(value) { return String(value ?? '') }
       parse(text) { return text }
       validate(value) {
         const { t } = this._
         return true
       }
     }
     class CSV0Format extends Format {
       static UI = {} // i18n ключі для перекладу валідаційних помилок через @nan0web/i18n
     }
     ```
   - Динамічний резолвінг форматів:
     ```javascript
     if (BuiltinFormats[type] !== undefined) {
       return BuiltinFormats[type]
     }
     ```
   - Усі помилки завантаження чи невідповідності формату використовують `ModelError` та `this._.t` згідно з канонічним `@nan0web/i18n`.

5. **Fluent API для масових маніпуляцій**:
   - `filter(predicate)` — вибірка модулів за умовами (повертає новий `ModuleRegistry`).
   - `updatePackage(key, updaterOrValue)` — глибоке оновлення/злиття об'єктів (`scripts`, `dependencies` тощо).
   - `replaceValue(jsonPath, valueOrUpdater)` — точкова заміна за шляхом (dot-notation, наприклад `engines.node`).
   - `setPackage(patchObject)` — встановлення властивостей верхнього рівня.
   - `deleteKey(jsonPath)` — безпечне видалення ключів.
   - `save()` — детерміноване збереження через інжектовану базу `@nan0web/db` (без прямого `fs`).

---

## 👥 User Stories (Сценарії)

> **Як Архітектор платформи**, я хочу визначати UI-стек модулів суворо через `package.json#exports` (`./ui/*`), щоб уникнути суб'єктивних евристик та гарантувати стабільність OLMUI.  
> **Як Інженер автоматизації**, я хочу мати Fluent API ланцюжка `registry.filter(m => m.ui.includes('ui-web')).updatePackage('scripts', ...).save()`, щоб безпечно оновлювати скрипти та конфіги у десятках пакетів одночасно.  
> **Як ШІ-агент (АрхіТехноМаг)**, я хочу зчитувати легковажні `modules.csv` (csv0) та `index.md` у кожній зоні (`packages`, `apps`, `apps/3rdparty`), щоб орієнтуватися у структурі монорепи без сканування сотень файлів.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Першочергові контракти:
- `packages/inspect/src/domain/modules/ModuleItem.js` (модель окремого модуля / package.json).
- `packages/inspect/src/domain/modules/ModuleRegistry.js` (колекція, сканер, фільтр, fluent-маніпулятор).

### Цільові файли (Scope Boundary):
1. **Реліз та контракти:**
   - `packages/inspect/releases/3/6/v3.6.0/task.md` — паспорт релізу.
   - `packages/inspect/releases/3/6/v3.6.0/task.spec.js` — контрактні TDD тести.
2. **Доменна логіка:**
   - `packages/inspect/src/domain/modules/ModuleItem.js` — обгортка модуля з канонічним парсингом `m.ui`.
   - `packages/inspect/src/domain/modules/ModuleRegistry.js` — Fluent API та генерація індексів.
3. **Експорти:**
   - `packages/inspect/src/index.js` — експорт `ModuleRegistry`, `ModuleItem`.
   - `packages/inspect/package.json` — експорти `./domain/modules/ModuleRegistry`, версія `3.6.0`.

---

## 🎯 Scope (Задачі релізу)

- [x] **Крок 1: Контрактне тестування (TDD Red):**
  - Створити `releases/3/6/v3.6.0/task.spec.js` з повним покриттям канонічного розпізнавання `m.ui`, методів `filter`, `updatePackage`, `replaceValue`, `setPackage`, `deleteKey`, генерації `modules.csv` (формат `csv0` з `columns:` та `0/1`) та `index.md`.
- [x] **Крок 2: Реалізація `ModuleItem`:**
  - Парсинг `package.json` та `tsconfig.json`.
  - Канонічне визначення `ui` (`exports['./ui/react']`, `./ui/lit`, `./ui/cli`, `./ui/web`).
  - Методи мутації пам'яті (`setPackage`, `updatePackage`, `deleteKey`, `replaceValue`).
- [x] **Крок 3: Реалізація `ModuleRegistry`:**
  - Сканування вказаних зон (`packages`, `apps`, `apps/3rdparty`) через `@nan0web/db`.
  - Fluent методи: `filter`, `updatePackage`, `replaceValue`, `setPackage`, `deleteKey`.
  - Методи виводу: `toCsv()`, `toCsv0()`, `toMarkdown()`, `writeIndexes()`, `save()`.
- [x] **Крок 4: Інтеграція та експорти:**
  - Експорт `ModuleRegistry`, `ModuleItem` у `packages/inspect/src/index.js` та `package.json`.
- [x] **Крок 5: Валідація та перехід у Green:**
  - Виконання `node --test releases/3/6/v3.6.0/task.spec.js` та `pnpm run test:all`.

---

## ✅ Acceptance Criteria (Definition of Done)

1. **Канонічний `m.ui`:** Тег UI визначається виключно через `package.json#exports['./ui/*']` або назву пакета (`@nan0web/ui-*`).
2. **Zero-Procedural Code:** Вся робота з файловою системою та документами здійснюється виключно через інжектований `@nan0web/db`.
3. **Fluent API:** Ланцюжок `modules.filter(...).updatePackage('scripts', ...).save()` модифікує документи в базі даних та зберігає їх.
4. **Формати індексів:** `toCsv0()` генерує валідний CSV0 з FrontMatter `columns:`, `toMarkdown()` генерує стандартизовану Markdown-таблицю.
5. **Тести зелені:** Всі контрактні тести в `releases/3/6/v3.6.0/task.spec.js` проходять з кодом 0.
