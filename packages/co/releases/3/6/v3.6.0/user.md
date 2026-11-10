# Журнал Релізу: v3.6.0

## Метрики Виконання
- **Дата старту:** 2026-11-10
- **Ітерацій:** 2
- **Тестів:** 100% Green (70 unit tests + 30 release contract tests + 18 doc tests + 1 play test)
- **Стан регресії:** Повний прохід `test:all` та `test:release`. Всі типи TypeScript згенеровано (`types/domain/*.d.ts`).

## Журнал Змін
- **Архітектура:** Реалізовано та оновлено Фрактал Семи (7i) веб-моделей у ядрі `@nan0web/co` (Data-driven, Zero Runtime Dependencies):
  1. `Identity.js` (`extends Model`): `id`/`did`, `type` (`person | org | site`), `title` / `name`, `role`, `declaration`, `avatar`, `endpoints: Contact[]` (автопарсинг з URI), `wallets`, `credentials`, `public_keys`.
  2. `Connection.js` (`extends Model`): `id`, `title`, `context` (`navigation | category | relation`), `role` (`header | footer | topic | partner`), `target_did`, `items: array` (ієрархічні підпункти навігації).
  3. `Post.js` (`extends Chat` -> `Message`): `id`, `type` (`page | post | news | doc | case`), `title`, `excerpt`, `body`, `time`, `status` (`draft | plan | live | archived | deleted`), `authors: Contact[]` (з гетером `author`), `tags`, `media: string[] | Media[]`, `next: Chat`.
  4. `Media.js` (`extends Model`): `id`, `url`, `mime` (автоматична деривація `type` через `mime.split('/')[0]`), `caption`, `filesize`, `dimensions: { width, height }`.
  5. `Interaction.js` (`extends Message`): `id`, `type` (`intake | order | contact | feedback | vote`), `title`, `status` (`new | pending | processing | resolved | rejected | spam | archived`), `time`, `sender: Contact` (автопарсинг URI), `body`, `payload`.
  6. `Good.js` (`extends Interaction`): нова онтологія цінності (`product | service | tariff | program`), `title`, `excerpt`, `body`, `currency`, `price`, `features`, `documents`.
  7. `Event.js` (`extends Interaction`): онтологія простору-часу (`location | branch | event | milestone | hearing`), `title`, `location`, `coordinates: { lat, lng }`, `starts_at: Date`, `ends_at: Date`, `contacts: Contact[]`.
- **Експорти:**
  - `src/domain/index.js`: експортовано всі 7i моделі разом з `Good`.
  - `src/index.js`: ре-експортовано всі 7i моделі на кореневий рівень пакета.
- **Типізація:** Згенеровано оновлені типи `types/**/*.d.ts` через `tsc`.
- **Контрактні тести:** Створено вичерпний набір тестів у `releases/3/6/v3.6.0/task.spec.js` (100% Green).
