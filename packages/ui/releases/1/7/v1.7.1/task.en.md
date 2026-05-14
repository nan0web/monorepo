# 📦 Release v1.7.1: UI Models Migration to Model-as-Schema (extends Model)

[Ukrainian Translation](task.md)

**🎯 Scope:** Refactoring / Architecture Alignment
- Replace manual `resolveDefaults(Model, data)` across 11 UI models with true inheritance `extends Model` from `@nan0web/core`.
- Remove instance field initializers to allow `super()` to work correctly (avoiding ES class gotcha).
- Maintain strict JSDoc typing via `/** @type {T} */ this.field` casting within constructors.
- Update `ui/adopt-agent` internal testing models (3 models) to match the new architecture.

**✔️ Acceptance Criteria:**
- All 11 primary UI models inherit strictly from `Model`.
- 3 test models inside `adopt-agent` inherit strictly from `Model`.
- Zero broken tests (`npm run test:all` -> 171 passing).
- `Knip` and `tsc` emit zero typings errors.

**Architecture Audit (Checklist)**:
- [x] ecosystem indexes read? Yes.
- [x] analogues exist? This enforces the single universal analogue.
- [x] Data sources format? N/A (Only logic/metadata).
- [x] Deep Linking UI standard? Untouched in the process.
