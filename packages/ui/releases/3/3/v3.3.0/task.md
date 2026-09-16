---
version: 3.3.0
type: feature
status: planning
locale: uk
models: ["Attachment", "Article", "Media", "File"]
---

# 🚀 Mission: Базові Універсальні Моделі (без суфікса Model) та BlockRegistry в @nan0web/ui (v3.3.0)

## 🏁 Overview (Огляд)
Винесення базових універсальних моделей (`Attachment`, `Article`, `Media`, `File`) без суфікса `Model` та основи поліморфного `BlockRegistry` на рівень платформи в `@nan0web/ui` за стандартом OLMUI.

## 👥 User Stories (Сценарії)
- Як розробник, я хочу використовувати клас `Attachment` (без суфікса `Model`) для роботи з документами та локальними файлами, де бінарники зберігаються в `public/uploads/`, а метадані — в DB-FS.
- Як розробник, я хочу описувати `Article` з `type: 'text/markdown'`, який підтримує кастомні елементи (графіки CSV, калькулятори).
- Як розробник, я хочу реєструвати UI-відображення для моделей через поліморфний `BlockRegistry` без процедурних `switch/case`.

## 🏗 Data-Driven Architecture (Моделювання)
- `Attachment`:
  - `static $collection = 'attachments'`
  - `static $upload = true`
  - `title`, `url`, `filename`, `mimeType`, `filesize`, `alt`
- `Article`:
  - `static $collection = 'articles'`
  - `title`, `slug`, `content` (`type: 'text/markdown'`)
- `BlockRegistry`:
  - Клас/Map для прив'язки `ModelConstructor` ➔ `UIAdapter`

## 🎯 Scope (Задачі)
- [ ] Створити `Attachment` (без `Model`) у `@nan0web/ui/domain` з обов'язковими полями `url`, `filename`, `mimeType`.
- [ ] Створити `Article` (без `Model`) у `@nan0web/ui/domain` з підтримкою `type: 'text/markdown'`.
- [ ] Реалізувати `BlockRegistry` у `@nan0web/ui/core` для поліморфної прив'язки моделей до UI компонентів.

## ✅ Acceptance Criteria (DoD)
- [ ] Контрактні тести (`task.spec.js`) написані і успішно проходять (Green).
- [ ] Назви класів: Суфікс `Model` повністю виключено з назв моделей.
- [ ] 100% сумісність із OLMUI та розширенням у `@nan0web/ui-payload`.
