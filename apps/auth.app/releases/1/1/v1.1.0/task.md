# Release v1.1.0 — AuthPolicy Contract & App-in-App Middleware

> 🇬🇧 [English](./task.en.md) | 🇺🇦 Українська

## Місія релізу (Scope)
Формалізація `AuthPolicy` як Model-as-Schema для контролю доступу (URL Access Control), та експорт Middleware інтеграції через `src/ui-api/index.js`. Це завершить архітектурний перехід auth.app та вирішить проблему витоку даних і правильної маршрутизації (US-24 - US-37).

## Acceptance Criteria
- `AuthPolicy` правильно визначає захищені (protectedPaths) та публічні (publicPaths) шляхи.
- Glob-маршрутизація підтримує `**` (будь-яка глибина) та `*` (один сегмент).
- Публічні шляхи мають пріоритет над захищеними (public overrides protected).
- `register()` та middleware експортуються як модулі екосистеми з `src/ui-api/index.js`.

## Architecture Audit (Чекліст)
- [x] Чи прочитано Індекси екосистеми?
- [x] Чи існують аналоги в пакетах? (`AccessControl` перевіряє ролі, а `AuthPolicy` робить URL mapping).
- [x] Джерела даних: статична схема (Model-as-Schema).
- [x] Чи відповідає UI-стандарту: AuthPolicy — це Headless модель, без UI прив'язок.
