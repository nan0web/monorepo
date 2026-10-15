---
status: work
type: minor
epic: EPIC-RELEASE-CLI
sprint: Sprint 43
tracker: https://github.com/nan0web/nan.web/issues/{id}
---

# v0.3.0 — CLI Release Inspector & Multi-Format Validator

## Опис та Мета
Створення CLI інструменту інспекції та валідації релізів на базі Model-as-App для додатку `apps/release.app` з використанням ядра `@nan0web/release` (`PMaCParser`, `ReleaseModel`, `ReleaseAuditor`).
Інструмент приймає шлях до проєкту чи директорії `releases/`, сканує всі версії (як вкладені `releases/3/5/v3.5.0/`, так і пласкі `releases/v1.0.0/`), валідує структуру за еталоном PMaC та виводить звіт у форматах:
1. `text` (кольоровий консольний звіт із бейджами, статистикою та рекомендаціями).
2. `json` (структурований JSON з моделями для CI/CD та Payload CMS).
3. `nan0` (компактний YAML/NaN0 формат).
4. `csv` (табличний експорт паритету та завдань).

## Команда
- **Lead / Architect:** Олександр Снігірьов (@snigirev)
- **AI Lead Developer:** Agent Antigravity (@agy)
- **Auditor:** Security Bot (@sec-bot)

## Робочий План та Задачі

### 1. Доменна модель підкоманди валідації (`ValidateCommand`)
- [x] [#VAL-1] Створити `ValidateCommand` (успадковує `ModelAsApp`) з підтримкою позиційного аргументу `target` (шлях до папки чи проєкту).
- [x] [#VAL-2] Підтримка сканування як окремого каталогу `releases/` (вкладеного і плаского), так і проєктів із `releases.txt`.
- [x] [#VAL-3] Інтеграція `PMaCParser` та `ReleaseAuditor` для перевірки відповідності Markdown-файлів (`release.md`, `task.md`) еталонній схемі.

### 2. Мульти-форматний вивід (`--format`) та збереження (`--output`)
- [x] [#FMT-1] Додати статичне поле `static format = { default: 'text', options: ['text', 'json', 'nan0', 'csv'] }`.
- [x] [#FMT-2] Реалізація рендерера для кожного з 4 форматів (`text`, `json`, `nan0`, `csv`).
- [x] [#FMT-3] Підтримка виводу у stdout або збереження у файл через прапорець `--output=<file>` за допомогою `@nan0web/db`.

### 3. Реєстрація в ReleaseApp та CLI бінарниках
- [x] [#CLI-1] Додати `ValidateCommand` до `options` у `ReleaseApp.command` в `apps/release.app` та `@nan0web/release`.
- [x] [#CLI-2] Оновити точки входу `bin/release-app.js` у `apps/release.app` та `bin/nan0release.js` у `@nan0web/release`.
- [x] [#CLI-3] 100% покриття сценарними тестами `*.story.js` (In-Memory DB) та контрактними `task.spec.js`.
