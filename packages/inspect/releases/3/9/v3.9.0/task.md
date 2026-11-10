---
version: 3.9.0
type: feature
status: done
locale: uk
models:
  - packages/inspect/types/domain/ast/FastApiDiscovery.d.ts
  - packages/inspect/types/domain/app/InspectorApp.d.ts
---

# 🚀 Mission: Fast API Discovery & Skeleton AST Contractor (v3.9.0)

## 🏁 Overview (Огляд)

Створення високошвидкісного інструменту зчитування AST-контрактів коду (`FastApiDiscovery`) у `@nan0web/inspect`:

1. **Мінімальний синтаксичний контракт (Skeleton Nano/YAML)**:
   - Екстракція контрактів файлів декларацій (`types/**/*.d.ts`) та вихідних файлів без тіл функцій і реалізації.
   - Збереження сигнатур, JSDoc-описів, типів вхідних параметрів та значень, що повертаються.
   - Економія до 90-95% контекстних токенів при передачі коду агентам.

2. **Гнучка фільтрація та глибина аналізу**:
   - `--level <classes|methods|fields|all>`: обмеження глибини виводу (лише список класів з описами, або класи з полями/методами).
   - `--only <static|async|methods|fields>`: точкова фільтрація сутностей (наприклад, тільки статичні поля схеми, або тільки асинхронні методи).
   - `--include-deps`: витягування залежних типів та схем (`deps:`), які зустрічаються в аргументах чи полях.

3. **Командний інтерфейс**:
   - `nan0inspect api <path>` або `nan0inspect outline <path>`
   - Підтримка формату виводу `--format nano` (лаконічний компактний YAML без зайвого синтаксичного шуму).

---

## 👥 User Stories (Сценарії)

> **Як ШІ-агент (АрхіТехноМаг)**, я хочу запустити швидкий аналіз контракту `nan0inspect api packages/inspect/types/domain/AuditorModel.d.ts --level methods`, щоб отримати точні сигнатури та описи методів без засмічення контексту вихідним кодом.  
> **Як Розробник**, я хочу використати компактний огляд файлу, щоб за секунду зрозуміти структуру великого класу чи модуля.  
> **Як Архітектор**, я хочу мати фундамент для майбутнього VS Code extension або Language Server з надшвидким оглядом API.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Першочергові контракти:
- `packages/inspect/releases/3/9/v3.9.0/task.spec.js`
- `packages/inspect/src/domain/ast/FastApiDiscovery.js`
- `packages/inspect/src/domain/app/InspectorApp.js`

### Цільові файли (Scope Boundary):
1. **Реліз та контракти:**
   - `packages/inspect/releases/3/9/v3.9.0/task.md`
   - `packages/inspect/releases/3/9/v3.9.0/user.md`
   - `packages/inspect/releases/3/9/v3.9.0/task.spec.js`
2. **Доменна логіка:**
   - `packages/inspect/src/domain/ast/FastApiDiscovery.js`
   - `packages/inspect/src/domain/app/FastApiApp.js`
   - `packages/inspect/src/domain/app/InspectorApp.js`
   - `packages/inspect/src/domain/index.js`
   - `packages/inspect/src/index.js`
3. **Експорти та конфігурації:**
   - `packages/inspect/package.json`

---

## 🎯 Scope (Задачі релізу)

- [x] **§1 Контрактне тестування (TDD Red):**
  - Описати повний набір контрактних тестів у `releases/3/9/v3.9.0/task.spec.js`:
    - Екстракція класів, полів, методів, параметрів, типів та JSDoc.
    - Фільтрація `--level <classes|methods|fields|all>`.
    - Точкова фільтрація `--only <static|async|methods|fields>`.
    - Екстракція залежностей `--include-deps`.
    - Серіалізація в лаконічний формат Nano/YAML (`toNanoYaml`).
    - Інтеграція підкоманди `api` / `outline` в `InspectorApp`.
- [x] **§2 Реалізація `FastApiDiscovery` (TypeScript AST Parser):**
  - Використання `typescript` AST парсера (без виклику важкого typeChecker для швидкодії або легкий AST traversal).
  - Підтримка зчитування як сирцевих рядків (`extractFromSource`), так і файлів через інжектовану базу `@nan0web/db` (`extractFromFile`).
  - Серіалізатор `toNanoYaml(extracted)`.
- [x] **§3 Реалізація CLI команди `FastApiApp` та інтеграція в `InspectorApp`:**
  - Підтримка підкоманди `api` та аліаса `outline`.
  - Підтримка опцій `--level`, `--only`, `--format` (nano/json), `--include-deps`.
- [x] **§4 Експорти, типізація (`tsc`) та інтеграція:**
  - Додати експорти в `packages/inspect/package.json` та `src/domain/index.js`.
  - Збірка TypeScript типів (`pnpm run build`), перевірка лінтером (`pnpm run lint`), гігієна (`pnpm run knip`).
  - Проходження всіх тестів пакета (`pnpm run test:all`).

---

## ✅ Acceptance Criteria (Definition of Done)

1. **Повний TDD Green:** Усі контрактні тести в `releases/3/9/v3.9.0/task.spec.js` успішно проходять (`pass`).
2. **Екстракція AST:** Коректне вилучення сигнатур класів, методів та полів без тіл функцій з JSDoc.
3. **Гнучкі фільтри:** `--level` та `--only` працюють згідно зі специфікацією.
4. **Формат Nano/YAML:** Вивід лаконічного YAML без зайвого шуму для економії токенів.
5. **CLI Інтеграція:** Команди `nan0inspect api <path>` та `nan0inspect outline <path>` повертають очікуваний результат.
6. **Повна валідація:** `pnpm run test:all` виконується без жодної помилки.
