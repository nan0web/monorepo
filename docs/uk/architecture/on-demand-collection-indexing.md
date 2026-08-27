# 🏛️ Архітектура: Автоматична Структурна Індексація Колекцій та Сутностей у `@nan0web/db` / `@nan0web/db-browser`

## 🎯 1. Системний підхід: Нуль Хардкоду (Zero-Hardcode Entity Indexing)

Система працює **декларативно та поліморфно** на рівні ядра фреймворку `@nan0web/db`.

### 📌 Як це функціонує в архітектурі:

1. **Ієрархічна Колекція зі Слігами (Nested Slugs & Collections)**:
   - Колекція може мати довільну глибину вкладеності (слігів):
     - `public/data/{locale}/cards/`
     - `public/data/{locale}/private/cards/` (приватні карткові продукти)
     - `public/data/{locale}/corporate/credits/` (кредити для бізнесу)
     - `public/data/{locale}/private/deposits/`
     - `public/data/{locale}/news/`
   - Кожна підпапка є повноцінною ізольованою директорією даних. Будь-який новий розділ чи підколекція автоматично підхоплюється ядром.

2. **Компактний текстовий формат індексів (`index.txt` / `index.txtl`)**:
   - Замість важкого JSON використовується системний нативний формат `DirectoryIndex`:
     - **`index.txt`** — плоский компактний текстовий список безпосередніх дітей директорії:
       ```text
       card-1.json 10fgh7a 1a4
       card-2.json 10fgh8b 2b1
       ```
       - **Колонки:** `name`, `mtimeMs.36`, `size.36` (або `.62`)
       - **Формат кодування чисел (Base36 vs Base62):**
         - `mtimeMs.36` — стандартний `Date.now().toString(36)` -> `kqm3e9c0` (8 символів `0-9, a-z`).
         - `mtimeMs.62` (Base62: `0-9, a-z, A-Z`) — кастомний `encodeBase62(Date.now())` -> лише 6-7 символів (наприклад, `1aX9K`).
         - `size.36` / `size.62` — розмір файлу у байтах.
         - *Чому Base62 кращий за Base64 для чисел:* Base62 не потребує спецсимволів (`+`, `/`, `=`), не ламає URL/шляхи та розбиття по пробілах `line.split(' ')`.
     - **`index.txtl`** — ієрархічний повний індекс дерева для всього кореня або глибоких підпапок.
   - `DirectoryIndex.generateAllIndexes(db)` автоматично генерує `index.txt` у кожній директорії/колекції зі слігами.

3. **On-Demand читання сутностей у `@nan0web/db-browser`**:
   - UI сторінки чи віджети зв'язуються зі своїм шляхом колекції (включно зі слігом):
     ```javascript
     // Автоматичне отримання списку файлів колекції за шляхом:
     const entries = await db.readDir('/data/uk/private/cards/')
     
     // Або пряме завантаження DirectoryIndex:
     const index = await db.loadIndex('/data/uk/private/cards/')
     ```
   - Завантажується **лише один ультракомпактний файл `index.txt`** (~300–800 байт), парситься на льоту в `DirectoryIndex.decode(text)` і кешується в `BrowserStore`.

4. **Системний `HeadSyncManager` для активних колекцій**:
   - `HeadSyncManager` відслідковує активний шлях (наприклад, `HEAD /data/uk/private/cards/index.txt`).
   - Якщо `ETag` або `Last-Modified` файлу `index.txt` змінився — оновлюються лише документи цієї конкретної колекції.

---

## 2. 🏗️ Схема: Універсальна Структура Директорій

```
📁 public/data/uk/
   ├── 📁 private/
   │   ├── index.txt          <-- Індекс підрозділу private/
   │   ├── 📁 cards/
   │   │   ├── index.txt      <-- Компактний індекс карток (~300 B)
   │   │   ├── standard.json
   │   │   └── premium.json
   │   └── 📁 deposits/
   │       ├── index.txt      <-- Компактний індекс депозитів
   │       └── classic.json
   └── 📁 corporate/
       ├── index.txt          <-- Індекс підрозділу corporate/
       └── 📁 credits/
           ├── index.txt      <-- Компактний індекс бізнес-кредитів
           └── agro.json
```

---

## 3. 📋 Поетапний План Реалізації (Розподіл по Сесіях)

### Сесія 1: Автоматична генерація `index.txt` у `sync-data.js`
- [ ] Оновити `sync-data.js` для виклику `DirectoryIndex.generateAllIndexes(db)` по всій структурі `data/`.
- [ ] Переконатися, що кожна папка будь-якої глибини (`uk/private/cards/`, `uk/corporate/credits/`) отримує власний валідний `index.txt`.

### Сесія 2: Універсальна інтеграція `@nan0web/db-browser` на фронтенді
- [ ] Забезпечити розпізнавання та декодування `index.txt` у `@nan0web/db-browser` під час виклику `db.readDir('/data/{locale}/{slug}/')`.
- [ ] Налаштувати реактивний хук вибірки даних для UI за шляхом слігу.

### Сесія 3: `HeadSyncManager` та сценарні тести (`*.story.js`)
- [ ] Реалізувати легкий `HeadSyncManager` для активного шляху колекції (`HEAD .../index.txt`).
- [ ] Написати сценарний тест `HeadSyncManager.story.js` з перевіркою кешування та оновлення по ETag.
