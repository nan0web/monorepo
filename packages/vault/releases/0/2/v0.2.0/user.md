# Зауваження Архітектора (v0.2.0)

- Конфігурація у `_.nan0` (секція `sign:`), вкладені структури (`Assets`, `ImageFile`, `PgpConfig`, `QrConfig`) описуються окремими класами `Model`, без ручного `mergeDeep` (використовувати `merge` з `@nan0web/types`).
- `SignApp` успадковує `ModelAsApp` з `@nan0web/ui`, без прямого `node:crypto` у домені та без ручного перевизначення `this.$db`.
- Усі UI-повідомлення кроків (`async *run()`) прописуються в `static UI` і викликаються через `t()`.
- Бінарні файли (`Buffer` / `Uint8Array`) зберігаються нативно через `@nan0web/db-fs` (`saveFile` / `saveDocument`), без обгорток `writeFileSync` у CLI.
- Для рендерингу локальних зображень/печаток у `md-to-pdf` передається `--basedir` директорії вихідного `.md`.
