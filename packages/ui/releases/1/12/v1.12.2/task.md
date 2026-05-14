---
version: 1.12.2
type: feature
status: done
locale: uk
models: []
---

[English](task.en.md)

# 🚀 Mission: SpecRunner executeFile Helper (Patch Release)

## 🏁 Overview (Огляд)

Впровадження `static async executeFile` до `SpecRunner.js` в `@nan0web/ui/testing`. Цей новий хелпер значно спрощує тестування `.nan0` специфікацій (stories) по всьому воркспейсу, автоматично парсячи `.nan0` файли тестів, знаходячи відповідний сценарій та виконуючи внутрішній генератор `for await`.

## 👥 User Stories (Сценарії)

> Як розробник, я хочу викликати `SpecRunner.executeFile(import.meta.dirname, 'store.story.nan0', 'list-md', { StoreApp })`, щоб швидко виконувати тести `.nan0` без повторення коду (DBFS ініціалізація та цикли) у кожному тесті.

> Як архітектор, я хочу мати автоматичну строгу перевірку очікувань через `SpecAdapter.js`, щоб не писати ручні асерти на кожен `ask` чи `show`.

## 🏗 Data-Driven Architecture (Моделювання)

- Моделі не створюються.
- Розширення `SpecRunner` статичним методом.

## 🎯 Scope (Задачі)

- [x] Реалізувати `static async executeFile` в `SpecRunner.js`.
- [x] Оновити `README.md.js` та перекласти документацію.

## ✅ Acceptance Criteria (DoD)

- [x] **Контрактні тести** (`task.spec.js`) написані і успішно проходять (Green).
- [x] **Model-as-Schema**: Дотримано стандартів архітектури.
- [x] **Data Architecture**: DBFS інтегровано всередині методу `executeFile`.
- [x] **Architecture Check**: Оновлено документацію `src/README.md.js` та `docs/uk/README.md`.
