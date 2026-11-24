# Проблема з `nan0release tray set-status` для задач із Markdown-розміткою

## Суть проблеми
При натисканні в SwiftBar на дію (`✅ Виконано`, `▶ В роботу`, `⏸️ Пауза`, `⬜ В чергу`) для задач, у назві яких є Markdown-розмітка (наприклад, зворотні лапки `` `mlx-whisper` ``, `` `nan0web` ``, `**...**` тощо), статус у файлі `todo.md` не змінюється, а команда повертає:

```text
Task not found: Покращити mlx-whisper пайплайн: додати -
```

### Причина в коді
1. `SwiftBarAdapter.renderTaskItem` формує `--target` з очищеного заголовка `task.title.slice(0, 40)` (без бектиків `` ` `` та `**`).
2. `TodoCommand.mutateTask` у `@nan0web/release` ([TodoCommand.js](file:///Users/i/src/nan.web/packages/release/src/domain/TodoCommand.js#L183-L191)) порівнює `--target` із **сирим** текстом комірки таблиці:
   ```js
   if (text.trim().toLowerCase().includes(targetLower)) return true
   ```
   Оскільки в `todo.md` комірка містить сирий Markdown (наприклад, `**Покращити \`mlx-whisper\` пайплайн:** додати \`--language uk\`...`), рядок без бектиків не збігається.

## Очікуваний результат
У `TodoCommand.mutateTask` (`matchesText`) перевірка має також враховувати очищений заголовок через `TaskModel.cleanTitle(text)`:

```js
if (TaskModel.cleanTitle(text).toLowerCase().includes(targetLower)) return true
```

Після цього:
- `nan0release tray set-status --file=2026/11/24/todo.md --status=done --target="Покращити mlx-whisper пайплайн: додати -"` знаходить задачу і змінює її статус на `✅` (або `▶` / `⏸️` / `⬜`).
- При кліку в SwiftBar меню оновлюється з новим статусом задачі та перерахованим лічильником прогресу.
