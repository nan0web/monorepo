---
version: 1.12.1
type: bugfix
status: done
locale: uk
models: []
---

# 🚀 Mission: TypeScript Types Refinement & Workflow Sync

## 🏁 Overview (Огляд)

Фіксація змін з `seed.md` щодо виправлення типів (JSDoc) у пакеті `@nan0web/ui` (App/Core/CoreApp.js, Widget.js, UserApp.js, View/View.js, Frame/Frame.js тощо) для уникнення помилок типізації у залежних проектах (наприклад, `inspect`). Також включення нових `Agents Workflows` у систему.

## 👥 User Stories (Сценарії)

> - Як розробник, я хочу мати виправлений JSDoc у `CoreApp.js` та `Widget.js`, щоб не було помилок `any` при компіляції залежних проектів.
> - Як розробник, я хочу мати строгу типізацію параметрів та `Map` у `View/View.js`, щоб мій код безпечно взаємодіяв з термінальним виводом.
> - Як архітектор, я хочу бачити відсутність файлу `seed.md` після релізу, щоб підтвердити повну обробку наміру.
> - Як архітектор, я хочу мати зафіксовані `Agents Workflows` та файл конфігурації `nan0web.nan0` у системі, щоб забезпечити консистентність роботи агентів.
> - Як архітектор, я хочу, щоб усі існуючі та нові контракти проходили успішно, щоб гарантувати відсутність регресій.

## 🏗 Data-Driven Architecture (Моделювання)

Немає нових моделей. Зміни стосуються JSDoc анотацій та перенесення `workflows`.

## 🎯 Scope (Задачі)

- [ ] Виправити JSDoc у `App/Core/CoreApp.js` та `Widget.js` (помилки `any` та несумісності)
- [ ] Виправити JSDoc у `View/View.js` (Map types, implicit any args, StdOut colors)
- [ ] Видалити `seed.md` як підтвердження обробки наміру.
- [ ] Додати Agent Workflows та `nan0web.nan0` конфіг до релізу.
- [ ] Перевірити сумісність: усі тести проходять (`test:all`).

## ✅ Acceptance Criteria (DoD)

- [ ] **Контрактні тести** (`task.spec.js`) написані і успішно проходять (Green).
- [ ] Відсутність `any` типів при суворій типізації.
- [ ] `seed.md` відсутній.
