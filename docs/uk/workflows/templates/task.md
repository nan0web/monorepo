---
version: 1.0.0
type: feature # feature | bugfix | refactor | architecture
status: active # planning | active | done
locale: uk
models: [] # Масив створюваних моделей Model-as-Schema (напр. ["TaskIntent"])
---

# 🚀 Mission: {Назва релізу}

## 🏁 Overview (Огляд)

{Короткий опис проблеми, контекст та очікуваний результат}

## 👥 User Stories (Сценарії)

- Як розробник, я хочу {дія}, щоб {результат}.

## 🏗 Data-Driven Architecture (Моделювання)

{Опис нових моделей/схем, їх статичних полів та інтерфейсів}

## 🎯 Scope (Задачі)

1. {Конкретна інженерна задача 1}
2. {Конкретна інженерна задача 2}
3. {Конкретна інженерна задача 3}

## ✅ Acceptance Criteria (Критерії прийомки)

- [ ] Контрактні тести `task.spec.js` проходять успішно (100% Green).
- [ ] Типи TypeScript та JSDoc проходять перевірку без генерації `.d.ts` (`tsc --project tsconfig.check.json`).
- [ ] Працює вітрина релізу `play.js` / веб-пісочниця з детермінованими даними `data/` (`.nan0`).
- [ ] Повний тестовий суїт пакету/проєкту не має регресій.
