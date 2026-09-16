---
version: 3.4.0
type: feature
status: completed
locale: uk
models: ["HydratedModel", "DB", "DBDriverProtocol"]
---

# 🚀 Mission: HydratedModel та Document & Directory Caching у @nan0web/db (v3.4.0)

## 🏁 Overview (Огляд)
Реліз v3.4.0 об'єднує два ключових напрямки розвитку ядра `@nan0web/db`:
1. **Інтеграція HydratedModel**:
   - Автоматичне розгортання скорочених імен полів згідно з `$index.fields` батьківського документа.
   - Резолвінг Late-Bound посилань через префікс `$` (наприклад `$files`, `$currencies`, `$auto`).
   - Підтримка посилань на властивості як з префіксом `$`, так і без нього (`parent[refKey]` та `parent['$' + refKey]`).
   - Автоматична гідратація пропущених/непереданих полів з контексту батьківського документа `options.parent`.
2. **Document & Directory Caching**:
   - Усунення 35-секундних затримок при каскадних викликах `db.fetch(uri)` на масивах файлів (1000+ SSOT документів).
   - In-Memory Document Read Cache: кешування результатів успішного читання через `driver.read(abs)` у `this.data.set(uri, result)`.
   - Інвалідація кешу при `saveDocument`, `saveFile`, `dropDocument`.
   - Directory & Negative Caching для службових шляхів (`_/`, `_` тощо).
   - Забезпечення виконання `fetchMerged` (`inherit: true`, `globals: true`, `refs: true`) для 1000+ файлів менш ніж за 500 мс.

## 👥 User Stories (Сценарії)
- Як розробник OLMUI-застосунків, я хочу наслідувати свої моделі від `HydratedModel`, щоб автоматично підтягувати спільні конфігурації та файли з батьківського каталогу/документа без зайвого дублювання.
- Як розробник аналітичних та новинних конвеєрів, я хочу миттєво зчитувати зв'язані документи з кешу пам'яті без блокування на повторному файловому I/O.
- Як архітектор даних, я хочу, щоб збереження, зміна або видалення документа негайно скидали кешовані дані.

## 🎯 Scope (Задачі)

### Блок 1: HydratedModel
- [x] Експортувати `HydratedModel` у `src/index.js` пакету `@nan0web/db`.
- [x] Додати підтримку двостороннього пошуку `$ref` у батьківському документі (`parent[ref]` та `parent['$' + ref]`).
- [x] Забезпечити автоматичну гідратацію полів моделі з `options.parent` для властивостей, присутніх у батьківському контексті.

### Блок 2: In-Memory Document Read Cache & Інвалідація
- [x] Зберігати результат успішного читання через `driver.read(abs)` у `this.data.set(uri, result)` у `DB.prototype.loadDocumentAs`.
- [x] При повторному читанні за тим самим `uri` повертати збережений об'єкт без виклику `driver.read`.
- [x] Синхронізувати інвалідацію кешу в `saveDocument`, `saveFile`, `dropDocument`.

### Блок 3: Directory & Negative Caching
- [x] Кешувати результати `listDir` / `readDir` для службових шляхів (`_/`, `_` тощо).
- [x] Запам'ятовувати відсутність директорій та службових файлів конфігурації (Negative Cache) для запобігання повторним викликам драйвера в `getGlobals`.

### Блок 4: Тестування та Бенчмарк
- [x] Покрити повним набором контрактних тестів (`task.spec.js`), включно з контрактами HydratedModel та Caching.
- [x] Реалізувати бенчмарк на 1000 документів з активними `globals`, `inherit` та `refs` із часом виконання < 500 мс.

### Блок 5: Multi-Index Directory Support (['index', 'README'])
- [x] Оновити `Directory.INDEX = ['index', 'README']` (масив рядків з підтримкою зворотної сумісності для одиночного рядка).
- [x] Додати `Directory.isIndex(name)` для перевірки відповідності імені індексному файлу.
- [x] Оновити `DB.prototype.route(uri, ext = '')` для коректного згортання будь-якого індексу з масиву в `/` або `/dir/`.
- [x] Оновити `DB.prototype._fetchPrimary`: при доступі до каталогу або шляху без розширення перевіряти послідовно всі індекси з `Directory.INDEX`.

### Backlog
- [ ] Дослідити перевизначення `$directory.index` через `_` конфіги поруч із базовим масивом `Directory.INDEX`.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактний тест `task.spec.js` проходить на 100% (Green).
- [x] Усі 3 тести `HydratedModel` успішно проходять.
- [x] Повторне читання документа через `db.loadDocument` не викликає `driver.read`.
- [x] Збереження (`saveDocument`) та видалення (`dropDocument`) коректно інвалідують кеш у `this.data`.
- [x] Негативний кеш запобігає повторним викликам читання відсутніх службових файлів/папок у `getGlobals`.
- [x] `Directory.INDEX` підтримує масив `['index', 'README']`, а `db.route('README.md')` та `db.route('docs/README.md')` повертають `'/'` та `'/docs/'`.
- [x] `db.fetch('dir/')` або звернення до директорії коректно повертає `README`, якщо `index` відсутній.
- [x] Бенчмарк на 1000 документів виконується менш ніж за 500 мс.
- [x] TypeScript декларації валідні (`pnpm run build`).
- [x] Усі тести пакету `@nan0web/db` успішно проходять (`pnpm test`).
