---
version: 3.0.0
type: architecture
status: active
locale: uk
models: ["MonorepoUnification"]
---

# 🚀 Mission: Monorepo Unification (Велике Об'єднання)
[English version](./task.en.md)

## 🏁 Overview
Трансформація архітектури в єдиний синхронізований монорепозиторій. Видалення вкладених Git-структур, очищення конфіденційної історії та впровадження інтелектуальної фільтрації `node_modules` у ядро бази даних.

## 👥 User Stories
"Як Творець платформи, я хочу щоб вся система була єдиним Організмом з синхронними версіями та чистим пошуком без технічного шуму."

## 🏗 Data-Driven Architecture
- **Model**: `MonorepoUnification` (системна операція).
- **Logic**: Використання `DB.browse` з фільтрацією `ignore` у `@nan0web/db`.
- **Versioning**: Початок ери 3.0.0 для всіх пакетів.

## 🎯 Scope
- [ ] Створити `bin/unify.js` для автоматизації об'єднання (видалення `.git`).
- [ ] Очистити історію від `.nan0web/sync.json` (через `git filter-branch`).
- [ ] Реалізувати опцію `ignore` у методі `browse` пакета `@nan0web/db`.
- [ ] Підняти версію всіх пакетів до 3.0.0 через `bin/bump.js`.

## ✅ Acceptance Criteria (DoD)
- [ ] `packages/db` успішно проходить тест на ігнорування `node_modules`.
- [ ] Всі вкладені `.git` видалені.
- [ ] Всі `package.json` мають версію 3.0.0.
- [ ] Історія Git очищена від паролів.
