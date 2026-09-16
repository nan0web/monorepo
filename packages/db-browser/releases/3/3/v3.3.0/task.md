---
version: 3.3.0
type: bugfix
status: active
locale: uk
models: []
---

# 🚀 Mission: Fix Fetch Pipeline in DBBrowser (Globals, Inheritance & References)

## 🏁 Overview (Огляд)
Виправлення критичної регресії в `@nan0web/db-browser`, через яку `DBBrowser` не виконував злиття глобальних змінних (`getGlobals`), директорійного успадкування (`getInheritance`) та резолвінгу посилань (`resolveReferences`) при виклику `db.fetch()`.

## 👥 User Stories (Сценарії)
> Як веб-розробник клієнтських додатків, викликаючи `db.fetch('doc.json')` через `@nan0web/db-browser`, я хочу отримувати документ з автоматично інжектованими глобальними змінними `_/`, успадкованими полями `_.json` та розгорнутими `$ref:`, щоб браузерний клієнт повноцінно відповідав контракту `@nan0web/db`.

## 🏗 Data-Driven Architecture (Моделювання)
- `DBBrowser` є розширенням `DB` і має делегувати операцію `fetch()` через базовий конвеєр `DB.prototype._fetchPrimary()` ➔ `DB.prototype.fetchMerged()`.
- Видалено некоректний оверрайд `_fetchPrimary(uri)` у `DBBrowser`, який зрізав виклик `fetchMerged()`.
- `loadDocument()`, `statDocument()`, `readDir()` залишаються низькорівневими методами транспорту HTTP.

## 🎯 Scope (Задачі)
- [x] Видалити помилковий `_fetchPrimary()` у `DBBrowser.js`.
- [x] Забезпечити проходження повноцінного циклу `fetch()` з `getGlobals()`, `getInheritance()`, `resolveReferences()`.
- [x] Розкрити та актуалізувати тести `fetch` у `DB.test.js` та `DBBrowser.test.js`.
- [x] Синхронізувати версію до наскрізної `3.3.0` у `package.json`.
- [x] Оновити документацію та контракти.

## ✅ Acceptance Criteria (DoD)
- [x] `db.fetch()` у `DBBrowser` підтягує `_.json` (успадкування).
- [x] `db.fetch()` у `DBBrowser` підтягує змінні з `_/` (`getGlobals`).
- [x] `db.fetch()` у `DBBrowser` резолвить `$ref:` ланцюжки.
- [x] `pnpm run test` та `pnpm run test:all` проходять (100% Green).
