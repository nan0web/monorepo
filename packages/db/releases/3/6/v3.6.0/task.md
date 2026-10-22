---
status: done
type: minor
epic: EPIC-DB-CASCADING-ROOT
sprint: Sprint 45
tracker: https://github.com/nan0web/monorepo/issues/{id}
---

# v3.6.0 — db: Cascading Down-Tree Root & Config Resolution (`createRootDown` / `createRootUp`)

## Опис та Мета
Архітектурне розширення ядра `@nan0web/db` для автоматичного визначення кореня проєкту, обчислення відносної дельти робочого простору (`root = delta(targetDir, rootDb.cwd)`) та підтримки каскадного пошуку конфігів (`inspect.config`, `release.config`, `package.json` тощо) безпосередньо в базовому класі `DB`.

### Ключові принципи та алгоритм:
1. **Правило розширень файлів (`DATA_EXTNAMES` vs Явне розширення):**
   - Якщо `markerPattern` передано **без розширення** (наприклад, `'inspect.config'`):
     Пошук автоматично перевіряє всі підтримувані розширення даних `DB.DATA_EXTNAMES` (`.nan0`, `.yaml`, `.yml`, `.json`, `.js`, `.md` тощо).
   - Якщо `markerPattern` передано **з явним розширенням** (наприклад, `'package.json'` або `'inspect.config.nan0'`):
     Пошук перевіряє суворо цей конкретний файл без перебору зайвих розширень.
2. **Поведінка Fallback (Коли маркер не знайдено):**
   - Якщо маркер не знайдено ні вгору, ні вниз, `createRootUp` / `createRootDown` безпечно повертає scoped DB, де корінь збігається з цільовим каталогом:
     `rootDb.cwd = targetDir`, `rootDb.root = ''` (або `.` відповідно).
3. **Обчислення дельти кореня (`delta`):**
   - Коли маркер знайдено у предку (наприклад, `/var/` при роботі в `/var/www/website1/`):
     - `rootDb.cwd = '/var/'` (точка вищого конфігу/маркера)
     - `rootDb.root = 'www/website1/'` (відносна дельта `relative(cwd, targetDir)`)

## Команда
- **Lead / Architect:** ЯRаСлав (support@yaro.page)
- **AI Lead Developer:** АрхіТехноМаг (Antigravity Agent)

## Робочий План та Задачі

### 1. Доменна Модель та Контракт DB
- [x] [#ROOT-1] Реалізація методу `createRootUp(markerName, targetDir)` у класі `DB` (`packages/db/src/DB/DB.js` або `DBBase.js`).
- [x] [#ROOT-2] Реалізація методу `createRootDown(markerName, targetDir)` для низхідного проходу від виявленого кореня монтування до `targetDir`.
- [x] [#ROOT-3] Автоматичне розгортання розширень через `DB.DATA_EXTNAMES`, якщо маркер передано без крапки/розширення.
- [x] [#ROOT-4] Fallback-поведінка: якщо маркер не знайдено, `rootDb` повертається з `cwd = targetDir` та `root = ''`.

### 2. Тестування (TDD / BDD)
- [x] [#TEST-1] Контрактний тест перевірки наявності методів `createRootUp` та `createRootDown` на екземплярі `DB`.
- [x] [#TEST-2] Тест обчислення дельти `cwd` + `root` при знаходженні маркера у вищих каталогах.
- [x] [#TEST-3] Тест поведінки при явному розширенні (`'package.json'`) та без розширення (`'inspect.config'`).
- [x] [#TEST-4] Тест fallback-поведінки, коли маркер відсутній у всьому дереві.
- [x] [#TEST-5] 100% Green проходження `pnpm test` у `packages/db`.

## Критерії Прийнятності (DoD)
- [x] Методи `createRootUp` та `createRootDown` працюють на рівні ядра `@nan0web/db` (не залежать від DBFS).
- [x] Збережено принцип Agnostic Database та сумісність з In-Memory, Virtual та FS драйверами.
- [x] Усі контрактні тести в `releases/3/6/v3.6.0/task.spec.js` успішно проходять.
- [x] Відсутність сторонніх npm-залежностей.
