# Release v0.2.0 — `nan0vault sign` (`@nan0web/vault`)

## Мета
Обгорнути пайплайн підпису документів (`.md` → `.pdf` + `.pdf.asc`) у CLI `nan0vault sign <file.md>` з каскадною конфігурацією `_.nan0`.

## Критерії прийомки
1. `SignConfigModel` описує `_.nan0` (секція `sign:`) через `Model-as-Schema` (`ImageFile`, `Assets`, `PgpConfig`, `QrConfig`, `output`).
2. `SignApp` успадковує `ModelAsApp` (`@nan0web/ui`), без залежностей від `node:fs` / `node:crypto` у домені.
3. Повідомлення прогресу (`async *run()`) локалізовані через `static UI` та `t()`.
4. `nan0vault sign <file.md>` коректно рендерить `.pdf` (зі збереженням відносних зображень/печаток через `--basedir`) та накладає `.pdf.asc` через `gpg`.
5. Бінарний запис `Buffer` підтримується нативно у `@nan0web/db-fs` (`saveFile` / `saveDocument`).
