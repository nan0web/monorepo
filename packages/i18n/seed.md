# Seed: @nan0web/i18n

## Поточні Завдання (TS Fixes v1.6.0)

Після вирішення проблем у базових пакетах (`types`, `ui-cli`, `inspect`), необхідно усунути локальні помилки:
1. `src/domain/App.js`: Додати класи-заглушки для `InspectCommand` та `CompletionCommand` (наслідують `ModelAsApp`).
2. `src/domain/App.js` та `src/domain/I18nCliApp.js`: Метод `async *run()` повертає `yield { type: 'log', ... }`, що конфліктує зі строгим типом `Intent` (де `type: 'show'`). Додати `// @ts-expect-error` або виправити генератор.
3. `src/domain/Language.js:31`: Конструктор очікує `t` у `options`. Закастувати: `options = /** @type {any} */ ({})`.
4. `src/I18nDb.js`: Тип `EventBus` не імпортується з `@nan0web/event/types`. Вказати `@type {any}`.
5. `src/cli/sync.js:22`: Об'єкт `opts` не повністю сумісний із типами, очікуваними `syncModels`. Закастувати: `/** @type {any} */ (opts)`.
6. `src/domain/app/commands/Sync.js`: Не визначено `opts`. Додати перед викликом: `const opts = /** @type {any} */ ({})`.
7. `src/inspect/I18nInspector.js`: `locale` відсутнє у `ModelAsAppOptions`, а `db` може бути `undefined`. Додати кастування `/** @type {any} */ (this._).locale` та перевірку `if (!db)`.
