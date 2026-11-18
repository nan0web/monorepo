---
version: 3.8.0
type: minor
status: active
locale: uk
models:
  - TodoCommand
  - TaskModel
  - MarkdownRoundTripAuditor
  - Scanner
  - ListCommand
---

# 🚀 Release v3.8.0: Task AST Engine, Zero-Drift Auditor & Deterministic TodoCommand (@nan0web/release)

## 🏁 Overview (Огляд)

Реліз впроваджує ядро детермінованого управління завданнями на базі AST `@nan0web/markdown`:
1. **`MarkdownRoundTripAuditor`**:
   - Верифікація відсутності структурного дрейфу при модифікації Markdown.
2. **`TaskModel` (Model-as-Schema)**:
   - Типізована модель для задач з полями `title`, `status`, `badges`, `filePath`, `lineIndex`.
3. **`TodoCommand` (`ModelAsApp`)**:
   - Мультиформатний зріз завдань (`--format=cli|json|md|text`).
   - Детерміновані безпечні мутації стану (`--done`, `--undo`) через інжектовану базу `this.$db`.
4. **i18n та Scanner / ListCommand вдосконалення**:
   - Стандартизація Scanner та рендеринг списків.

---

## 👥 User Stories (Сценарії)

- **US-1 (AST інспекція задач):** Як AI-агент або користувач, я отримую сухий стан задач без галюцинацій через `nan0release todo --json`.
- **US-2 (Безпечна мутація):** Як користувач, я маркую задачу як виконану через `nan0release todo --done="<id|title>"`, гарантуючи нульовий дрейф решти розмітки.

---

## 🎯 Target Files

- `packages/release/src/domain/Task/MarkdownRoundTripAuditor.js`
- `packages/release/src/domain/Task/TaskModel.js`
- `packages/release/src/domain/TodoCommand.js`
- `packages/release/src/domain/App.js`
- `packages/release/src/index.js`
- `packages/release/releases/3/8/v3.8.0/task.spec.js`

---

## 📋 Завдання (Tasks)

- [x] [task-1] Реалізувати `MarkdownRoundTripAuditor` з тестом `RoundTrip.story.js`.
- [x] [task-2] Реалізувати `TaskModel` та `TodoCommand` (`ModelAsApp`).
- [x] [task-3] Зареєструвати `TodoCommand` в `ReleaseApp` та експортах `src/index.js`.
- [x] [task-4] Створити контрактний тест `releases/3/8/v3.8.0/task.spec.js` та перевести в Green.

---

## ⚖️ Acceptance Criteria (Критерії Прийнятності)

1. `TodoCommand` коректно експортується та виконується як підкоманда `ReleaseApp`.
2. Усі формати виводу (`cli`, `json`, `md`, `text`) та мутації `--done` / `--undo` працюють.
3. 100% тестів проходять (Green).

