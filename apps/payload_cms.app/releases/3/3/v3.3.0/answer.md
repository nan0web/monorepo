Viewed architechnomag.md:1-127
Viewed package.json:1-44
Viewed TransformModel.js:150-265
Viewed TransformModel.js:266-320
Viewed PayloadCollectionTemplate.d.ts:1-59

**АрхіТехноМаг**

> **1.** architechnomag
> **2.** model-as-app
>
> — Мета чату: Аналіз повноти генератора Payload CMS та складання плану для повного покриття схем та демо-додатку
>
> - Прогрес: крок 1 / 1 (v1.0)
>   — Використано ~7,200 токенів з 200,000 (3.6%)
>   — Надано 1 відповідь

Я тобі відповідаю, друже:

Я провів детальний аудит наявного AST генератора `TransformModel.js` та порівняв його зі специфікацією та типами Payload CMS v3 (`CollectionConfig`, `GlobalConfig`, `Block`, `Field`).

Нижче чіткий висновок: **чого зараз не вистачає** і **готовий покроковий план** для нового чату.

---

### 🔍 Чого саме зараз не вистачає до повного покриття Payload CMS

1. **Типи полів (Field Types) Payload CMS, які ще не мапляться**:
   - `row` та `collapsible` (структурні контейнери Payload для групування полів в адмінці).
   - `tabs` (вкладки для розділення контенту, SEO, медіа та налаштувань).
   - `group` (вкладений об'єкт/група полів, наприклад `seo: { title, description, ogImage }`).
   - `point` (геолокація `[longitude, latitude]`).
   - `ui` (кастомні UI-елементи в адмін-панелі).
   - `join` (Payload v3 двосторонні зв'язки / поліморфні зворотні посилання).

2. **Конфігурації колекцій (Collection Level Configs)**:
   - **Auth Collections** (`auth: true`, `auth: { verify, maxLoginAttempts }`): для користувачів системи (`User`), API-ключів тощо.
   - **Versions / Drafts** (`versions: { drafts: true, autosave: true }`): життєво важливо для новин, статей та публікацій.
   - **Timestamps**: явний контроль `timestamps: true / false`.
   - **Custom Hooks**: генерація декларативних хуків (`beforeChange`, `afterChange`, `afterRead`) на основі життєвого циклу Model.
   - **Upload Options**: розширення `upload: { staticDir, imageSizes, mimeTypes }`.

3. **Підтримка повноцінного генератора конфігу всього сайту (`payload.config.js`)**:
   - Зараз ми генеруємо окремі файли колекцій/глобалів/блоків та `collections/index.js`.
   - Немає автоматичного генератора головного `payload.config.js`, який би імпортував усі згенеровані колекції, глобали, блоки та підключав БД-адаптер (`mongooseAdapter` або `postgresAdapter`) і Lexical-редактор.

---

### 🗺️ План робіт для нового чату (Release / Implementation Plan)

Цей план ти можеш скопіювати в новий чат або зберегти як `releases/3/4/v3.4.0/task.md`:

```markdown
# 🚀 Mission: Повне покриття Payload CMS v3 (Auth, Drafts, Groups, Tabs) та Референсний Документаційний Додаток

## 🎯 Етап 1: Розширення генератора схем (TransformModel)

1. **Структурні типи полів**:
   - Підтримка `type: 'group'` (вкладені об'єкти Model).
   - Підтримка `type: 'tabs'` / вкладок адмінки через метадані моделі.
   - Підтримка `type: 'point'` (геолокаційні координати).
2. **Auth & Drafts колекції**:
   - `static $auth = true` ➔ генерація `auth: true` (Users / Admins).
   - `static $drafts = true` ➔ генерація `versions: { drafts: true }`.
3. **Розширені Uploads**:
   - `static $upload = { mimeTypes: [...], imageSizes: [...] }`.
4. **Генерація майстер-конфігу `payload.config.js`**:
   - Автоматичне збирання всіх виявлених Collections, Globals та Blocks в єдиний кореневий конфіг.

## 🏛️ Етап 2: Референсний Документаційний Додаток (Docs & Assets Showcase)

Побудова безпосередньо в `apps/payload_cms.app` (або в прикладі `examples/docs-website`):

1. **Моделі предметної області**:
   - `DocPage` (Колекція статей документації з версіями/чернетками `$drafts = true`, полями `title`, `slug`, `content: 'markdown'`, `group: 'Documentation'`).
   - `DocCategory` (Рубрикатор / дерево категорій документації).
   - `MediaAsset` (`$upload = true`, підтримка PDF, зображень, схем).
   - `SiteConfig` (`$single = true`, глобали для меню, контактів, футера, SEO).
   - `AdminUser` (`$auth = true`, користувачі з ролями).
2. **Контрактні та сценарні тести**:
   - `task.spec.js` на валідацію генерації повного набору (Auth + Drafts + Upload + Globals + master `payload.config.js`).
   - Story-тест експорту та запуску сайту документації.
```

Ти можеш відкривати новий чат з цим планом, і ми почнемо реалізацію з чистого контекстного аркуша!
