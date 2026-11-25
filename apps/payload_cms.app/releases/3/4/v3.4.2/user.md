# User Stories & Метрики v3.4.2

## User Stories
- **Як користувач CLI `nan0cms` у зовнішньому проєкті**, я хочу, щоб після встановлення `@nan0web/payload-cms.app` бінарник `nan0cms` (`bin/app.js`) та експорт `./plugin` працювали без помилки `ERR_MODULE_NOT_FOUND` для `src/plugins/withPayload.js`.

## Метрики Виконання
- Початок: 2026-11-25
- Завершення: 2026-11-25
- Цільова версія: v3.4.2
- Статус: Completed ✅

## Журнал Зауважень та Контрактів (Append-Only)
- 2026-11-25: Сформовано паспорт релізу `v3.4.2` та контрактний тест пакування `task.spec.js` + `PackageExports.spec.js`.
- 2026-11-25: Зафіксовано TDD Red (`src/plugins/withPayload.js` відсутній у `npm pack --dry-run`), оновлено `package.json` (`"src/plugins"` у `"files"`, `"version": "3.4.2"`, `"test:all"`).
