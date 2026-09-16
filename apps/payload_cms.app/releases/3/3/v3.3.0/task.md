---
version: 3.3.0
type: feature
status: planning
locale: uk
models: ["TransformModel"]
---

# 🚀 Mission: Трансформація AST Model-as-Schema у JavaScript Payload CMS Конфіги (v3.3.0)

## 🏁 Overview (Огляд)
Розширення AST генератора `TransformModel.js` для виводу чистих JavaScript файлів (`.js`) з JSDoc `@type`, повною відсутністю суфікса `Model` у назвах класів та файлів, підтримкою `static $single = true`, `static $isBlock = true`, `static $upload = true` та `type: 'text/markdown'`.

## 👥 User Stories (Сценарії)
- Як розробник, я хочу писати чисті класи моделей на кшталт `CardBlock` чи `AppMenu` (без суфікса `Model`), щоб конфіг Payload збігався із їх назвами.
- Як розробник, я хочу отримувати згенеровані конфігураційні файли в `.js` з JSDoc `@type`, щоб мати автокомпліт в IDE без TypeScript підготовки.
- Як розробник, я хочу використовувати `static $single`, `static $isBlock` та `static $upload` для автоматичного групування по Globals, Collections та Uploads.

## 🏗 Data-Driven Architecture (Моделювання)
- `TransformModel.js`:
  - Назва класи без суфікса: `CardBlock.js`, `AppMenu.js`, `Attachment.js`
  - Вивід `src/collections/CardBlock.js` та `src/globals/AppMenu.js`
  - Додавання `/** @type {import('payload').CollectionConfig} */` та `@type {import('payload').GlobalConfig}`
  - Підтримка `static $single = true`, `static $isBlock = true`, `static $upload = true`

## 🎯 Scope (Задачі)
- [x] Повне видалення суфікса `Model` з назв класів, файлів та slugs в `TransformModel.js`.
- [x] Зміна розширення вихідних файлів з `.ts` на `.js`.
- [x] Додавання JSDoc типізації `@type {import('payload').CollectionConfig}` та `@type {import('payload').GlobalConfig}`.
- [ ] Додавання генерації Globals для `static $single = true`.
- [ ] Додавання генерації Blocks для `static $isBlock = true`.
- [ ] Додавання генерації Upload Collections для `static $upload = true`.

## ✅ Acceptance Criteria (DoD)
- [ ] Контрактні тести (`task.spec.js`) написані і успішно проходять (Green).
- [ ] Сценарні тести `PayloadCmsApp.story.js` повністю проходять ("зелені").
