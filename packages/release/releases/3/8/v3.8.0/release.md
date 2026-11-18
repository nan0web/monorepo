---
name: release
version: 3.8.0
type: minor
status: active
locale: uk
models:
  - TodoCommand
  - TaskModel
  - MarkdownRoundTripAuditor
---

# 🚀 Release: Task AST Engine & Deterministic TodoCommand (v3.8.0)

> **Мета Релізу:** Впровадження детермінованого контролера стану завдань `nan0release todo`, доменної моделі `TaskModel` та валідатора `MarkdownRoundTripAuditor`.

## 🧪 Критерії Прийомки (Definition of Done)
- [x] 100% тестів `task.spec.js` та `RoundTrip.story.js` пройдено.
- [x] `TodoCommand` доступний у CLI `nan0release todo`.
- [x] Мультиформатний вивід (`cli`, `json`, `md`, `text`) та мутації `--done`, `--undo`.
