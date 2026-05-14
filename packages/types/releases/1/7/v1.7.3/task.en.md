---
version: 1.7.3
type: bugfix
status: active
locale: en
models: []
---

[🇺🇦 Українська версія](task.md)

# 🚀 Mission: Fix TFunction and Parser Error Context

## 🏁 Overview
Release v1.7.3 resolves TypeScript typing issues with `TFunction` (making the second argument optional), adds line context (`lineNum`, context) to parser errors for easier `NaN0` format debugging, and implements a basic fallback for the translation function `t` within the `Model` class (supporting `{key}` variable replacement).

## 👥 User Stories
> As a developer, I want to call `t('key')` without passing a second argument and not get TypeScript errors.
> As a developer, when the parser fails due to invalid indentation, I want to see the line number and its content for a quick fix.
> As a user of the base `Model`, I want the default `t` function to replace `{key}` tags with values without needing a full `i18n` package setup.

## 🎯 Scope
- [x] Make the `arg1` argument in `TFunction` optional.
- [x] Update `Parser.js` and `scanLines` to throw detailed errors including `lineNum` and preceding lines context.
- [x] Update the base `Model` to support `{key}` replacement in the default `t` function.

## ✅ Acceptance Criteria (DoD)
- [x] Contract tests (`task.spec.js`) are written and pass successfully (Green).
- [x] `TFunction` does not require the second argument in `.d.ts`.
- [x] CHANGELOG.md is updated.
