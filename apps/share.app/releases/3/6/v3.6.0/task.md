---
version: 3.6.0
type: refactor
status: completed
locale: uk
models:
  - VideoPipelineCommand
  - WhisperTranscriptionService
  - ArticlePipelineService
  - PipelineAuditService
  - CutMapGenerator
---

# 🛡️ Mission: Domain Hygiene, Zero-FS & Inspector Automation (v3.6.0)

## 🏁 Overview (Огляд)

Реліз v3.6.0 присвячений архітектурній чистоті та усуненню антипатернів у `apps/share.app`:
1. **Zero-FS у домені (Rule 8 & model-as-app.md):**
   - Усунення прямого імпорту `node:fs` та `node:path` у доменних класах (`WhisperTranscriptionService.js`, `ArticlePipelineService.js`, `PipelineAuditService.js`, `CutMapGenerator.js`, `DomainContextResolver.js`).
   - Переведення збереження транскриптів, згенерованих публікацій, аудіту та мап на інжектовану базу даних `this.$db` / `@nan0web/db`.
2. **Strict i18n & Model-as-Schema UI (Zero-Hardcode):**
   - Усі користувацькі повідомлення конвеєра (`yield show(...)`, `yield progress(...)`) виносяться виключно у `static UI` відповідних моделей/команд.
   - Словники `data/uk/_/t.nan0` та `data/index.nan0` синхронізуються без пропущених ключів.
3. **Автоматична інспекція (Inspector Discovery & Dependency-Driven Auditing):**
   - Налаштування детекції інспекторів за наявністю залежностей у `package.json`:
     - Наявність `@nan0web/i18n` активує валідатор ключів та словників.
     - Наявність `src/domain/` активує валідацію `JsDomainAuditor` із забороною імпортів `node:fs`/`node:path`.
4. **QuickTime Compatibility & Production Validation:**
   - Повна верифікація згенерованого `stitched.mp4` на сумісність із macOS QuickTime Player (`-pix_fmt yuv420p`).

## 👥 User Stories (Сценарії)

- Як розробник платформи, я хочу, щоб команда `pnpm test:all` та інспектори автоматично виявляли будь-які спроби затягнути сирий `fs` у доменні класи або залишити неперекладені текстові рядки.
- Як користувач macOS, я хочу відкривати нарізані та зшиті відеофайли `stitched.mp4` у стандартному QuickTime Player без системних помилок сумісності кодеків.

## 🎯 Scope (Задачі)

1. Створити контрактний тест `releases/3/6/v3.6.0/task.spec.js`.
2. Рефакторинг `WhisperTranscriptionService.js` — робота через `$db` замість `fs.writeFileSync` / `fs.readFileSync`.
3. Рефакторинг `PipelineAuditService.js` та `ArticlePipelineService.js` — перехід на `$db`.
4. Синхронізація всіх повідомлень у `static UI` та `data/uk/_/t.nan0`.
5. Додати перевірку заборони `node:fs` у `JsDomainAuditor` (`@nan0web/inspect`).
6. Підключення валідатора i18n за наявністю залежності `@nan0web/i18n`.

## ✅ Acceptance Criteria (Критерії прийомки)

- [x] Цільові доменні сервіси (`WhisperTranscriptionService`, `PipelineAuditService`, `ArticlePipelineService`, `DomainContextResolver`) не містять прямих імпортів `node:fs` або `node:path`.
- [x] `JsDomainAuditor` у `@nan0web/inspect` оснащено детекцією сирих імпортів `node:fs`/`node:path` у домені з тестами (88/88 Green).
- [x] Підключено `nan0inspect` та `@nan0web/i18n` у `apps/share.app/package.json` (`inspect:domain`, `inspect`).
- [x] Усі повідомлення конвеєра беруться з `static UI` та мають відповідники в `data/uk/_/t.nan0` (`i18n audit` 100% OK).
- [x] Контрактні тести `releases/3/6/v3.6.0/task.spec.js` 100% Green (240/240 passed).
