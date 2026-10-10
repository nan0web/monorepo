---
version: 3.5.0
type: minor
status: completed
locale: uk
models: ["DB"]
---

# 🚀 Mission: Pure JSONL Helpers у @nan0web/db (v3.5.0)

## 🏁 Overview (Огляд)
Реліз v3.5.0 додає чисті утиліти `parseJSONL` та `stringifyJSONL` для роботи з Newline-Delimited JSON безпосередньо з ядра `@nan0web/db`:
- **Парсинг (`parseJSONL`)**: розділення рядків (включаючи `\r\n`), ігнорування порожніх рядків, валідація JSON.
- **Серіалізація (`stringifyJSONL`)**: підтримка як масиву об'єктів, так і поодиноких значень із коректним об'єднанням через `\n`.
- **Експорт**: доступність утиліт через головну точку входу `@nan0web/db`.

## 👥 User Stories (Сценарії)
- Як розробник потокових пайплайнів та баз даних, я можу імпортувати `parseJSONL` та `stringifyJSONL` прямо з `@nan0web/db`, не створюючи зайвих залежностей.
- Як розробник, я впевнений, що порожні рядки та переноси `\r\n` не ламають читання JSONL файлів.

## 🎯 Scope (Задачі)
- [x] Реалізація `src/jsonl.js` з функціями `parseJSONL` та `stringifyJSONL`.
- [x] Експорт `parseJSONL` та `stringifyJSONL` з `src/index.js`.
- [x] Тести в `src/jsonl.test.js`.
- [x] Контрактний тест `releases/3/5/v3.5.0/task.spec.js`.
- [x] Регресійний тест `src/test/releases/3/5/v3.5.0/task.test.js`.
- [x] Оновлення `package.json` до `3.5.0`.
