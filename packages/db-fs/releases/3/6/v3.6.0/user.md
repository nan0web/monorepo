# User Feedback & Metrics — @nan0web/db-fs v3.6.0

## Метрики Виконання
- Час старту: 2026-10-10 11:00
- Час завершення: 2026-10-10 11:35
- Цільова версія: v3.6.0
- Статус: Completed ✅
- Етап: Етап 2 та 3 завершено (100% Green, release:spec та test:all пройдені)

## Журнал Зауважень та Контрактів (Append-Only)
- 2026-10-10: Старт сесії виконання цілі `packages/db-fs/releases/3/6/v3.6.0/task.md` (Base36 Transparent Sharding & Safe URI Mapping).
- 2026-10-10: Створено контракт `releases/3/6/v3.6.0/task.spec.js` для валідації `resolveShardedSegment`, 1296 кошиків (2 символи `[a-z0-9]`), безпечного мапінгу `:` -> `~`, прозорого читання/запису (`loadDocument`, `saveDocument`, `statDocument`, `saveFile`, `dropDocument`) та розмаскування директорій у `listDir` і `findStream`.
- 2026-10-10: Імплементовано методи `resolveShardedSegment`, `unshardSegment`, `isShardBucket`, `unshardPath`, `shardUri` у `DBFSPath.js`.
- 2026-10-10: Оновлено `DBFSDir.js` для прозорого обходу шардованих бакетів та unmasking ідентифікаторів у `listDir()`.
- 2026-10-10: Додано експорти в `packages/db-fs/src/index.js` (`DBFSBase`, `DBFSPath`, `DBFSDoc`, `DBFSDir`, `DBFSStream`).
- 2026-10-10: Синхронізовано SSG-паритет у `@nan0web/db-browser` (`resolveShardedSegment`, `unshardSegment`, `shardUri`).
- 2026-10-10: Перевірено та підтверджено специфікацію бакету (2 символи Base36 `[a-z0-9]`, $36^2 = 1296$).
- 2026-10-10: Успішно мігровано контракт у регресійний тест `src/test/releases/3/6/v3.6.0/task.test.js`.
