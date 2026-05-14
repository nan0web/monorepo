---
version: 1.1.2
type: bugfix
status: done
locale: uk
models: []
---

# 🚀 Mission: Fix Body Consumption Bug in _fetchPrimary & loadDocument

## 🏁 Overview (Огляд)
Виявлено критичний баг, який заважає коректному використанню `db.readDir()` у браузері через HTTP. 
Тіло відповіді `body` не можна читати двічі. Якщо `json()` кидає помилку, наступний виклик `text()` падає з `TypeError: Body is unusable`.

## 👥 User Stories (Сценарії)
- Як розробник, я хочу, щоб `loadDocument` та `_fetchPrimary` коректно обробляли текстові відповіді (наприклад, `index.txt`), навіть якщо вони не є валідним JSON, не викликаючи помилок споживання тіла (body consumption).

## 🏗 Data-Driven Architecture (Моделювання)
Зміни стосуються внутрішньої логіки `DBBrowser.js` для обробки відповідей Fetch API.

## 🎯 Scope (Задачі)
- [x] Створити контрактні тести у `task.spec.js`.
- [x] Виправити `loadDocument` у `src/DBBrowser.js`.
- [x] Виправити `_fetchPrimary` у `src/DBBrowser.js`.
- [x] Виправити `throwError` у `src/DBBrowser.js`.
- [x] Виправити `writeDocument` у `src/DBBrowser.js`.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести (`task.spec.js`) проходять.
- [x] `loadDocument` повертає текст при помилці JSON-парсингу.
- [x] `throwError` не падає при спробі прочитати тіло відповіді після невдалого JSON-парсингу.
- [x] `test:all` зелений.
