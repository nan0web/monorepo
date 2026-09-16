---
version: 3.3.1
type: fix
status: active
locale: uk
models: ["Nan0HTMLFeature", "PayloadCollectionTemplate"]
---

# 🚀 Mission: TypeScript Declarations & Exports у @nan0web/ui-payload (v3.3.1)

## 🏁 Overview (Огляд)
Забезпечення повної TypeScript типізації та конфігурації subpath експортів для безшовної інтеграції з Next.js App Router без локальних костилів та декларацій.

## 👥 User Stories (Сценарії)
- Як Next.js / PayloadCMS розробник, я можу імпортувати `@nan0web/ui-payload/richtext/Nan0HTMLFeature.js` і мати валідні `.d.ts` типи з коробки.
- Як розробник, я отримую чітку типізацію компонентів (`ImageCell`, `BooleanCell`, `MapCell`) та шаблонів (`PayloadCollectionTemplate`).

## 🎯 Scope (Задачі)
- [x] Додати `Nan0HTMLFeature.d.ts` для типізації Lexical серверного провайдера.
- [x] Додати декларації `.d.ts` для клієнтських та UI компонентів (`ImageCell.d.ts`, `BooleanCell.d.ts`, `MapCell.d.ts`, `PayloadCollectionTemplate.d.ts`).
- [x] Сконфігурувати `package.json` `exports` з підтримкою `types` для кожного subpath.
- [x] Написати контрактні тести для перевірки експортів v3.3.1.

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести (`task.spec.js`) успішно проходять (Green).
- [x] Всі експорти доступні та типізовані.
