---
version: 3.4.0
type: refactor
status: in-progress
locale: uk
models: ["ReactElement", "AppRunner"]
---

# 🏛 Mission: Модульна Декомпозиція Element.jsx та Наскрізний AppRunner (@nan0web/ui-react v3.4.0)

## 🏁 Overview (Огляд)
Файл `packages/ui-react/src/Element.jsx` перевантажений (610 рядків): у ньому змішано завантаження `ModelAsApp`, життєвий цикл генератора, рекурсивну обробку дочірніх списків, парсинг $-пропсів та кешування компонентів.
Мета релізу v3.4.0 — декомпозувати `Element.jsx` на модульну підсистему `src/element/`, виділивши автономний `AppRunner.jsx` та зберігши 100% сумісність з існуючими тестами.

## 🎯 Scope (Завдання)
- [ ] **DEC-1**: Виділити допоміжні константи та межі помилок у `src/element/constants.jsx` (`voidElements`, `listElements`, `Alert`, `InternalErrorBoundary`).
- [ ] **DEC-2**: Винести парсинг функцій та $-пропсів у `src/element/PropsParser.js` (`parseProps`, `parseFunctionString`).
- [ ] **DEC-3**: Винести резолвінг компонентів у `src/element/ComponentResolver.js` (`resolveComponent`, `resolveAsyncImport`).
- [ ] **DEC-4**: Винести автономне виконання генераторів додатків у `src/element/AppRunner.jsx` (`AppRunner`, підтримка `run()`, `refresh`, `interactive` / `content`).
- [ ] **DEC-5**: Скоротити `Element.jsx` до чистого фасаду `ReactElement.render` (~80 рядків).
- [ ] **TDD**: Забезпечити 100% проходження існуючих 34 тест-файлів `pnpm test`.

## ✅ Acceptance Criteria (DoD)
- [ ] `packages/ui-react/src/Element.jsx` має розмір менше 120 рядків.
- [ ] Усі тести `pnpm test` (unit + jsx) проходять успішно (код 0).
