# Release v3.6.3 — In-Memory Read Cache in DBFSDoc

## Definition of Done
- [ ] `DBFSDoc.loadDocumentAs()` перевіряє `this.data` перед читанням з диска (ігноруючи маркер інвалідації `false`).
- [ ] `DBFSDoc.loadDocumentAs()` кешує розпарсені текстові/data документи у `this.data` за нормалізованим ключем.
- [ ] `DBFSDoc.saveDocumentAs()`, `saveFile()`, `saveDocument()`, `dropDocument()` узгоджено інвалідують `this.data` (через `_invalidateDataCache` / `false`).
- [ ] Усі тести `release:spec` та `test:all` у `@nan0web/db-fs` проходять.
