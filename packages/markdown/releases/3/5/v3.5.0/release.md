---
name: markdown
version: 3.5.0
type: minor
status: active
locale: uk
models:
  - MDTaskList
  - MDListItem
---

# 🚀 Release: Task AST Engine & Extended Marker Badges (v3.5.0)

> **Мета Релізу:** Розширення вузлів синтаксичного дерева Markdown AST (`MDListItem`, `MDTaskList`) підтримкою мульти-маркерів `[ ]`, `[x]`, `[>]`, `[-]` та бейджів `[key:value]`.

## 🧪 Критерії Прийомки (Definition of Done)
- [x] 100% тестів `task.spec.js` та `MDTaskList.test.js` пройдено.
- [x] Детермінована серіалізація `toString()`.
- [x] Повна сумісність із існуючим Markdown парсером.
