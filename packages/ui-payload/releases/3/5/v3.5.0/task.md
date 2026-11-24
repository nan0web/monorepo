---
version: 3.5.0
type: minor
status: completed
locale: uk
models: ["CollectionBuilder"]
---

# 🚀 Реліз v3.5.0 — CollectionBuilder: Model-as-Schema to Payload CollectionConfig

## Мета
Перенести базовий runtime-транслятор `CollectionBuilder` (`buildCollection`, `buildCollectionsFromModels`) у `@nan0web/ui-payload` як єдине джерело правди для конвертації моделей `@nan0web/types` у `CollectionConfig` Payload CMS.

## Задачі
- [x] Створити `src/domain/CollectionBuilder.js` без хардкоду (читає `def.model`, `def.options`, `def.admin`, `def.type`, `def.required`, `def.default`).
- [x] Експортувати `CollectionBuilder` та `buildCollectionsFromModels` з `src/index.js` та `src/domain/index.js`.
- [x] Забезпечити підтримку `row` для мета-полів (`slug`, `type`, `status`, `currency`) та дат (`starts_at`, `ends_at`), `group` для `object`, `array` для `array` (з рекурсією по `def.model`), `select` для `def.options`, `richText` з передачею `options.editor`.
- [x] Перенести контрактний тест у регресійний `src/test/releases/3/5/v3.5.0/task.test.js`.
- [x] Усунути попередження `nan0inspect` (`PayloadApp.js`, `SeedModel.js`) та `knip` (`nan0html-converter.spec.js`, `knip.json`).
- [x] Оновити `package.json` до версії `3.5.0`.

## Target Files
- `packages/ui-payload/src/domain/CollectionBuilder.js`
- `packages/ui-payload/src/domain/index.js`
- `packages/ui-payload/src/index.js`
- `packages/ui-payload/src/test/releases/3/5/v3.5.0/task.test.js`
- `packages/ui-payload/src/domain/PayloadApp.js`
- `packages/ui-payload/src/domain/SeedModel.js`
- `packages/ui-payload/src/richtext/nan0html-converter.spec.js`
- `packages/ui-payload/knip.json`
- `packages/ui-payload/package.json`
