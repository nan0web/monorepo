---
version: 1.7.6
type: feature
status: done
locale: en
models: ['AuditorModel']
---

# 🚀 Mission: Inheritance-Aware Metadata Protocol

## 🏁 Overview (Огляд)

Ensure robust metadata (`defaults`, `aliases`, `validation`) handling in NaN•Web hierarchical models. Fix the "blindness" issue to inherited fields, which causes incorrect CLI argument typing and model initialization.

## 🏗️ Data-Driven Architecture (Modeling)

`getMetadata(Class)` is introduced — a utility for recursive static field collection via `Object.getPrototypeOf`.
This allows child classes to inherit parent metadata while maintaining the ability to override.

## 🎯 Scope (Tasks)

- [x] Create `src/utils/getMetadata.js` for prototype chain traversal (Parent -> Child).
- [x] Refactor `resolveDefaults.js`: integrate `getMetadata` and add type normalization (boolean/number).
- [x] Refactor `resolveAliases.js`: integrate `getMetadata`.
- [x] Refactor `resolveValidation.js`: integrate `getMetadata`.
- [x] Update `@nan0web/ui` (`ModelAsApp`, `resolvePositionalArgs`) to support inheritance.

## ✅ Acceptance Criteria (DoD)

- [x] **Contract tests** (`task.spec.js`) passed (Green).
- [x] `resolveDefaults` correctly collects fields from parent classes.
- [x] Strings `'0'` and `'1'` are normalized to `false` and `true` respectively.
- [x] Empty strings `''` for numeric fields are normalized to `0`.
- [x] All existing tests (`npm test`) remain green.
