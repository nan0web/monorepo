# Release v1.7.1 — Model Refinement & Types Cleanup

## Scope
- [x] **Model Architecture**: Decoupled `db` from built-in getters to prevent shadowing when used as a data property.
- [x] **ModelOptions typedef**: Formalized `ModelOptions` with JSDoc `@typedef` including `db`, `plugins`, `t` (TFunction).
- [x] **String data shorthand**: `new Model('text')` → `{ UI: 'text' }` for CLI/Chat string inputs.
- [x] **setData()**: Added `setData(data)` method for incremental updates with alias resolution.
- [x] **resolveAliases enhancement**: Support for array aliases (`alias: ['name', 'n']`).
- [x] **Build hygiene**: `build` script now cleans `types/` dir before `tsc` to prevent stale `.d.ts` files.
- [x] **TypeScript types**: Regenerated `types/Model.d.ts` with `ModelOptions` and `setData()`.
- [x] **devDependencies**: Added `@nan0web/db` as devDependency for proper JSDoc resolution.

## Acceptance Criteria
- [x] `Model` class does NOT have `get db()` — no more shadowing of data properties.
- [x] Options accessed exclusively via `model._` (private getter).
- [x] `ModelOptions` typedef includes `db`, `plugins`, `t`.
- [x] `resolveAliases` supports `alias: ['a', 'b']` array syntax.
- [x] `setData()` returns `this` for chaining.
- [x] `npm run build` produces clean `types/` without stale files.
- [x] All 40/40 tests pass (`npm run test:all`).
- [x] `knip --production` clean.
- [x] `pnpm audit --prod` — no vulnerabilities.

## Architecture Audit
- [x] Чи прочитано Індекси екосистеми? Так.
- [x] Чи існують аналоги в пакетах? `Model` — єдина базова модель для всіх доменних моделей NaN0Web.
- [x] Джерела даних: NaN0, JSDoc Metadata.
- [x] Чи відповідає UI-стандарту? Так, Model-as-Schema є основою OLMUI.
