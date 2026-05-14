# v1.2.0 — Extended FormInput Types

> **Scope**: Публікація розширених типів `FormInput.TYPES` на npm.  
> **Date**: 2026-02-16

## Місія

`FormInput.TYPES` в локальному коді вже містить розширені типи:
`password`, `secret`, `mask`, `confirm`, `toggle`, `multiselect`, `autocomplete`.

Але npm `@nan0web/ui@1.1.0` має лише 6 базових:
`text`, `email`, `number`, `select`, `checkbox`, `textarea`.

Це спричиняє `TypeError: FormInput.type is invalid!` у консюмерів.

## Scope

1. Розширені типи у `FormInput.TYPES` (вже реалізовано в `src/core/Form/Input.js`)
2. Виправлення docs-тестів (сумісність з `db-fs` Markdown-as-Data)
3. Bump версії до `1.2.0` (minor — новий enum additive)
4. Усі тести pass (`test:all`)

## Acceptance Criteria

- [ ] `FormInput.TYPES` містить 13 типів: text, email, number, select, checkbox, textarea, password, secret, mask, confirm, toggle, multiselect, autocomplete
- [ ] Кожен тип створює валідний `FormInput` без `TypeError`
- [ ] `package.json` version = `1.2.0`
- [ ] `npm run test` — pass
- [ ] `npm run test:docs` — pass
- [ ] `npm run test:play` — pass
- [ ] `npm run build` — pass

## Architecture Audit

- [x] Прочитано індекс екосистеми (`packages/index.md`)
- [x] Аналоги відсутні — `@nan0web/ui` є єдиним джерелом `FormInput.TYPES`
- [x] Запит створено в `REQUESTS.md` від `@nan0web/ui-cli`
- [x] Зміни additive — зворотна сумісність збережена
