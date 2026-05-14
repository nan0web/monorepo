# Seed: Agnostic Auditor Architecture & IconsAuditor Refactoring

## Problem Statement

`IconsAuditor` (пакет `@nan0web/icons`) порушує архітектурний стандарт **Agnostic Auditor → Language Adapter**, який вже встановлено у пакеті `@nan0web/inspect`.

### Поточний стан (❌ Порушення)

Базовий клас `IconsAuditor.js` має жорстку прив'язку до розширень `.js`/`.ts` у методі `_scanFiles()`. Це заважає використовувати аудитор для інших платформ (наприклад, Python).

### Еталонний патерн (✅ З `@nan0web/inspect`)

1. **AuditorModel** (base): агностичний контракт.
2. **Agnostic Auditor**: логіка "що перевіряти" (наприклад, `VerificationAuditor`).
3. **Language Adapter**: реалізація "як перевіряти" для конкретної мови (наприклад, `JsVerificationAuditor` для `.js`/`.story.js`).
4. **StackDetector**: маршрутизатор, який визначає платформу (`package.json` vs `pyproject.toml`) та повертає потрібний адаптер.

## Proposed Solution

1. **IconsAuditor (Agnostic Base)**:
   - Спадкувати від `AuditorModel`.
   - Впровадити абстрактний метод/геттер `get sourceExtensions()`.
   - Використовувати цей геттер у `_scanFiles()`.
2. **Adapters**:
   - Створити `js/JsIconsAuditor.js` з розширеннями `['.js', '.ts', '.jsx', '.tsx']`.
   - Створити `python/PyIconsAuditor.js` з розширеннями `['.py']`.
3. **StackDetector**:
   - Додати метод `getIconsAuditor()` для автоматичного підбору адаптера.
   - Видалити debug `console.log` (рядки 12, 15).
4. **Documentation**:
   - Оновити `inspect/seed.md`, зафіксувавши стандарт **Auditor Architecture**.

## Acceptance Criteria

- [ ] `IconsAuditor` не містить хардкоду розширень.
- [ ] Наявні адаптери для JS та Python.
- [ ] `StackDetector` коректно видає `IconsAuditor` для обох платформ.
- [ ] Очищено debug-логи у `StackDetector.js`.
- [ ] `inspect/seed.md` містить опис стандарту.

## Поточні Завдання (TS Fixes)
- Під час перевірки типів (`tsc` або суміжними інспекторами) виникає помилка `../icons/src/domain/IconsAuditor.js:46`. 
- **Дія**: У рядку 46 файлу `src/domain/IconsAuditor.js` один або декілька параметрів (або змінних) неявно мають тип `any`. Також можлива проблема з `this._.db` (типування `db`). Необхідно відкрити файл та додати правильні JSDoc типізації (`/** @type {any} */` або уточнити тип).
