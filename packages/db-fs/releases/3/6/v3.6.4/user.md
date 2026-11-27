# User Log — v3.6.4

- **2026-11-27**: Ініційовано виправлення `DBFSDoc.saveFile()` — відокремлення запису файлу від post-save оновлення кешу та `emit('change')`, логування помилок запису, захист `_invalidateDataCache` для сумісності з різними версіями `@nan0web/db`.
- **2026-11-27**: Реалізовано `_afterSave()` у `DBFSDoc` та безпечний `_invalidateDataCache()` у `DBFSBase`. Пройдено `release:spec` (24/24), `test:all` (`test`, `test:play`, `test:docs`, `build`, `lint`, `knip`, `audit`) та `inspect`.
- **2026-11-27**: Зауваження щодо `pnpm --filter @nan0web/db-fs run inspect`: команда повертає код 0, але `Verification Auditor` має статус `FAIL | Issues found` через 12 попереджень `dbfs_in_test` у тестах самого `@nan0web/db-fs` (`src/**/*.test.js` створюють `new DBFS`, бо тестують саме `DBFS`) та повідомлення про відсутність `snapshots/`.
- **2026-11-27**: Додано `dbfs_in_test` до `skip` у `packages/db-fs/inspect.config.nan0` та зафіксовано задачу в беклозі `packages/inspect/releases/backlog/verification-auditor-skip-checks.md` для коректної обробки `skip` (`dbfs_in_test`, `snapshots`) у `VerificationAuditor`.
