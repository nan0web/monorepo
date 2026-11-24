---
version: 3.9.0
type: minor
status: active
locale: uk
models:
  - PriorityEvaluator
  - TaskModel
  - ProjectsMap
  - TodoCommand
  - SwiftBarAdapter
  - TrayCommand
  - TodoServeCommand
  - SyncCommand
---

# 🚀 Release v3.9.0: SwiftBar Tray, Table AST, TodoServe & Sync Adapters (@nan0web/release)

## 📋 Завдання (Definition of Done)

- [ ] [task-1] Реалізувати `PriorityEvaluator` (контракт `(task, context) => number` + пресети) та розширити `TaskModel` (статуси `todo|work|done|pause|fail`, метрики, `cleanTitle`, `extractHashtags`).
- [ ] [task-2] Реалізувати `ProjectsMap` (читання `projects.nan0`, резолв проєкту, запуск `agy` через `SystemAdapter`).
- [ ] [task-3] Розширити `TodoCommand` на AST-парсинг та Zero-Drift мутацію `MDTable`/`MDTableRow` + `MDTaskList`/`MDListItem` (з підтримкою `TaskModel.cleanTitle` у `mutateTask`), зберегти `cwd` у `bin/nan0release.js`.
- [ ] [task-4] Реалізувати `SwiftBarAdapter` (`sanitizePipe`, `wrapText(..., 65)`) та `TrayCommand` (`tray`, `set-status` із дзеркальною синхронізацією, `open-antigravity`).
- [ ] [task-5] Реалізувати `TodoServeCommand` (`GET /`, `GET /api/tasks`, `POST /api/status`) через `SystemAdapter`.
- [ ] [task-6] Реалізувати `BaseSyncAdapter`, `DarwinSyncAdapter`, `IcsSyncAdapter`, `CalDavAdapter`, `WindowsAdapter`, `KindleExportAdapter` (`txt` / `epub`) та `SyncCommand`.
- [ ] [task-7] Зареєструвати нові команди в `ReleaseApp`, оновити `src/index.js` та пройти `release:spec`, `test:all` (`test`, `test:docs`, `build`, `knip`).
