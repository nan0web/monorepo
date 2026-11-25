---
version: 3.4.1
type: patch
status: done
locale: uk
models: ["MediaVerifyModel", "mediaUtils"]
---

# 🛠️ Реліз v3.4.1 — Точність `isThumbnail` та локалізація звіту `MediaVerifyModel`

## Мета
Усунути хибне відсіювання реальних медіафайлів за суфіксами розмірів у `isThumbnail` та додати підтримку української локалізації (`locale: 'uk'`) у `MediaVerifyModel.generateMarkdownReport` за стандартом `@nan0web/i18n` (без хардкоду перекладів у JS).

## Задачі
- [x] Додати контрактні тести у `releases/3/4/v3.4.1/task.spec.js` (TDD Red) для `isThumbnail` та `MediaVerifyModel.generateMarkdownReport(..., { locale: 'uk' })`.
- [x] Створити файли словників `@nan0web/i18n`: `data/_/t.nan0` (базові ключі) та `data/uk/_/t.nan0` (український переклад усіх рядків звіту).
- [x] Оновити `isThumbnail` у `src/domain/utils/mediaUtils.js`: прибрати суфікси `small|medium|large|\d+x\d+`, залишити лише директорії `thumb|thumbs|thumbnails|mini|cache`, `@`-префікси мініатюр та суфікси `[-_](thumb|thumbnail|mini|preview)$`.
- [x] Оновити `generateMarkdownReport(auditResult, options = {})` у `src/domain/models/MediaVerifyModel.js`: перевести рядки на `t()` (`@nan0web/i18n`) та підтримати `options.locale` (`'uk'`) і `options.t`.
- [x] Додати регресійні тести у `src/test/MediaMigration.test.js`.
- [x] Пройти перевірку тестів (`pnpm --filter @nan0web/payload-cms.app run test`) та оновити версію в `package.json` до `3.4.1`.

## Target Files
- `apps/payload_cms.app/releases/3/4/v3.4.1/task.md`
- `apps/payload_cms.app/releases/3/4/v3.4.1/task.spec.js`
- `apps/payload_cms.app/releases/3/4/v3.4.1/user.md`
- `apps/payload_cms.app/data/_/t.nan0`
- `apps/payload_cms.app/data/uk/_/t.nan0`
- `apps/payload_cms.app/src/domain/utils/mediaUtils.js`
- `apps/payload_cms.app/src/domain/models/MediaVerifyModel.js`
- `apps/payload_cms.app/src/index.js`
- `apps/payload_cms.app/src/test/MediaMigration.test.js`
- `apps/payload_cms.app/package.json`
