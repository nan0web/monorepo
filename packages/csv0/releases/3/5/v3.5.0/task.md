---
version: 3.5.0
type: feature
status: active
locale: uk
models:
  - packages/csv0/types/domain/Format.d.ts
  - packages/csv0/types/domain/formats/BooleanFormat.d.ts
---

# 🚀 Mission: Format Model, Columns Metadata & i18n Validation (v3.5.0)

## 🏁 Overview (Огляд)

Впровадження об'єктної моделі форматів даних (`Format`) та декларативної типізації колонок у форматі `@nan0web/csv0`.

1. **Базова модель `Format`**:
   - Успадковує `Model` з `@nan0web/types`.
   - Інтерфейс:
     - `stringify(value)` $\rightarrow$ строкове представлення для CSV комірки.
     - `parse(text)` $\rightarrow$ приведення тексту комірки до нативного JS типу.
     - `validate(value)` $\rightarrow$ валідація значення через `this._.t` та `ModelError`.

2. **Вбудовані формати (Builtin Formats)**:
   - `boolean` (`BooleanFormat`): серіалізує `true` як `1`, `false` як `0`; парсить `1`, `0`, `true`, `false`, `yes`, `no`.
   - `string` (`StringFormat`): базове приведення до рядка.
   - `number` (`NumberFormat`): приведення до числа з валідацією `NaN`.

3. **Резолвінг форматів (`resolveFormat`)**:
   - `BuiltinFormats`: якщо тип вбудований (`boolean`, `string`, `number`).
   - Зовнішні доменні типи: імпорт через `package.json#exports['./format/csv0']`.
   - Локалізовані помилки валідації через `@nan0web/i18n`.

4. **Парсинг та генерація з урахуванням `columns:`**:
   - Підтримка зчитування `columns` з FrontMatter YAML у `parseCSV0`.
   - Функція `stringifyCSV0(data, options)` або мапер рядків за типами колонок.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Цільові файли (Scope Boundary):
1. **Реліз та контракти:**
   - `packages/csv0/releases/3/5/v3.5.0/task.md` — паспорт релізу.
   - `packages/csv0/releases/3/5/v3.5.0/task.spec.js` — контрактні TDD тести.
   - `packages/csv0/releases/3/5/v3.5.0/user.md` — журнал та план виправлень.
2. **Базові типи:**
   - `packages/types/src/domain/Format.js` — універсальний базовий `Format extends Model`.
3. **Доменна логіка `@nan0web/csv0`:**
   - `packages/csv0/src/domain/Format.js` — розширення `Format extends BaseFormat`.
   - `packages/csv0/src/domain/CSV0Format.js` — формат документа `CSV0Format extends Format`.
   - `packages/csv0/src/domain/FormatResolver.js` — клас `FormatResolver` для синхронного/асинхронного резолвінгу.
   - `packages/csv0/src/domain/formats/BooleanFormat.js` — формат булевих значень (0/1).
   - `packages/csv0/src/domain/formats/StringFormat.js` — текстовий формат.
   - `packages/csv0/src/domain/formats/NumberFormat.js` — числовий формат.
   - `packages/csv0/src/domain/formats/index.js` — реєстр вбудованих форматів та експорт `FormatResolver`.
4. **Парсер та генератор:**
   - `packages/csv0/src/index.js` — фасад над `CSV0Format` з нативним `NaN0` парсингом FrontMatter.
5. **Конфігурація:**
   - `packages/csv0/package.json` — експорти `./format/csv0`.

---

## 🎯 Scope (Задачі релізу)

- [x] **Крок 1: Базовий `Format` у `@nan0web/types`**:
  - Реалізовано `packages/types/src/domain/Format.js` (`Format extends Model`).
  - Пройдено `pnpm --filter @nan0web/types run test:all`.
- [x] **Крок 2: Оновлення доменної моделі в `@nan0web/csv0`**:
  - `Format` успадковує `BaseFormat` з `@nan0web/types`.
  - Створено `CSV0Format extends Format` з підтримкою `NaN0.parse` / `NaN0.stringify` для FrontMatter.
  - Реалізовано `FormatResolver` (sync/async, db context, вбудовані та розширені об'єктні схеми колонок).
- [x] **Крок 3: Вбудовані формати**:
  - `BooleanFormat` (0/1), `StringFormat`, `NumberFormat`.
- [x] **Крок 4: Інтеграція в `src/index.js`**:
  - `parseCSV0` та `stringifyCSV0` делегують виконання екземпляру `CSV0Format`.
- [x] **Крок 5: Контрактне тестування та валідація**:
  - Розширено `task.spec.js` (8/8 контрактних тестів).
  - Запущено `pnpm --filter @nan0web/csv0 run test:all` (tests, tsc, knip — 100% green).
