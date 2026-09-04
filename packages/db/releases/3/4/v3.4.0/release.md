---
name: release-v3.4.0
version: 3.4.0
type: feature
status: completed
locale: uk
models:
  - HydratedModel
  - DB
  - DBDriverProtocol
knowledge_base:
  - /packages/db/docs/uk/DB-FIRST-PATTERN.md
  - /docs/uk/workflows/model-as-app.md
  - /docs/uk/workflows/release.md
  - /docs/uk/workflows/llimo.md
---

# 🚀 Release: HydratedModel та Document & Directory Caching у @nan0web/db (v3.4.0)

> **Мета Релізу:** Забезпечити повноцінну інтеграцію доменної моделі `HydratedModel` (авто-гідратація полів, двосторонній резолвінг `$ref`, unminify згідно з `$index.fields`) та впровадити наскрізне Document & Directory Caching (швидкість обробки 1000+ SSOT документів < 500 мс замість 35+ с, надійна інвалідація кешу та негативний кеш службових шляхів).

---

## 👥 1. User Stories & Ролі

### 🔹 Роль: Розробник OLMUI-застосунків та Доменних Моделей (Model-as-Schema)
- **Story:** Як розробник OLMUI-застосунків, я хочу наслідувати свої моделі від `HydratedModel`, щоб автоматично підтягувати спільні конфігурації, файли та властивості з батьківського каталогу/документа, а також резолвити late-bound посилання `$files`, `$currencies` тощо.
  - *Критерій успіху:* Модель автоматично гідратує пропущені поля з `options.parent` та резолвить як `parent[ref]`, так і `parent['$' + ref]`.

### 🔹 Роль: Розробник конвеєрів новинного аналізу та великих сховищ SSOT даних (Pipelines & Systems)
- **Story:** Як розробник генеративних пайплайнів (Pipeline 2), я хочу виконувати масовий `db.fetch(uri)` для тисяч документів без повторного фізичного I/O з диска, щоб операції завершувалися менш ніж за 500 мс.
  - *Критерій успіху:* Повторний виклик `loadDocument` повертає збережений об'єкт з `this.data` без повторного звернення до `driver.read`.

### 🔹 Роль: Архітектор даних (SSOT & Data Integrity)
- **Story:** Як архітектор даних, я хочу бути певним, що будь-яка мутація документа (`saveDocument`, `saveFile`, `dropDocument`) негайно інвалідує або оновлює кеш у пам'яті, а негативні результати пошуку службових каталогів (`_/`, `_` тощо) кешуються, не створюючи надлишкових викликів `stat`/`readdir` у `getGlobals`.
  - *Критерій успіху:* Зміни в документах миттєво відображаються у викликах читання, а відсутні каталоги не скануються повторно.

---

## 📋 2. Завдання Релізу та Контракти (Tasks & Contracts)

### Етап 1: Інтеграція та Стабілізація HydratedModel

#### 🔹 Задача 1.1: Авто-гідратація та двосторонній резолвінг посилань у HydratedModel
- **User Story:** *Як розробник, я хочу передавати `options.parent` у `HydratedModel` і отримувати заповнені поля моделі навіть без явного оголошення полів у вхідному об'єкті.*
- **Контракт (Test):** [task.spec.js](file:///Users/i/src/nan.web/packages/db/releases/3/4/v3.4.0/task.spec.js)
- **Цільові файли (Target Files):**
  - `[MODIFY]` [HydratedModel.js](file:///Users/i/src/nan.web/packages/db/src/HydratedModel.js)
  - `[MODIFY]` [index.js](file:///Users/i/src/nan.web/packages/db/src/index.js)
- **Критерії (DoD):**
  - [ ] `HydratedModel` експортовано в `src/index.js`.
  - [ ] Двосторонній пошук `$ref` у батьківському документі (`parent[ref]` та `parent['$' + ref]`).
  - [ ] Поля батьківського документа автоматично гідратуються у властивості моделі.

### Етап 2: In-Memory Document Read Cache & Інвалідація

#### 🔹 Задача 2.1: Document Read Caching у `loadDocumentAs`
- **User Story:** *Як розробник, я хочу, щоб результат читання через `driver.read(abs)` зберігався в пам'яті `this.data.set(uri, result)`, а повторні виклики `loadDocument(uri)` віддавали об'єкт з пам'яті.*
- **Контракт (Test):** [task.spec.js](file:///Users/i/src/nan.web/packages/db/releases/3/4/v3.4.0/task.spec.js)
- **Цільові файли (Target Files):**
  - `[MODIFY]` [DB.js](file:///Users/i/src/nan.web/packages/db/src/DB/DB.js)
- **Критерії (DoD):**
  - [ ] Результат першого читання через драйвер кешується в `this.data`.
  - [ ] Повторне читання за тим самим URI не викликає `driver.read`.
  - [ ] Мутації через `saveDocument`, `saveFile`, `dropDocument` оновлюють або очищають кеш у `this.data`.

### Етап 3: Directory & Negative Caching

#### 🔹 Задача 3.1: Кешування директорій та негативних результатів
- **User Story:** *Як розробник, я хочу уникнути повторних звернень до диска для перевірки відсутніх службових каталогів `_/` або файлів конфігурації у `getGlobals`.*
- **Контракт (Test):** [task.spec.js](file:///Users/i/src/nan.web/packages/db/releases/3/4/v3.4.0/task.spec.js)
- **Цільові файли (Target Files):**
  - `[MODIFY]` [DB.js](file:///Users/i/src/nan.web/packages/db/src/DB/DB.js)
- **Критерії (DoD):**
  - [ ] Кешування результатів `listDir` / `readDir` для службових шляхів.
  - [ ] Запам'ятовування відсутності директорій/файлів (Negative Caching), щоб не повторювати `fs.stat`/`fs.readdir`.

### Етап 4: Продуктивність та Бенчмарк `fetchMerged`

#### 🔹 Задача 4.1: Бенчмарк на 1000+ документів
- **User Story:** *Як системний інженер, я хочу підтвердити, що `fetchMerged` із увімкненими `inherit: true`, `globals: true`, `refs: true` обробляє 1000 документів менш ніж за 500 мс завдяки кешу.*
- **Контракт (Test):** [task.spec.js](file:///Users/i/src/nan.web/packages/db/releases/3/4/v3.4.0/task.spec.js)
- **Цільові файли (Target Files):**
  - `[MODIFY]` [task.spec.js](file:///Users/i/src/nan.web/packages/db/releases/3/4/v3.4.0/task.spec.js)
- **Критерії (DoD):**
  - [ ] 1000 документів зчитуються менш ніж за 500 мс.
  - [ ] Збережено повну функціональність `inherit`, `globals`, `refs`.
  - [ ] Усі регресійні тести пакету проходять (`pnpm test`).

---

## 🧪 3. Критерії Прийомки та Релізний Gate (Definition of Done)
- [x] **Контрактні тести (TDD):** Усі тести у `task.spec.js` (HydratedModel + Caching + Benchmark) проходять на 100% (Green).
- [x] **TypeScript:** Типи компілюються без помилок (`pnpm run build`).
- [x] **Швидкість:** Каскадна обробка 1000+ документів займає < 500 мс (~177 мс).
- [x] **Data-First:** Жодного процедурного коду та прямих викликів `node:fs` у доменному шарі.
- [x] **Чистота Git:** Відсутність незв'язаних змін у `git status`.

---

## 📝 4. Журнал Зворотного Зв'язку та Ретроспектива (Feedback & Decisions)
* **[2026-08-27]**: Початкова ініціалізація задач HydratedModel у v3.4.0.
* **[2026-09-04 11:55]**: Зауваження Архітектора: реліз v3.4.0 має бути доповнений завданням In-Memory Document & Directory Caching, зберігаючи та розширюючи задачі `HydratedModel`, без затирання попереднього доробку.
