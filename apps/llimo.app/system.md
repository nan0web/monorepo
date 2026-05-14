---
inputFile: dev.md
maxFails: 9
---

# LLiMo application

Цей додаток розроблено для написання коду за допомогою LLM (Large Language Models) і
називається тому він LLiMo (Language Living Models).

## Дефініції

- `Ui` - важливо використовувати i малою літерою

## API та Контекст (Zero-Hallucination)

1. **Vector-First (Knowledge Base) Principle**: Для отримання будь-якого API, контрактів або архітектурного контексту пакету, Агент (LLiMo) **ОБОВ'ЯЗКОВО** має здійснювати пошук по Векторній Базі Даних (команди типу `mcp_nan0web-knowledge_search_knowledge_base` / `nan0ai search` / тощо). Це **Єдине Джерело Правди (Single Source of Truth)**, яке завжди містить автоматично проіндексовані `README.md` файли (перевірені тестами). Створення ручних "шпаргалок" (дублювання API у `system.md` або подібних) чи нескінченне сканування сирих `src/` файлів — КАТЕГОРИЧНО ЗАБОРОНЯЄТЬСЯ.

## Режими

1. `llimo chat` - режим чату для виконання одного завдання паралельно
1. `llimo release` - режим чату для виконання релізу (декількох завдань паралельно)
1. `llimo test --test-dir chat/xxxx-yyyy-zzzz` - режим симуляції чату без API

## Release

Release notes is our goal how we see it, so we write it down in overview
`releases/X/vX.Y.Z/NOTES.md` and in details for every task
`releases/X/vX.Y.Z/*/task.md`.

We cover every task with acceptance criteria `releases/X/vX.Y.Z/*/task.test.js` with
all the tasks marked as todo `it.todo(..)` and every must fail, otherwise it is not
correct task or it is done in previous release.

When developer or llimo takes the task into work it changes status to `it(..)` and
until its pass or skip `it.skip()` it is solving by taker.

Release is complete when all the tasks are passing release `task.test.js` tests.

## Javascript

- Пиши @typedef для складних типів.
- Пиши jsdoc англійською мовою для всіх експортованих функцій, методів і даних.
- Уникай ; на прикінці рядка.
- Слідуй інструкціям з @todo коментарів у коді.
- Коли оновлюєш файли зберігай максимально первинний вигляд, якщо це не є помилкою або виправленним @todo коментарем, включно із старими коментарями.
- Якщо використовується умови `true === value` не потрібно їх замінювати на `value === true`, залишай як є.
- Typescript лише для d.ts, які автоматично генеруються з js.

## OLMUI Testing & Gallery Architecture
- **Галерея (Snapshots)**: Генерація `nan0gallery` (зліпків для QA) є дуже важкою операцією. Вона НЕ ПОВИННА входити у швидкий цикл `test:all`. Субагент генерує галерею окремою командою. У `test:all` залишаються лише Інспектори, що звіряють чи відповідає код/структура еталону (без генерації нових файлів).

## Робота з Файлами (Diff Protocol & Запобігання Ліні)
- **Lazy Models Mitigation**: Швидкі моделі (Groq, локальні) обрізають результати (`// rest of the code`). Щоб уникнути пошкодження файлів, категорично **ЗАБОРОНЯЄТЬСЯ** змушувати модель переписувати масивні файли цілком.
- **Search & Replace**: Натомість для зміни файлів необхідно використовувати Diff-протокол. Модель або Оркестратор мусять шукати конкретний блок коду і міняти його точково (Search & Replace), що значно економить токени, гарантує консистентність і працює ідеально навіть на моделях з невеликим `max output context`.
