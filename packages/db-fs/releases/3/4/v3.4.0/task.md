---
version: 3.4.0
type: refactoring
status: completed
locale: uk
models: ["DBFS", "DBFSBase", "DBFSPath", "DBFSDoc", "DBFSDir", "DBFSStream"]
---

# 🚀 Mission: Декомпозиція DBFS на ланцюжок шарів parts/* у @nan0web/db-fs (v3.4.0)

## 🏁 Overview (Огляд)

Клас `DBFS` у пакеті `@nan0web/db-fs` наразі є монолітним файлом (`packages/db-fs/src/DBFS.js`, >700 рядків коду), що об'єднує:
- реєстрацію форматів даних (`.json`, `.csv`, `.tsv`, `.yaml`, `.md`, `.jsonl`);
- фізичний резолвінг шляхів та роботу з системними томами (`realpath`, `getVolumes`, `location`, `relative`);
- читання, збереження, видалення документів та потоковий запис (`loadDocumentAs`, `saveDocumentAs`, `saveFile`, `writeDocument`, `dropDocument`);
- операції з директоріями та виявлення локалей (`loadDirectory`, `loadLocales`);
- стрімінг та обхід дерева файлів (`findStream`).

Мета релізу v3.4.0 — провести архітектурну декомпозицію за стандартом Layered Inheritance Mixin/Class Chain (аналогічно до `@nan0web/db` `packages/db/src/DB/parts/*`), забезпечивши 100% зворотну сумісність та чисті TypeScript-декларації.

---

## 👥 User Stories (Сценарії)

- Як розробник платформи, я хочу мати модульну, ізольовану структуру шарів `DBFS/parts/*`, щоб швидко знаходити та масштабувати специфічну файлову логіку.
- Як користувач `@nan0web/db-fs`, я хочу, щоб публічний API класу `DBFS` залишався 100% сумісним, зберігаючи всі статичні поля (`FS`, `Driver`) та методи без ламання залежних пакетів.
- Як інженер якості, я хочу бути певним, що декомпозиція повністю верифікована сценарними тестами з In-Memory та реальними файловими сценаріями.

---

## 🎯 Scope (Задачі)

### Блок 1: Створення шарів `packages/db-fs/src/DBFS/parts/*`
- [x] `DBFSBase.js`:
  - Наслідується від `DB` (`@nan0web/db`).
  - Ініціалізація `FS`, `Driver`, реєстрація форматів (`.jsonl`, `.txt`, `.md`, `.csv`, `.tsv`, `.csv0`, `.tsv0`, `.yaml`, `.json`).
- [x] `DBFSPath.js`:
  - Наслідується від `DBFSBase`.
  - Фізична перевірка `isPhysical()`, побудова директорій `_buildPath()`, методи `location()`, `resolveSync()`, `relative()`, `realpath()`, `getVolumes()`.
- [x] `DBFSDoc.js`:
  - Наслідується від `DBFSPath`.
  - Операції збереження й завантаження: `statDocument()`, `loadDocumentAs()`, `saveDocumentAs()`, `saveFile()`, `saveDocument()`, `writeDocument()`, `dropDocument()`, `drop()`, `stream()`.
- [x] `DBFSDir.js`:
  - Наслідується від `DBFSDoc`.
  - Робота з каталогами: `loadDirectory()`, виявлення та сортування локалей `loadLocales()`.
- [x] `DBFSStream.js`:
  - Наслідується від `DBFSDir`.
  - Потоковий обхід файлової системи `findStream()` та генерація подій.
- [x] `DBFS.js` (головний фасад у `src/DBFS.js`):
  - Наслідується від `DBFSStream`.
  - Статичні властивості: `static FS = FS`, `static Driver = FSDriver`.
  - Статичні фабричні методи: `static from(input)`.

### Блок 2: Оновлення експортів та точки входу
- [x] Перевірити `packages/db-fs/src/index.js` на сумісність реекспорту `DBFS`, `FSDriver`, `load`, `save` тощо.
- [x] Перевірити `package.json` та `exports` пакета `@nan0web/db-fs`.

### Блок 3: Тестування та верифікація (TDD First)
- [x] Створити сценарний/релізний тест `src/test/releases/3/4/v3.4.0/task.test.js` для перевірки всіх шарів успадкування та методів `DBFS`.
- [x] Запустити `pnpm --filter @nan0web/db-fs run test:all`.
- [x] Запустити генерацію типів `tsc` і перевірити валідність `types/index.d.ts`.
- [x] Прогнати повний monorepo build `pnpm -r run build` та `pnpm test:status`.

---

## ✅ Acceptance Criteria (DoD)

- [x] Усі шари `DBFS` ізольовані у `packages/db-fs/src/DBFS/parts/` і мають єдину відповідальність.
- [x] Розмір кожного файлу шару не перевищує 150–200 рядків коду.
- [x] Усі сценарні та юніт-тести `@nan0web/db-fs` проходять успішно (`pnpm --filter @nan0web/db-fs run test:all`).
- [x] TypeScript збірка `tsc` збирає типи без помилок.
- [x] Жоден зовнішній пакет чи додаток (`@nan0web/ui-cli`, `apps/llimo.app` тощо) не зазнає регресії.
