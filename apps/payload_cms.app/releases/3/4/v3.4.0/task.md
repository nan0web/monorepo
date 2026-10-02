---
version: 3.4.0
type: feature
status: done
locale: uk
models: ["TransformModel", "payload.config.js"]
---

# 🚀 Mission: Повне покриття Payload CMS v3 (Auth, Drafts, Groups, Tabs) та Референсний Документаційний Додаток

## 🎯 Етап 1: Розширення генератора схем (TransformModel)

1. **Структурні типи полів**:
   - [x] Підтримка `type: 'group'` (вкладені об'єкти Model).
   - [x] Підтримка `type: 'tabs'` / вкладок адмінки через метадані моделі.
   - [x] Підтримка `type: 'point'` (геолокаційні координати).
2. **Auth & Drafts колекції**:
   - [x] `static $auth = true` ➔ генерація `auth: true` (Users / Admins).
   - [x] `static $drafts = true` ➔ генерація `versions: { drafts: true }`.
3. **Розширені Uploads**:
   - [x] `static $upload = { mimeTypes: [...], imageSizes: [...] }`.
4. **Генерація майстер-конфігу `payload.config.js`**:
   - [x] Автоматичне збирання всіх виявлених Collections, Globals та Blocks в єдиний кореневий конфіг.

## 🏛️ Етап 2: Референсний Документаційний Додаток (Docs & Assets Showcase)

Побудова безпосередньо в `apps/payload_cms.app`:

1. **Моделі предметної області**:
   - [x] `DocPage` (Колекція статей документації з версіями/чернетками `$drafts = true`, полями `title`, `slug`, `content: 'markdown'`, `group: 'Documentation'`).
   - [x] `DocCategory` (Рубрикатор / дерево категорій документації).
   - [x] `MediaAsset` (`$upload = true`, підтримка PDF, зображень, схем).
   - [x] `SiteConfig` (`$single = true`, глобали для меню, контактів, футера, SEO).
   - [x] `AdminUser` (`$auth = true`, користувачі з ролями).
2. **Контрактні та сценарні тести**:
   - [x] `task.spec.js` на валідацію генерації повного набору (Auth + Drafts + Upload + Globals + master `payload.config.js`).
   - [x] Story-тест експорту та запуску сайту документації.
