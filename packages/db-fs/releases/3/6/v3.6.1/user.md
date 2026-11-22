# User Feedback & Metrics — @nan0web/db-fs v3.6.1

## Метрики Виконання
- Час старту: 2026-11-22 00:59
- Цільова версія: v3.6.1
- Статус: Completed ✅
- Етап: Реліз-патч v3.6.1 готовий (100% Green: `release:spec`, `test:all`, `inspect`)

## Журнал Зауважень та Контрактів (Append-Only)
- 2026-11-22: Старт патч-релізу `v3.6.1` за затвердженим планом (`DBFSDoc.loadDocumentAs` binary check + `async loadBinary(uri)`).
- 2026-11-22: Створено контракт `releases/3/6/v3.6.1/task.spec.js` (TDD Red: 7 нових тестів впали).
- 2026-11-22: Імплементовано `DBFSDoc.BINARY_EXTNAMES`, перевірку бінарних розширень у `loadDocumentAs` (повертає `this.FS.readFileSync(path)`) та метод `async loadBinary(uri, defaultValue, context)`.
- 2026-11-22: Оновлено версію `package.json` до `3.6.1`, пройдено `release:spec` (19/19), `test:all` (`test`, `test:play`, `test:docs`, `build`, `lint`, `knip`, `audit`) та `inspect`.
