# User Log — Release v3.9.0 (@nan0web/release)

## Ітерація 1 (2026-11-21)
- Затверджено план релізу: `PriorityEvaluator` (контракт JS-функції `(task, context) => number`), збереження ізоляції `DBFS` у межах `cwd`, `txt` + `epub` для Kindle, `MDTable` + `MDTaskList` у `TodoCommand`, `SwiftBarAdapter`, `TrayCommand`, `TodoServeCommand`, `SyncCommand`.
- Створено `task.md` та `task.spec.js` (TDD Red).

## Ітерація 2 (2026-11-24)
- Отримано дефект з `releases/backlog/nan0web-release-tray-fix.md`: `nan0release tray set-status` не знаходив задачі з Markdown-розміткою (бектики, `**...**`), оскільки `SwiftBarAdapter` передає очищений `--target`, а `TodoCommand.mutateTask` перевіряє лише сирий текст.
- Додано контрактний тест у `task.spec.js` на мутацію задач із Markdown-розміткою через очищений `target`.
- Реалізовано фікс у `TodoCommand.mutateTask` (`matchesText` перевіряє `TaskModel.cleanTitle(text)`), усі 18 тестів `release:spec` та `test:all` пройдені.

## Метрики Виконання
- Витрачений час розробки (Годин): 0.5
- Кількість ітерацій: 2
- Фінальний бал RRS: 324
