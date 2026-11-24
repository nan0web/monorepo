# 📊 Метрики та Зворотний Зв'язок — v3.8.0

## Метрики Виконання
- **Версія:** `v3.8.0`
- **Статус:** На доопрацюванні після рев'ю Архітектора (Ітерація 4)
- **Контрактні тести (`releases/3/8/v3.8.0/task.spec.js`):** 8/8 pass (потребують оновлення під канонічний протокол `$db` та `i18n`)
- **Target Files:**
  - `[NEW] apps/share.app/releases/3/8/v3.8.0/task.spec.js`
  - `[MODIFY] apps/share.app/releases/3/8/v3.8.0/user.md`
  - `[NEW] apps/share.app/src/domain/services/MarkdownAstExtractor.js`
  - `[NEW] apps/share.app/src/domain/services/TagLinter.js`
  - `[NEW] apps/share.app/src/domain/services/SemanticStreamRouter.js`
  - `[NEW] apps/share.app/src/domain/commands/ExportCommand.js`
  - `[MODIFY] apps/share.app/src/index.js`

## Історія Ітерацій та Зворотний Зв'язок
- **2026-11-18 (Ітерація 1):** Створено контрактні тести `task.spec.js` (TDD Red) для `MarkdownAstExtractor`, `TagLinter`, `SemanticStreamRouter`, `ExportCommand` та `ShareAppCLI`.
- **2026-11-18 (Ітерація 2):** Первинна реалізація `MarkdownAstExtractor`, `TagLinter`, `SemanticStreamRouter`, `ExportCommand`.
- **2026-11-18 (Ітерація 3):** Перевірено `knip` та запущено `test:all`.
- **2026-11-18 (Ітерація 4 — Зауваження Архітектора на рев'ю `ExportCommand.js`):**
  1. **Надлишковий `type` у `static` схемі (`type: 'string'`, `type: 'boolean'`):** Тип зайвий, якщо є значення `default`, яке однозначно визначає примітивний тип.
  2. **`default: '_.nan0'` та робота з конфігурацією в `@nan0web/db`:** Конфігурація та змінні (`_/`, `_.nan0`) у `@nan0web/db` завантажуються ієрархічно через `db.fetch(uri)` / `db.getGlobals(uri)` або `Directory.isConfig`, а не як окремий «ручний» конфіг-файл із розширенням.
  3. **Галюцинація `normalizeConfigUri` (`.replace(/\.(nan0|ya?ml|json)$/i, '')`):** Кастомне обрізання розширень регекспами є антипатерном — `@nan0web/db` має вбудовані механізми резолву розширень (`DATA_EXTNAMES`, `db.fetch`, `db.loadDocument`, `db.basename(uri, true)`).
  4. **Галюцинація `listAllDocuments(db)` з обходом `db.data.keys()` та `.replace(/^\/+/, '')`:** Порушення протоколу `@nan0web/db`. Канонічний обхід дерева в базі — `db.browse(dir)` / `db.listDir(dir)` / `db.findStream()`.
  5. **Ручна конкатенація та `.replace` у `resolveExportPath`:** Замість ручного різання слешів і префіксів мають використовуватися методи БД (`db.relative(from, to)`, `db.resolveSync(...)`, `db.normalize(...)`, `db.dirname(...)`).
  6. **Відсутність `t()` у `yield show(ExportCommand.UI.missingConfig, 'error')`:** Порушення стандарту мультимовності (`const { t } = this._` → `yield show(t(ExportCommand.UI.missingConfig), 'error')`).
  7. **Відсутність `t()` у `yield show(msg, 'error')`:** Усі UI-повідомлення мають проходити через `t(ExportCommand.UI.key, params)`.
  8. **Антипатерн `.replace('{baseDir}', ...)` замість параметризованого `t()`:** Груба архітектурна помилка (порушення `self-audit-protocol.md` та `model-as-app.md`). Має бути `t(ExportCommand.UI.noFilesFound, { baseDir })`.
  9. **Питання Архітектора щодо системної причини помилок та `nan0inspect`:** Чому запускався лише `inspect:domain`, чому інспектори не заблокували ці антипатерни і як зробити мислення агента детермінованим за шаблонами та рецептами.
