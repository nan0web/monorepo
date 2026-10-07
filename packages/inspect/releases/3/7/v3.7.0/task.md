---
version: 3.7.0
type: feature
status: active
locale: uk
models:
  - packages/inspect/types/domain/config/InspectConfig.d.ts
---

# 🚀 Mission: Typed Configuration Model (`InspectConfig`) & Cascading Setup (v3.7.0)

## 🏁 Overview (Огляд)

Впровадження централізованої типізованої конфігураційної моделі `InspectConfig` на базі `Model-as-Schema v2` для пакету `@nan0web/inspect` та адаптація для монорепозиторію банку (`apps/3rdparty/industrialbank`).

1. **Сувора Модель `InspectConfig` (`extends Model`)**:
   - `skip: string[]` — список аліасів аудиторів, що виключаються з виконання (`['snapshots', ...]`).
   - `theming: object` — конфігурація виключень для OLMUI Theming Auditor (`ignorePatterns`, `ignoreDirs`).
   - `snapshots: object` — конфігурація для SnapshotAuditor (`optional: boolean`, `allowEmpty: boolean`, `dir: string`).
   - `rules: Record<string, boolean>` — гранулярне перемикання окремих евристик (наприклад, `rules: { exportDefault: false }`).

2. **Каскадний резолвінг (Cascading Resolution) через `@nan0web/db`**:
   - Підтримка читання конфігурації у форматі `.nan0`, `.yaml`, `.js`.
   - Пошук за пріоритетом:
     1. Глобальний: `~/.nan0web/inspect/config.nan0`
     2. Кореневий: `<repo_root>/inspect.config.{nan0,yaml,js}`
     3. Проєктний: `<target_dir>/inspect.config.{nan0,yaml,js}`
   - Злиття (deep merge) конфігурацій без процедурного `fs` (Zero-Procedural Code, тільки інжектована `@nan0web/db`).

3. **Інтеграція в `InspectorApp` та `ArchitectureAuditor`**:
   - `InspectorApp` завантажує `InspectConfig` під час `init()`.
   - Опції з конфігу автоматично інжектуються у відповідні аудитори перед їхнім запуском.

4. **Конфігураційні файли монорепозиторію Industrial Bank**:
   - `apps/3rdparty/industrialbank/inspect.config.nan0`
   - `apps/3rdparty/industrialbank/cms/inspect.config.nan0`

---

## 👥 User Stories (Сценарії)

> **Як Архітектор платформи**, я хочу налаштовувати роботу інспекторів через декларативний `inspect.config.nan0`, щоб ізолювати специфіку окремих проєктів (наприклад, Payload CMS) без хардкоду в ядрах аудиторів.  
> **Як Інженер автоматизації**, я хочу мати сувору типізовану модель `InspectConfig`, щоб мати автодоповнення, валідацію та безпечне злиття каскадних налаштувань.  
> **Як ШІ-агент (АрхіТехноМаг)**, я хочу, щоб конфігурація автоматично підхоплювалася командою `nan0inspect`, забезпечуючи 100% зелені перевірки без ручних параметрів CLI.

---

## 🏗 Data-Driven Architecture (Моделювання)

### Першочергові контракти:
- `packages/inspect/src/domain/config/InspectConfig.js`
- `packages/inspect/releases/3/7/v3.7.0/task.spec.js`

### Цільові файли (Scope Boundary):
1. **Реліз та контракти:**
   - `packages/inspect/releases/3/7/v3.7.0/task.md`
   - `packages/inspect/releases/3/7/v3.7.0/user.md`
   - `packages/inspect/releases/3/7/v3.7.0/task.spec.js`
2. **Доменна логіка:**
   - `packages/inspect/src/domain/config/InspectConfig.js`
   - `packages/inspect/src/domain/app/ArchitectureAuditor.js`
   - `packages/inspect/src/domain/app/InspectorApp.js`
3. **Експорти:**
   - `packages/inspect/src/index.js`
   - `packages/inspect/package.json`
4. **Конфігурація банку:**
   - `apps/3rdparty/industrialbank/inspect.config.nan0`
   - `apps/3rdparty/industrialbank/cms/inspect.config.nan0`

---

## 🎯 Scope (Задачі релізу)

- [x] **Крок 1: Контрактне тестування (TDD Red):**
  - Створити `releases/3/7/v3.7.0/task.spec.js` для валідації `InspectConfig`, каскадного завантаження та злиття опцій.
- [x] **Крок 2: Реалізація моделі `InspectConfig`:**
  - Розробка `InspectConfig extends Model` зі схемою полів, валідацією та статичним методом `InspectConfig.load(db, targetDir)`.
- [x] **Крок 3: Інтеграція в `ArchitectureAuditor` та `InspectorApp`:**
  - Застосування завантаженого конфігу для фільтрації аудиторів та передачі параметрів у `SnapshotAuditor` / `OlmuiThemingAuditor`.
- [x] **Крок 4: Створення конфігураційних файлів банку:**
  - Додавання `inspect.config.nan0` у `apps/3rdparty/industrialbank` та `apps/3rdparty/industrialbank/cms`.
- [x] **Крок 5: Перевірка зеленого прогону:**
  - Запуск `node --test releases/3/7/v3.7.0/task.spec.js` та перевірка `pnpm inspect cms` у банку.

---

## ✅ Acceptance Criteria (Definition of Done)

1. **Model-as-Schema:** `InspectConfig` наслідує `Model`, містить повний JSDoc та валідацію через `@nan0web/core`.
2. **Cascading Loading:** Метод `InspectConfig.load(db, dir)` коректно завантажує і зливає файли конфігурації.
3. **Zero-Procedural Code:** Робота з конфігурацією відбувається виключно через `@nan0web/db`.
4. **Конфігураційні файли наявні:** Створено декларативні `inspect.config.nan0` для Industrial Bank.
5. **Тести зелені:** Всі контрактні тести в `releases/3/7/v3.7.0/task.spec.js` проходять з кодом 0.
