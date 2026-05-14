# Task: Universal Interaction API (The `ask()` Revolution)

## Goals
- **Radical Minimalist API**: Unify all platform actions under a single polymorphic `ask()` function.
- **Eliminate Redundancy**: Removed `execute()` and redundant CLI render helpers in favor of a universal bridge.
- **Polymorphic Execution**: `ask()` now handles Strings, Components, OLMUI Intents, and **Model Classes**.
- **Model-as-Form Support**: Passing a Class to `ask()` automatically generates and processes an interactive form.
- **Agent Integration**: Standardized `agent()` intent helper for subagent task delegation.

## Tasks
- [x] Finalize polymorphic `ask()` engine (Strings, Components, Intents, Models).
- [x] Resolve ContentViewer form submission regression.
- [x] Unify ecosystem interaction under `ask()` and `agent()` verbs.
- [x] Fix `play/` demos broken imports and interaction logic.
- [x] Verify architecture stability with full test suite (203/203) and play tests (14/14).

## Acceptance Criteria
- [x] CLI `index.js` exports `ask` as the universal executor.
- [x] CLI `index.js` exports `agent` intent helper.
- [x] `ask()` handles string prompts (legacy support).
- [x] `ask()` handles Interactive Components (Prompts).
- [x] `ask()` handles Intent objects (render, show, agent, result).
- [x] `ask()` handles Model Classes by generating and processing forms.
- [x] `src/README.md.js` examples migrated to `ask()` standard.
- [x] All tests pass (100% regression + 100% playground).
