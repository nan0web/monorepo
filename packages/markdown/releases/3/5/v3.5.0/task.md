---
version: 3.5.0
type: minor
status: active
locale: uk
models:
  - MDTaskList
  - MDListItem
---

# 🚀 Release v3.5.0: Task AST Engine & Extended Marker Badges (@nan0web/markdown)

## 🏁 Overview (Огляд)

Реліз присвячений розширенню можливостей синтаксичного дерева Markdown AST для задач та списків:
1. **Підтримка розширеного набору маркерів стану задач у `MDListItem` та `MDTaskList`**:
   - `[ ]` — todo (невиконано)
   - `[x]` / `[X]` — done (виконано)
   - `[>]` — work (в процесі)
   - `[-]` — fail (скасовано / заблоковано)
2. **Парсинг та детермінована серіалізація бейджів `[key:value]`**:
   - Вилучення пар ключ-значення у властивість `badges` елемента.
   - Збереження бейджів та їх позицій при виклику `toString()`.
3. **Детермінізм та Zero-Drift**:
   - Паритет форматування при повторній серіалізації.

---

## 👥 User Stories (Сценарії)

- **US-1 (AST парсинг та бейджі):** Як розробник та AI-агент, я можу парсити списки завдань із бейджами `[pri:high]` і маркерами стану, отримуючи типізовані поля `status` та `badges`.
- **US-2 (Детермінована серіалізація):** При модифікації або збереженні `MDListItem` генерує канонічний рядок `- [x] Task [key:val]` без втрати даних.

---

## 🎯 Target Files

- `packages/markdown/src/MDListItem.js`
- `packages/markdown/src/MDTaskList.js`
- `packages/markdown/src/MDTaskList.test.js`
- `packages/markdown/releases/3/5/v3.5.0/task.spec.js`

---

## 📋 Завдання (Tasks)

- [x] [task-1] Розширення `MDListItem` з підтримкою `status` (`todo`, `done`, `work`, `fail`) та `badges`.
- [x] [task-2] Оновлення `MDTaskList` для коректної агрегації та обходу дочірніх `MDListItem`.
- [x] [task-3] Створення контрактних тестів у `releases/3/5/v3.5.0/task.spec.js`.
- [x] [task-4] Забезпечення 100% проходження тестів пакету через `pnpm test`.

---

## ⚖️ Acceptance Criteria (Критерії Прийнятності)

1. `MDListItem.parse()` коректно детектує всі 4 статуси та витягує всі бейджі `[key:value]`.
2. `MDListItem.toString()` детерміновано відтворює маркер та бейджі.
3. 100% контрактних та юніт тестів проходять (Green).
