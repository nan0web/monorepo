# Release v1.7.0 — Model class & Parser Fix

## Scope
- [x] **Model class**: Added `Model` base class to `src/Model.js` and exported it from `index.js`.
- [x] **TypeScript**: Added `types/Model.d.ts` and updated `types/index.d.ts`.
- [x] **Parser Fix**: Restored `readIndent()` call in `Parser.scanLines` to fix `DocsParser` documentation generation in derived packages.
- [x] **Regression testing**: Created `src/Model.test.js` to verify the new class functionality.

## Acceptance Criteria
- [x] `Model` class correctly resolve defaults, aliases, and validation.
- [x] `Model` class provides access to options via `options` (autocomplete) and `_` (universal).
- [x] `Model` class allows `db` property in data by removing `get db()` getter.
- [x] `Parser` stable indentation via `readIndent`.
- [x] TypeScript types for `Model` correctly exported.
- [x] All 280+ tests pass (`npm run test:all`).

## Architecture Audit
- [x] Чи прочитано Індекси екосистеми? Так.
- [x] Чи існують аналоги в пакетах? `Model` централізує спільну поведінку для всіх доменних моделей NaN0Web.
- [x] Джерела даних: NaN0, JSDoc Metadata.
- [x] Чи відповідає UI-стандарту? Так, Model-as-Schema є основою OLMUI.
