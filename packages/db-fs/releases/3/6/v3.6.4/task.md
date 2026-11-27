---
version: 3.6.4
type: patch
status: done
locale: uk
createdAt: 2026-11-27T12:10:00+02:00
---

# 🐛 Виправлення `DBFSDoc.saveFile()` — не глушити помилки та не повертати `false` після успішного запису

## Контекст проблеми
Під час синхронізації великих медіафайлів (`Statut_12052026.pdf`, `13195200` байт) через `bootstrapApp` (`@nan0web/ui-cli`) метод `DBFS.saveFile(uri, buf)` реально записав файл на диск (`existsAfter=true`), але повернув `false`.

Причина в `src/DBFS/parts/DBFSDoc.js` (рядки 279–293):
1. Весь блок — `this.FS.writeFile(path, content)` і post-save операції (`statDocument`, `this.meta.set`, `this._invalidateDataCache`, `this.data.set`, `this.emit('change')`) — загорнутий в один `try { ... } catch (e) { return false }`.
2. Будь-яка помилка в post-save кроках (наприклад, у `_invalidateDataCache` чи підписнику `change`) повністю глушиться без логування і змушує `saveFile()` повернути `false`, хоча файл уже записаний на диск.

## 🎯 Definition of Done
- [x] Логіка запису (`FS.writeFile` / `FS.saveAsync`) відокремлена від post-save оновлення кешу та `emit('change')`.
- [x] Помилки запису не глушаться мовчки (`this.console.error(e)` або виняток), а post-save інвалідація кешу не ламає повернення `true` після успішного запису на диск.
- [x] Перевірено сумісність `_invalidateDataCache` у `DBFS` із різними версіями `@nan0web/db` (зокрема, коли `_fetchCache` / `_inheritanceCache` можуть бути відсутні або вкладені).
- [x] Додано контрактний тест у `releases/3/6/v3.6.4/task.spec.js` для `saveFile()` з бінарним `Buffer` через `bootstrapApp` / `DB.mount`.
