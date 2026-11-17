# Ретроспектива релізу v3.10.0

- **Реліз:** `@nan0web/inspect@3.10.0`
- **Дата завершення:** 2026-11-17
- **Результат:**
  - Реалізовано підкоманду `nan0inspect release` (`ReleaseAuditor`) з підтримкою `--non-interactive`, `-r`/`--recursive` та `-o`/`--out`.
  - Додано ігнорування службових директорій (`node_modules`, `.git`, `.venv`, `.agent`, `dist`, `types`) та автоматичне визначення закритих релізів через `package.json#version`.
  - Інтегровано `release:validate` у `test:all` пакета `@nan0web/inspect`.
  - Контрактні тести `task.spec.js`: 6/6 pass.
