---
version: 1.7.4
type: bugfix
status: done
locale: en
models: []
---

[Українська](task.md)

# 🚀 Mission: NaN0 Multiline Array Fix & Model Refactoring

## 🏁 Overview

Fixing a critical bug in `NaN0.stringify()` where multiline strings in objects inside arrays lose their `|` marker. Also includes the migration of `Model` to `domain/` and strict typing for `ModelOptions`.

## 👥 User Stories

> As a developer, I want to serialize arrays with multiline strings via `NaN0.stringify()` so that they can be correctly parsed back via `NaN0.parse()` without missing colon errors.

## 🏗 Data-Driven Architecture

Not applicable (updating existing entities).

## 🎯 Scope

- [ ] Fix `NaN0.addArrayItemToNode()`: append `|` (`MULTILINE_START`) for multiline strings in array values.
- [ ] Integration of `Model` changes in `domain/Model.js` and verify JSDoc for `TFunction`.
- [ ] Ensure `test:all` passes successfully with the new changes.

## ✅ Acceptance Criteria (DoD)

- [ ] **Contract tests** (`task.spec.js`) written and passing (Green).
- [ ] **Model-as-Schema**: No JS class fields usage. Only JSDoc typing inside `constructor()` and metadata in `static`.
- [ ] **Data Architecture**: No `fs.readFileSync` for business data (DB-FS only).
- [ ] **Architecture Check**: Checked for duplication (`index.md` read).
