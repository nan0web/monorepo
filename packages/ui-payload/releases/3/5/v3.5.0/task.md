# v3.5.0 — CollectionBuilder: Model-as-Schema to Payload CollectionConfig

## Мета
Перенести базовий runtime-транслятор `CollectionBuilder` (`buildCollection`, `buildCollectionsFromModels`) у `@nan0web/ui-payload` як єдине джерело правди для конвертації моделей `@nan0web/types` у `CollectionConfig` Payload CMS.

## Задачі
1. Створити `src/domain/CollectionBuilder.js` без хардкоду (читає `def.model`, `def.options`, `def.admin`, `def.type`, `def.required`, `def.default`).
2. Експортувати `CollectionBuilder` та `buildCollectionsFromModels` з `src/index.js` та `src/domain/index.js`.
3. Забезпечити підтримку `row` для мета-полів (`slug`, `type`, `status`, `currency`) та дат (`starts_at`, `ends_at`), `group` для `object`, `array` для `array` (з рекурсією по `def.model`), `select` для `def.options`, `richText` з передачею `options.editor`.

## Target Files
- `packages/ui-payload/src/domain/CollectionBuilder.js`
- `packages/ui-payload/src/domain/index.js`
- `packages/ui-payload/src/index.js`
- `packages/ui-payload/releases/3/5/v3.5.0/task.spec.js`
