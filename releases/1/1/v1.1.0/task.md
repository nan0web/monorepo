# Release v1.1.0: Launch of @nan0web/inspect

## Місія релізу (Mission)
Запуск нового пакету `@nan0web/inspect` як універсального інструменту інженерного аудиту в монорепозиторії. Перенесення та рефакторинг моделей аудиту на використання `@nan0web/db`.

## Задачі (Tasks)
- [x] Створення структури пакету `packages/inspect`.
- [x] Генерація `project.md` (Vision & Roadmap).
- [x] Перенесення `StackDetector.js` (рефакторинг під `this._.db`).
- [x] Перенесення `CircularDependencyAuditor.js`, `NoTypeScriptAuditor.js`, `StructureAuditor.js`.
- [ ] Налаштування `package.json` для `@nan0web/inspect`.
- [ ] Оновлення `PackageAuditor.js` у root для використання моделей з нового пакету.

## Acceptance Criteria (Definition of DoD)
- [x] Пакет `@nan0web/inspect` ініціалізовано.
- [x] `StackDetector` успішно виявляє стек через абстракцію DB.
- [ ] `pnpm install` проходить без помилок у новому пакеті.
- [ ] Контрактні тести підтверджують портативність моделей.
