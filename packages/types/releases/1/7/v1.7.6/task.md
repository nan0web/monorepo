---
version: 1.7.6
type: feature
status: done
locale: uk
models: ['AuditorModel']
---

# 🚀 Mission: Inheritance-Aware Metadata Protocol

## 🏁 Overview (Огляд)

Забезпечення надійної роботи метаданих (`defaults`, `aliases`, `validation`) в ієрархічних моделях NaN•Web. Виправлення проблеми "сліпоти" до успадкованих полів, що спричиняє некоректну типізацію CLI-аргументів та ініціалізацію моделей.

## 🏗️ Data-Driven Architecture (Моделювання)

Впроваджується `getMetadata(Class)` — утиліта для рекурсивного збору статичних полів через `Object.getPrototypeOf`.
Це дозволяє дочірнім класам успадковувати метадані батьків, зберігаючи можливість перевизначення.

## 🎯 Scope (Задачі)

- [x] Створити `src/utils/getMetadata.js` для обходу ланцюга прототипів (Parent -> Child).
- [x] Рефакторинг `resolveDefaults.js`: інтеграція `getMetadata` та нормалізація типів (boolean/number).
- [x] Рефакторинг `resolveAliases.js`: інтеграція `getMetadata`.
- [x] Рефакторинг `resolveValidation.js`: інтеграція `getMetadata`.
- [x] Оновити `@nan0web/ui` (`ModelAsApp`, `resolvePositionalArgs`) для підтримки успадкування.

## ✅ Acceptance Criteria (DoD)

- [x] **Контрактні тести** (`task.spec.js`) проходять (Green).
- [x] `resolveDefaults` коректно збирає поля з батьківських класів.
- [x] Рядки `'0'` та `'1'` нормалізуються у `false` та `true` відповідно.
- [x] Порожні рядки `''` для числових полів нормалізуються у `0`.
- [x] Всі існуючі тести (`npm test`) залишаються зеленими.
