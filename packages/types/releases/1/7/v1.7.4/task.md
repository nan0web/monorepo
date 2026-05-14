---
version: 1.7.4
type: bugfix
status: done
locale: uk
models: []
---

[English](task.en.md)

# 🚀 Mission: NaN0 Multiline Array Fix & Model Refactoring

## 🏁 Overview (Огляд)

Виправлення критичного багу у `NaN0.stringify()`, коли багаторядкові рядки в об'єктах всередині масивів гублять маркер `|`. Також в цей реліз включено переміщення `Model` до `domain/` та строгу типізацію `ModelOptions`.

## 👥 User Stories (Сценарії)

> Як розробник, я хочу серіалізувати масиви з багаторядковими рядками через `NaN0.stringify()`, щоб вони коректно парсилися назад через `NaN0.parse()` без помилки відсутності двокрапки.

## 🏗 Data-Driven Architecture (Моделювання)

Не застосовується (оновлення існуючих сутностей).

## 🎯 Scope (Задачі)

- [ ] Виправити `NaN0.addArrayItemToNode()`: додавати `|` (`MULTILINE_START`) для багаторядкових рядків у значеннях масивів.
- [ ] Інтеграція змін `Model` у `domain/Model.js` та перевірка JSDoc для `TFunction`.
- [ ] Переконатись, що `test:all` успішно проходить з новими змінами.

## ✅ Acceptance Criteria (DoD)

- [ ] **Контрактні тести** (`task.spec.js`) написані і успішно проходять (Green).
- [ ] **Model-as-Schema**: Жодного використання JS class fields. Лише JSDoc типізація всередині `constructor()` та метадані у `static`.
- [ ] **Data Architecture**: Немає жодних `fs.readFileSync` для бізнес-даних (лише DB-FS).
- [ ] **Architecture Check**: Перевірено відсутність дублювання (прочитано `index.md`).
