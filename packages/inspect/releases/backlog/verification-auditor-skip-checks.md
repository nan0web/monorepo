# 🛠️ Підтримка `skip` для перевірок `VerificationAuditor` та `dbfs_in_test`

> **Статус:** Planned / Backlog  
> **Пакет:** `@nan0web/inspect`  
> **Компоненти:** `VerificationAuditor`, `JsVerificationAuditor`, `InspectConfig`

---

## 🎯 Проблема та Причини

Під час аудиту `@nan0web/db-fs` (`nan0inspect audit .`) виявлено дві невідповідності в роботі `VerificationAuditor`:

1. **Ігнорування `skip` у `JsVerificationAuditor` (`dbfs_in_test`):**
   - `JsVerificationAuditor.inspectTestFiles()` додає помилку `check: 'dbfs_in_test'` для кожного `*.test.js`, де зустрічається `new DBFS(...)`, не перевіряючи секцію `skip` у `inspect.config.nan0`.
   - У пакеті `@nan0web/db-fs` це створює 12 хибних спрацювань (оскільки тести самого пакета тестують `DBFS`), через що `Verification Auditor` завершується зі статусом `FAIL | Issues found` навіть за наявності `dbfs_in_test` у `skip`.
   - **Рішення:** Поважати `skip` (`dbfs_in_test`) з `inspect.config.nan0` у `VerificationAuditor` / `JsVerificationAuditor` (або автоматично не застосовувати `dbfs_in_test` до пакета `@nan0web/db-fs`).

2. **Ігнорування `skip: [snapshots]` у `VerificationAuditor`:**
   - У `packages/db-fs/inspect.config.nan0` зазначено `skip: [snapshots, exports]`, проте `VerificationAuditor.run()` все одно виконує перевірку `snapshots/` і виводить попередження `No snapshots/ directory found — consider adding snapshot tests`.
   - **Рішення:** Пропускати крок перевірки `snapshots/` у `VerificationAuditor.run()`, якщо `snapshots` вказано у `skip`.

## ✅ Критерії готовності
- [ ] `VerificationAuditor` / `JsVerificationAuditor` враховує `skip` (`snapshots`, `dbfs_in_test`, `test_style` тощо) з `inspect.config.nan0`.
- [ ] `pnpm --filter @nan0web/db-fs run inspect` проходить з `Verification Auditor | OK`.
- [ ] Додано контрактні тести в `packages/inspect/releases/`.
