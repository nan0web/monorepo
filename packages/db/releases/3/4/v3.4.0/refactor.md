# План Декомпозиції `src/DB/DB.js` (@nan0web/db)

## 1. Контекст та Проблема
Файл `src/DB/DB.js` налічує **2549 рядків коду** (~82 КБ), у якому сконцентровано щонайменше 7 різних архітектурних обов'язків (Single Responsibility Principle порушено). Це спричиняє:
- Високе навантаження на контекстне вікно та часті циклічні зчитування агентом.
- Складність супроводу кешування, драйверів, індексації та ієрархічного об'єднання даних (`fetchMerged`).
- Ризик регресій при точкових правках.

При цьому зовнішній контракт класу `DB` зафіксований у `types/DB/DB.d.ts` (896 рядків), а вся поведінка покрита понад 550 юніт-тестами та сценарними тестами.

---

## 2. Архітектурний Патерн Декомпозиції

Використовуємо класичний патерн **Class Composition через прототипні міксіни або ланцюг успадкування (Layered Inheritance)**:

```
DBDriverProtocol (базовий інтерфейс)
   ▲
DBBase (конфігурація, опції, події on/emit, watch/unwatch, аліаси, монтування mount/unmount)
   ▲
DBAccess (ensureAccess, requireConnected, сесії, authContext)
   ▲
DBDoc (loadDocument, loadDocumentAs, saveDocument, saveFile, statDocument, writeDocument, dropDocument, push, moveDocument)
   ▲
DBDir (listDir, readDir, browse, find, findStream, readBranch, buildIndexes, loadIndex, saveIndex, _dirCache)
   ▲
DBFetch (fetch, _fetchPrimary, fetchMerged, getInheritance, getGlobals, resolveReferences, fetchStream)
   ▲
DBModel (model, _findModel, _hydrate, validate)
   ▲
DB (Головний клас-фасад, експорт за замовчуванням: збирає статичні поля, duck-typing `isDB`, `from`, зворотну сумісність)
```

> **Чому ланцюг успадкування (Layered Classes)?**
> 1. Повне збереження `instanceof DB` та `this` у всіх методах без overhead динамічного bind.
> 2. `types/DB/DB.d.ts` залишається 100% валідним без зміни сигнатур чи потреби переписувати генерацію d.ts.
> 3. Кожен файл містить від 200 до 450 рядків — ідеальний розмір для швидкого читання агентами та людиною.

---

## 3. Декомпозиція за модулями (`src/DB/parts/`)

### Модуль 1: `src/DB/parts/DBBase.js` (~300 рядків)
- **Конструктор:** ініціалізація `cwd`, `root`, `driver`, `data`, `meta`, `aliases`, `mounts`, `models`, `registry`, `console`, `ttl`.
- **Властивості та гетери:** `options`, `loaded`, `sealed`, `console`, `isRoot`, `realpath`, `route`.
- **Події та спостереження:** `on`, `emit`, `watch`, `unwatch`, `_watchers`.
- **Монтування:** `mount`, `unmount`, `getMount`, `getMounts`, `_findMount`, `seal`, `attach`, `detach`.
- **Шляхи:** `extname`, `relative`, `basename`, `dirname`, `normalize`, `resolveSync`, `resolve`, `absolute`, `isRemote`, `isAbsolute`, `location`.
- **Аліаси:** `resolveAlias`.
- **Утиліти:** `extract`, `dump`, `toString`.

### Модуль 2: `src/DB/parts/DBAccess.js` (~150 рядків)
- `ensureAccess(uri, level, context)`
- `requireConnected()`
- `connect()`
- `disconnect()`

### Модуль 3: `src/DB/parts/DBDoc.js` (~450 рядків)
- **Читання/запис/видалення документів:**
  - `loadDocument(uri, defaultValue, context)`
  - `loadDocumentAs(ext, uri, defaultValue, context)` (з in-memory кешем `this.data.set(uri, result)`)
  - `saveDocument(uri, document, context)` (з інвалідацією кешу `uri` + `abs` та `_dirCache`)
  - `saveFile(uri, content, context)`
  - `writeDocument(uri, chunk, context)`
  - `dropDocument(uri, context)` (з очищенням кешу `uri` + `abs` та `_dirCache`)
  - `statDocument(uri, context)`
  - `stat(uri, context)`
  - `get(uri, input, context)`, `getAll(uris, input, context)`
  - `set(uri, data, context)`, `setAll(entries, context)`
  - `stream(uri, context)`
  - `push(uri, context)`
  - `moveDocument(from, to, context)`

### Модуль 4: `src/DB/parts/DBDir.js` (~450 рядків)
- **Директорії, індекси та пошук:**
  - `_dirCache: Map<string, DocumentEntry[]>` (кеш списків директорій та негативний кеш)
  - `listDir(uri, context)`
  - `readDir(uri, options)`
  - `readBranch(uri, depth)`
  - `browse(uri, options)`
  - `find(uri, depth)`
  - `findStream(uri, options)`
  - `buildIndexes(dir)`
  - `saveIndex(dirUri, entries)`
  - `loadIndex(dirUri)`
  - `fetchIndex(dir)`
  - `_buildRecursiveDirectoryTree(dirPath, entries, depth)`
  - `_updateIndex(uri)`

### Модуль 5: `src/DB/parts/DBFetch.js` (~450 рядків)
- **Ієрархічне читання та резолюція посилань:**
  - `fetch(uri, input, contextOrVisited, visited)`
  - `_fetchPrimary(uri, input, context, visited)`
  - `fetchMerged(uri, opts, contextOrVisited, visited)`
  - `getInheritance(path)`
  - `getGlobals(path)` (з використанням `_dirCache`)
  - `resolveReferences(data, basePath, opts, visited)`
  - `_findReferenceKeys(flat)`
  - `_getParentReferenceKey(key)`
  - `fetchStream(uri, input, context)`
  - `isData(uri)`

### Модуль 6: `src/DB/parts/DBModel.js` (~200 рядків)
- **Моделі, гідрація та валідація:**
  - `model(prefix, ModelClass)`
  - `_findModel(uri)`
  - `_hydrate(data, ModelClass)`
  - `validate(uri, data)`

### Модуль 7: `src/DB/DB.js` (~120 рядків)
- Головний клас: `export default class DB extends DBModel { ... }`
- Статичні поля:
  - `static Data = Data`
  - `static Directory = Directory`
  - `static Driver = DBDriverProtocol`
  - `static Index = DirectoryIndex`
  - `static GetOptions = GetOptions`
  - `static FetchOptions = FetchOptions`
  - `static DATA_EXTNAMES = Directory.DATA_EXTNAMES`
  - `static isDB(obj)`
  - `static from(input)`

---

## 4. Поетапний План Виконання (Release v3.4.0 + Refactoring)

### Етап 1: Завершення контрактних тестів релізу v3.4.0 (3 тести)
1. **Тест 2.1 & 2.2**: Додати кешування драйвера у `this.data.set(uri, result)` у `loadDocumentAs`, перевірку `this.data.has(uri)`.
2. **Тест 2.2**: Інвалідація кешу в `saveDocument` та `dropDocument` (видалення і збереження за `uri` та `abs`).
3. **Тест 3.1**: Впровадження `_dirCache` у `getGlobals` та `listDir` для запобігання зайвим викликам драйвера `listDir`.
4. Верифікація: запуск `node --test releases/3/4/v3.4.0/task.spec.js` (усі 7/7 тестів зелені).

### Етап 2: Створення частин `src/DB/parts/` та збірка ланцюга
1. Створення директорії `src/DB/parts/`.
2. Поетапний виніс логіки в:
   - `DBBase.js`
   - `DBAccess.js`
   - `DBDoc.js`
   - `DBDir.js`
   - `DBFetch.js`
   - `DBModel.js`
3. Мінімізація `src/DB/DB.js` до кінцевого фасаду.

### Етап 3: Верифікація та Гігієна
1. `node --test releases/3/4/v3.4.0/task.spec.js` — 7/7 тестів.
2. `pnpm test` — всі 557+ тестів зелених (без регресій).
3. `pnpm run build` / генерація типів — перевірка відповідності `types/DB/DB.d.ts`.
4. `pnpm run test:docs` — перевірка працездатності документації.
