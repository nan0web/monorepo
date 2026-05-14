---
version: 1.0.3
type: refactor
status: active
locale: uk
models: []
---

[🇺🇦 Українська](./task.md) | [🇬🇧 English](./task.en.md)

# 🚀 Mission: Core Refactoring and String Initialization

## 🏁 Overview (Огляд)
Системний рефакторинг стилю (single quotes замість double), міграція залежностей на workspace:* та надання можливості швидкого парсингу через конструктор.

## 👥 User Stories (Сценарії)
> Як розробник, я хочу передавати String у конструктор Markdown та отримувати одразу готовий і пропарсений документ без додаткового виклику `.parse()`.

## 🏗 Data-Driven Architecture (Моделювання)
Без змін.

## 🎯 Scope (Задачі)
- [x] Замінити подвійні лапки на одинарні.
- [x] Оновити package.json (workspace).
- [x] Дозволити string у конструкторі `Markdown`.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести (`task.spec.js`) проходять (Green).
- [x] `test:all` успішно виконується.
