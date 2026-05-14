---
version: 1.0.3
type: refactor
status: active
locale: en
models: []
---

[🇺🇦 Українська](./task.md) | [🇬🇧 English](./task.en.md)

# 🚀 Mission: Core Refactoring and String Initialization

## 🏁 Overview
Systematic style refactoring (single quotes instead of double), migration of dependencies to `workspace:*`, and enabling fast parsing directly via the Markdown constructor.

## 👥 User Stories
> As a developer, I want to pass a String argument to the `Markdown` constructor and obtain a fully parsed document immediately, without needing to explicitly call the `.parse()` method.

## 🏗 Data-Driven Architecture (Models)
No changes.

## 🎯 Scope
- [x] Replace double quotes with single quotes across the package.
- [x] Update internal dependencies in `package.json` to use `workspace:*`.
- [x] Allow `string` to be passed into the `Markdown` constructor for immediate parsing.

## ✅ Acceptance Criteria (DoD)
- [x] Contract tests (`task.test.js`) are passing (Green).
- [x] `npm run test:all` executes successfully.
