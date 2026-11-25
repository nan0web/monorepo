# User Stories & Метрики v3.5.1

## User Stories
- **Як розробник інтеграції NaN0HTML ↔ Lexical**, я хочу, щоб `fromNan0Html` повертав плоскі масиви вузлів без подвійного обгортання `[[node]]` для тегів `a`, `img`, `td`, `th`, щоб уникнути милиць на кшталт `flattenLexicalChildren`.

## Метрики Виконання
- Початок: 2026-11-25
- Завершення: 2026-11-25
- Цільова версія: v3.5.1
- Статус: Completed ✅
- Етап: 100% Green (`test:all` та `nan0html-converter.spec.js` пройдені, `knip` та `audit` чисті)

## Журнал Зауважень та Контрактів (Append-Only)
- 2026-11-25: Підтверджено реальний баг у `src/richtext/fromNan0Html.js` (рядки 203, 213, 223: `wrapElementIfNeeded` вже повертає масив, а `switch` робить `[wrapElementIfNeeded(...)]`). Створено контрактний тест `task.spec.js`.
- 2026-11-25: Усунено подвійне обгортання, додано регресійний тест у `nan0html-converter.spec.js`, пройдено `test:all` та оновлено `package.json` до `3.5.1`.
