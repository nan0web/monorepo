# Task: Plugin-First Bootstrap (Race Condition Fix)

> **Package:** `@nan0web/ui-cli` v3.5.0
> **Пов'язано з:** `apps/payload_cms.app` bug — `SeedApp` не отримував `payload` з плагіна `withPayload`

## Problem

У `bootstrapApp.js` (L351-356) модель будувалась через `modelFromArgv` **до** запуску плагінів:

```js
// BEFORE (broken order):
const appOptions = { db, ..., ...config }
const model = modelFromArgv(FinalModel, appArgv, appOptions)  // ← модель вже створена
for (const plugin of appOptions.plugins) {                    // ← payload записується тут
  await plugin(appOptions)                                    //   але model вже заморожено
}
```

Будь-який плагін, що мутує `appOptions` (наприклад, `appOptions.payload = payload`),
не впливав на вже сконструйовану модель.

## Fix

Перенести `modelFromArgv` після циклу плагінів:

```js
// AFTER (correct order):
const appOptions = { db, ..., ...config }

for (const plugin of appOptions.plugins ?? []) {
  await plugin(appOptions)                   // ← payload, token тощо — вже є в appOptions
}

const model = modelFromArgv(FinalModel, appArgv, appOptions)  // ← модель бачить все
```

## Target Files

### MODIFY `packages/ui-cli/src/ui/bootstrapApp.js` (L350-356)

```diff
 const adapter = new CLiInputAdapter({ console, t })
 const appOptions = { db, logger: console, t, adapter, locale: lang, ...config }
-const model = modelFromArgv(FinalModel, appArgv, appOptions)
 
-for (const plugin of appOptions.plugins) {
+for (const plugin of appOptions.plugins ?? []) {
   await plugin(appOptions)
 }
+
+const model = modelFromArgv(FinalModel, appArgv, appOptions)
```

> **Бонус:** `?? []` захищає від падіння, коли `plugins` не передано в `config`.

## Tasks
- [ ] Застосувати diff у `bootstrapApp.js`
- [ ] Запустити snapshot-suite: `pnpm run test` у `packages/ui-cli`
- [ ] Запустити `pnpm run test:all` у `packages/ui-cli`
- [ ] Перевірити `node bin/app.js seed` у `apps/payload_cms.app`
- [ ] Bump version 3.4.0 → 3.5.0 у `packages/ui-cli/package.json`

## Acceptance Criteria
- [ ] `node bin/app.js seed` у `apps/payload_cms.app` стартує без `Error: Payload instance ($payload) is required`
- [ ] Всі snapshot-тести проходять (golden masters — без регресій)
- [ ] `appOptions.plugins ?? []` — `bootstrapApp` не падає якщо `plugins` не передано
- [ ] `withPayload` plugin коректно ініціалізує `payload` з готовим `db`
