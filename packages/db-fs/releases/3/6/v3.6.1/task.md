---
version: 3.6.1
type: patch
status: completed
locale: uk
models: ["DBFSDoc", "DBFS"]
---

# 🚀 Mission: Binary Safe Reading & `loadBinary` у `@nan0web/db-fs` (v3.6.1)

## 🏁 Overview (Огляд)

`DBFSDoc.prototype.loadDocumentAs` завжди викликав `this.FS.loadTXT(path, '', true)` (UTF-8 декодування), через що бінарні файли (`.png`, `.jpg`, `.webp`, `.pdf`, `.xlsx` тощо) читалися як текст і псували magic bytes.

Мета патч-релізу `v3.6.1`:
1. Додати в `DBFSDoc` статичний перелік `BINARY_EXTNAMES` та перевірку бінарних розширень у `loadDocumentAs` з поверненням `Buffer` через `this.FS.readFileSync(path)`.
2. Додати публічний метод `async loadBinary(uri, defaultValue = undefined, context = this.context)` у `DBFSDoc`.

---

## 🎯 Scope (Задачі / Definition of Done)

- [x] `DBFSDoc.BINARY_EXTNAMES` містить стандартні бінарні розширення (`.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`, `.xlsx`, `.zip` тощо; `.svg` залишається текстовим).
- [x] `DBFSDoc.prototype.loadDocumentAs` (і `loadDocument`) повертає `Buffer` без пошкодження magic bytes для бінарних розширень (незалежно від регістру).
- [x] `DBFSDoc.prototype.loadBinary(uri, defaultValue, context)` асинхронно читає файл як `Buffer`, підтримує `mount`, `ensureAccess` та `defaultValue`.
- [x] Текстові формати (`.txt`, `.json`, `.nan0`, `.md`, `.svg`) працюють без регресій.
- [x] Оновлено `package.json` до `3.6.1` та згенеровано типи `.d.ts` (`build`).
- [x] Усі перевірки `release:spec`, `test:all` та `inspect` проходять успішно.

## 📂 Target Files

- `[NEW]` `packages/db-fs/releases/3/6/v3.6.1/task.md`
- `[NEW]` `packages/db-fs/releases/3/6/v3.6.1/user.md`
- `[NEW]` `packages/db-fs/releases/3/6/v3.6.1/task.spec.js`
- `[MODIFY]` `packages/db-fs/src/DBFS/parts/DBFSDoc.js`
- `[MODIFY]` `packages/db-fs/package.json`
