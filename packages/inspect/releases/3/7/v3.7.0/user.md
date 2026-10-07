# Журнал та Метрики Релізу @nan0web/inspect v3.7.0

## Зауваження Архітектора (Append-Only)
- **2026-10-06**: **Конфігураційна Модель `InspectConfig` (Model-as-Schema v2)**:
  - Сувора типізована модель `InspectConfig extends Model`.
  - Підтримка каскадного злиття налаштувань:
    1. Глобальний: `~/.nan0web/inspect/config.nan0`
    2. Кореневий: `<repo_root>/inspect.config.{nan0,yaml,js}`
    3. Проєктний: `<project_dir>/inspect.config.{nan0,yaml,js}`
  - Поля конфігурації:
    - `skip`: масив аліасів аудиторів, що пропускаються за замовчуванням (наприклад `['snapshots']` для CMS/адмінки чи backend API).
    - `theming`: правила ігнорування компонентів (`ignorePatterns`, `ignoreDirs`).
    - `snapshots`: параметри перевірки знімків (`optional: boolean`, `dir: string`, `allowEmpty: boolean`).
    - `rules`: селективне вимкнення/увімкнення окремих перевірок (`rules.exportDefault: false`).
  - Пряма інтеграція у `InspectorApp` та `ArchitectureAuditor` через інжектовану `@nan0web/db`.
  - Генерація початкових файлів конфігурації `inspect.config.nan0` для монорепозиторію банку (`apps/3rdparty/industrialbank/inspect.config.nan0` та `cms/inspect.config.nan0`).

## Зв'язок із Монорепозиторієм Industrial Bank
- **Цільовий проєкт**: [apps/3rdparty/industrialbank](file:///Users/i/src/nan.web/apps/3rdparty/industrialbank)
- **Документи партнерства**:
  - [DESIGN_PARTNER_ADVANTAGES.md](file:///Users/i/src/nan.web/apps/3rdparty/industrialbank/docs/uk/DESIGN_PARTNER_ADVANTAGES.md)
  - [DEPLOY.md](file:///Users/i/src/nan.web/apps/3rdparty/industrialbank/docs/uk/DEPLOY.md)
  - [inspect-bank.md](file:///Users/i/src/nan.web/apps/3rdparty/industrialbank/docs/uk/inspect-bank.md)
- **Каскадні залежності, що зачіпаються**:
  - `@nan0web/inspect` $\rightarrow$ надання `InspectConfig` та обробка конфігураційних файлів.
  - `@nan0web/ui` $\rightarrow$ підтримка опцій `SnapshotAuditor` та `OlmuiThemingAuditor`.
  - `@industrialbank/cms` $\rightarrow$ валідація через `pnpm run inspect cms` та `pnpm inspect:seed`.

- **2026-10-07**: **Впровадження `include` білого списку, структури `modules` та очищення банку**:
  - Розширено `InspectConfig`: додано `include: string[]` для строгого запуску виключно потрібних аудиторів без роздування списку `skip`.
  - Введено секцію `modules: Record<string, any>` для параметрів окремих аудиторів (`modules.theming`, `modules.snapshots`, `modules.exports`).
  - У монорепозиторії банку переведено всі коментарі у конфігураціях на українську мову згідно з Мовним Суверенітетом.
  - Утилізовано застарілий промпт `docs/uk/inspect-bank.md`, перенесено 5 архітектурних правил до `.agents/AGENTS.md`.
  - Скрипт `inspect:bank` у `apps/3rdparty/industrialbank/package.json` переведено на детерміновану перевірку `nan0inspect bank`.

