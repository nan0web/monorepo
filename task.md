# 🏗️ Task: v3.1.0 Sovereign Monorepo Stabilization

- [x] Виправити `ERR_MODULE_NOT_FOUND` у `SyncDocsScenario.test.js` (наслідки міграції /src)
- [x] Оновити очікування рендерингу HTML у `runner.test.js`
- [x] Відновити імпорт `ProjectModel` у `bin/project-validator.js` (переїзд у @nan0web/core)
- [x] Виправити ініціалізацію `ProjectModel` (spread metadata) у валідаторі
- [x] Додати ESM CLI guard (`import.meta.url`) у `bin/project-validator.js`
- [x] Усунути стан гонитви (race condition) у тестах `AppLogger` (`Runner.story.js`)
- [x] Додати відсутні залежності у корінь `package.json` (`core`, `inspect`, `co`)
- [x] Підтвердити стабільність `packages/ui/src/domain/migration.test.js`

---
[English Version (task.en.md)](./task.en.md) | [Українська версія (task.md)](./task.md)
