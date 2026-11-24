# User Stories & Метрики v3.5.0

## User Stories
- **Як розробник платформи**, я хочу імпортувати `CollectionBuilder` та `buildCollectionsFromModels` з `@nan0web/ui-payload`, щоб не дублювати логіку трансляції моделей у кожному пакеті чи додатку.
- **Як контент-менеджер у Payload CMS**, я хочу бачити нативні форми (`group`, `array`, `select`, `date` з `dayAndTime`, `row` для компактних полів, `richText` з тулбаром), згенеровані автоматично з декларації моделі.

## Метрики Виконання
- Початок: 2026-11-13
- Завершення: 2026-11-24
- Цільова версія: v3.5.0
- Статус: Completed ✅
- Етап: 100% Green, регресійні тести (`task.test.js`) пройдені, `nan0inspect` та `knip` без зауважень

## Журнал Зауважень та Контрактів (Append-Only)
- 2026-11-13: Підготовлено паспорт релізу `v3.5.0` та цілі для `CollectionBuilder`.
- 2026-11-18: Реалізовано `CollectionBuilder.js`, експорти та регресійний тест `src/test/releases/3/5/v3.5.0/task.test.js`.
- 2026-11-24: Усунено попередження `nan0inspect` (JSDoc у `PayloadApp.js`, `SeedModel.js`) та `knip` (`nan0html-converter.spec.js` переведено на `node:test`, оновлено `knip.json`), оновлено `package.json` до `3.5.0` і закрито реліз `v3.5.0`.
