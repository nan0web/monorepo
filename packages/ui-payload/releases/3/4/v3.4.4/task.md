---
version: 3.4.4
type: patch
status: completed
locale: uk
models: ["PayloadCollectionTemplate"]
---

# 🚀 Реліз v3.4.4: Full Architectural Compliance & Pure Named Exports у @nan0web/ui-payload

## 🏁 Огляд (Overview)
Реліз v3.4.4 приводить пакет `@nan0web/ui-payload` до 100% відповідності правилам архітектурного аудиту (`nan0inspect audit .`):
- **Чисті іменовані експорти (JsExportAuditor)**: усунено заборонені дефолтні експорти (`export default prohibited`) у модулях `fromNan0Html.js`, `toNan0Html.js`, `Nan0HTMLFeature.js` та `src/richtext/index.js`.
- **Чиста спадковість шаблонів (JsDomainAuditor)**: клас `PayloadCollectionTemplate` переведено на наслідування від `CodeTemplate` замість прямого `Model`, що усуває порушення розміщення моделей за межами `domain/`.
- **Синхронізація типів**: оновлено відповідні файли визначень TypeScript `.d.ts`.

## 👥 Сценарії (User Stories)
- Як розробник, я можу імпортувати `fromNan0Html`, `toNan0Html`, `FORMAT`, `inventoryNan0Html` через чисті іменовані експорти без побічних ефектів дефолтного експорту.
- Як архітектор, я отримую статус 100% OK за всіма 7 аудиторами `nan0inspect` без будь-яких порушень структури або гігієни.

## 🎯 Сфера робіт (Scope)
- [x] Оновити `src/richtext/index.js` з іменованими експортами `fromNan0Html` та `toNan0Html`.
- [x] Оновити `PayloadCollectionTemplate` для наслідування від `CodeTemplate`.
- [x] Оновити типи в `types/`.
- [x] Контрактний тест `releases/3/4/v3.4.4/task.spec.js`.
- [x] Регресійний тест `src/test/releases/3/4/v3.4.4/task.test.js`.
- [x] Оновлення `package.json` до версії `3.4.4`.
