---
version: 3.6.0
type: minor
status: sealed
locale: uk
models: ['ReleaseModel', 'ReleaseAuditor', 'ValidateCommand', 'ExampleCommand', 'InitCommand']
---

# 🚀 Release v3.6.0: Canonical Release Example, Flexible Auditor & Target Resolution

## 🏁 Overview (Огляд)
Реліз фокусується на вдосконаленні екосистеми `@nan0web/release` (CLI `dilo` / `nan0release`):
1. Створення команди `dilo example` для перегляду та експорту 100% еталонного шаблону релізу (тріади `task.md`, `user.md`, `task.spec.js`).
2. Оновлення команди `dilo init vX.Y.Z`, щоб вона генерувала повноцінний валідний шаблон, який гарантовано проходить валідацію на 100%.
3. Виправлення визначення кореня проєкту в `ValidateCommand.js` при валідації папок `releases` чи конкретного релізу (пошук `package.json` вище по дереву каталогів).
4. Пом'якшення та адаптивність валідатора метрик у `ReleaseAuditor.js` (підтримка різноманітних варіантів запису годин, ітерацій та оцінки RRS в `user.md` та frontmatter).
17: 5. **Розширення масок контрактних тестів у `ReleaseAuditor.js` та CloseCommand**:
18:    - `src/tests/releases/` (канонічний правильний шлях) — статус **🟢 OK / Sealed**.
19:    - `src/test/releases/` (однина) — статус **⚠️ WARN** (тест зараховується, але рекомендується мігрувати до `src/tests/releases/`).
20:    - `src/releases/` (помилка архітектури: забруднення продуктового каталогу `src/`) — статус **❌ ERROR** з вимогою перенесення у `src/tests/releases/`.
21:    - Оновлення `CloseCommand.js` для перенесення закритих тестів виключно у `src/tests/releases/`.
22: 6. **Smart Dispatcher у CLI (`ReleaseApp`)**:
23:    - При виклику `dilo releases/` або `dilo <шлях>` без вказання підкоманди: автоматично направляти на підкоманду `validate <шлях>` замість мовчазного завершення.
24:    - При невідомій команді (не шлях і не команда): виводити інформативну помилку та `generateHelp()`.

## 👥 User Stories (Сценарії Користувача)
- **US-1 (Еталонний приклад):** Як архітектор та розробник, я хочу викликати `dilo example` і бачити або вивантажувати канонічний зразок релізу з коректним frontmatter, секціями, контрактним тестом та метриками.
- **US-2 (Якісний Init):** Як розробник, я хочу виконати `dilo init v0.5.0` і отримати файли релізу, які одразу є валідними з точки зору `dilo validate`.
- **US-3 (Гнучкий резолв проєкту):** Як користувач, я хочу мати можливість виконати `dilo validate releases` або `dilo validate releases/0/5/v0.5.0` без хибної помилки `MISSING_PACKAGE_JSON`.
- **US-4 (Розумний аудит метрик):** Як розробник, я хочу, щоб `ReleaseAuditor` коректно зчитував метрики з `user.md` навіть при варіативних формулюваннях (наприклад: `Час роботи`, `Годин`, `Hours`, `Ітерацій`, `RRS`).
- **US-5 (Універсальні контракти та регресія):** Як інженер, я хочу, щоб аудітор бачив не тільки `task.spec.js`, але й `*.test.js`, `*.story.js`, а також закриті тести у `src/tests/releases/` (OK), `src/releases/` (OK) та видавав попередження WARN для `src/test/releases/`.
- **US-6 (Інтуїтивний запуск CLI):** Як користувач, я хочу виконати `dilo releases/` або `dilo packages/release` і бачити валідацію цього шляху, або зрозумілий help з переліком команд при хибному вводі.

## 🎯 Target Files
- `packages/release/src/domain/ExampleCommand.js`
- `packages/release/src/domain/InitCommand.js`
- `packages/release/src/domain/ValidateCommand.js`
- `packages/release/src/domain/inspect/ReleaseAuditor.js`
- `packages/release/src/domain/Dashboard/ReleaseParser.js`
- `packages/release/src/domain/App.js`
- `apps/release.app/src/domain/app/ReleaseApp.js`
- `packages/release/releases/3/6/v3.6.0/task.spec.js`

## 📋 Завдання (Tasks)
- [x] [task-1] Реалізувати `ExampleCommand` у `packages/release/src/domain/ExampleCommand.js` та зареєструвати у `App.js` команду `example`.
- [x] [task-2] Оновити генерацію шаблонів у `InitCommand.js` для створення валідних `task.md`, `user.md` (з метриками у frontmatter: hours, iterations, rrs) та `task.spec.js`.
- [x] [task-3] Виправити визначення кореня проекту в `ValidateCommand.js` для шляхів, що містять `releases` (автоматичний пошук `package.json` вище).
- [x] [task-4] Забезпечити парсинг метрик із frontmatter та тексту в `ReleaseAuditor.js` та `ReleaseParser.js`.
- [x] [task-5] Покрити первинний функціонал контрактними тестами в `releases/3/6/v3.6.0/task.spec.js` (Green).
- [x] [task-6] Розширити контрактне виявлення тестів у `ReleaseAuditor.js`: підтримка масок `*.spec.js`, `*.test.js`, `*.story.js`, регресії у `src/tests/releases/` (🟢 OK), попередження для `src/test/releases/` (⚠️ WARN) та блокуючої помилки для `src/releases/` (❌ ERROR).
- [x] [task-7] Оновити `CloseCommand.js` для перенесення закритих контрактів виключно у `src/tests/releases/`.
- [x] [task-8] Стандартизувати `ReleaseApp.js` (у пакеті та в `apps/release.app`) через канонічний `ModelAsApp`: дефолтна команда `ViewCommand` без зайвих обгорток та procedural коду.
- [x] [task-9] Покрити задачі 6, 7 та 8 контрактними тестами в `releases/3/6/v3.6.0/task.spec.js` і досягти 100% Green.

## ⚖️ Критерії Прийнятності (Acceptance Criteria)
1. Команда `dilo example` повертає канонічну структуру релізу (`task.md`, `user.md`, `task.spec.js`).
2. Команда `dilo init vX.Y.Z` створює файли, де `user.md` містить метрики у frontmatter, що одразу валідуються на 100%.
3. `ReleaseAuditor` та `DashboardModel.parseUserMetrics` коректно зчитують метрики (hours, iterations, rrs) як із frontmatter, так і з тіла документа `user.md`.
4. Валідація шляху `dilo validate releases` знаходить `package.json` у батьківській директорії проєкту.
5. Релізи із закритими тестами в `src/tests/releases/` вважаються валідними без помилок.
6. Наявність тестів у `src/test/releases/` повертає діагностику `WARN` з рекомендацією мігрувати до `src/tests/releases/`.
7. Наявність тестів у `src/releases/` повертає діагностику `ERROR` (забруднення коду) з вимогою міграції до `src/tests/releases/`.
8. Команда `CloseCommand` переносить закриті тести виключно у `src/tests/releases/`.
9. Запуск `dilo` без підкоманди канонічно делегує на дефолтну команду `ViewCommand`, а `dilo validate <path>` валідує вказаний каталог.
10. Усі контрактні та юніт-тести проходять успішно (100% pass).


