---
version: 1.7.5
type: feature
status: done
locale: en
models: []
---

# 🚀 Mission: Testing and Improving resolveDefaults

- [Ukrainian version](./task.md)

## 🏁 Overview
This release focuses on ensuring the stability and predictability of the `resolveDefaults` utility. The primary goal is to guarantee proper metadata handling, automatic type inference, and correct value normalization (Type Casting) based on static class fields.

## 👥 User Stories
> As a NaN•Web developer, I want `resolveDefaults` to automatically cast input data to the correct type (number, string, boolean) based on field metadata or default values, to avoid type errors in application logic.

## 🏗 Data-Driven Architecture
No new models are created in this release. We are testing and improving the existing `resolveDefaults` utility.

## 🎯 Scope
- [x] Write contract tests for `resolveDefaults` (`task.spec.js`).
- [x] Verify default value initialization.
- [x] Verify automatic `expectedType` inference from the `default` value.
- [x] Verify explicit `type` definition in metadata.
- [x] Verify normalization (casting) for types: `number`, `string`, `boolean`.
- [x] Verify handling of `null` and `undefined` values.

## ✅ Acceptance Criteria (DoD)
- [x] Contract tests (`task.spec.js`) are written and passing (Green).
- [x] Full coverage of normalization scenarios (string -> number, "true"/"false" -> boolean, etc.).
- [x] No regressions in existing package tests.
