---
version: 3.4.2
type: fix
status: done
locale: uk
models: ["ImageCell", "BooleanCell", "MapCell", "Nan0HTMLFeature", "PayloadCollectionTemplate"]
---

# 🚀 Mission: Clean Server/Client Exports у @nan0web/ui-payload (v3.4.2)

## 🏁 Overview (Огляд)
Усунення падіння Node.js сервера при імпорті `@nan0web/ui-payload` через наявність нескомпільованих `.jsx` імпортів у кореневому `src/index.js`.
Розділення експортів на чисті серверні функції (`Nan0HTMLFeature`, `fromNan0Html`, `accessFor`, `publicAccess`) та сумісні клієнтські/компонентні експорти без сирих JSX розширень у серверному середовищі.

## 👥 User Stories (Сценарії)
- Як розробник CLI / Seed / SSR у Payload CMS, я можу робити `import { accessFor, publicAccess } from '@nan0web/ui-payload'` або `import from '@nan0web/ui-payload'` у середовищі чистого Node.js ESM без помилки `Cannot find module ImageCell.js`.
- Як розробник UI / Admin у Payload CMS, я можу імпортувати клієнтські клітинки таблиць (`ImageCell`, `BooleanCell`, `MapCell`) через `@nan0web/ui-payload/components/*` або клієнтський барель.

## 🎯 Scope (Задачі)
- [x] Очистити `src/index.js` від сирих JSX імпортів на стороні чистого Node.js runtime.
- [x] Налаштувати коректні subpath-експорти компонентів (`./components/* -> ./src/components/*.jsx`) у `package.json`.
- [x] Оновити `package.json` версію до `3.4.2`.
- [x] Згенерувати оновлені типи (`pnpm run build` -> `tsc`).
- [x] Додати i18n підтримку для повідомлень про помилки в `PayloadApp.js` (`errorNoPayloadOrConfig`).
- [x] Написати контрактні тести в `releases/3/4/v3.4.2/task.spec.js` і досягти 100% Green.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести (`task.spec.js`) успішно проходять у чистій `node --test`.
- [x] `import('@nan0web/ui-payload')` успішно резолвиться в чистому Node.js без підключення `tsx` чи бандлерів.
- [x] `pnpm --filter @nan0web/ui-payload test:all` повністю зелений.

