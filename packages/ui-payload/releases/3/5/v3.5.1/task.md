---
version: 3.5.1
type: patch
status: completed
locale: uk
models: ["fromNan0Html"]
---

# 🛠️ Реліз v3.5.1 — Усунення подвійного обгортання у `fromNan0Html`

## Мета
Усунути подвійне обгортання Lexical-вузлів у масив (`[[node]]`) для тегів `a`, `img`, `td`, `th` у `fromNan0Html.js`.

## Задачі
- [x] Додати контрактні тести у `releases/3/5/v3.5.1/task.spec.js` (TDD Red), що перевіряють плоску структуру `children` без вкладених масивів для `a`, `img`, `td`, `th`.
- [x] Оновити `src/richtext/fromNan0Html.js` (рядки 203, 213, 223): замінити `return [wrapElementIfNeeded(...)]` на `return wrapElementIfNeeded(...)`.
- [x] Додати регресійні тести у `src/richtext/nan0html-converter.spec.js`.
- [x] Пройти повний конвеєр перевірок (`pnpm --filter @nan0web/ui-payload run test:all`) та оновити версію в `package.json` до `3.5.1`.

## Target Files
- `packages/ui-payload/releases/3/5/v3.5.1/task.md`
- `packages/ui-payload/releases/3/5/v3.5.1/task.spec.js`
- `packages/ui-payload/releases/3/5/v3.5.1/user.md`
- `packages/ui-payload/src/richtext/fromNan0Html.js`
- `packages/ui-payload/src/richtext/nan0html-converter.spec.js`
- `packages/ui-payload/package.json`
