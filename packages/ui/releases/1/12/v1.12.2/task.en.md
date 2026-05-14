---
version: 1.12.2
type: feature
status: done
locale: en
models: []
---

[Українською](task.md)

# 🚀 Mission: SpecRunner executeFile Helper (Patch Release)

## 🏁 Overview

Added `static async executeFile` to `SpecRunner.js` inside `@nan0web/ui/testing`. This new helper dramatically simplifies `.nan0` spec story testing across the workspace by automatically parsing `.nan0` test files, locating the corresponding scenario stream, and executing the internal `for await` generator loop.

## 👥 User Stories

> As a developer, I want to call `SpecRunner.executeFile` to execute `.nan0` spec stories quickly without DBFS boilerplate in every test.

## 🏗 Data-Driven Architecture

- No models created.
- `SpecRunner` extension.

## 🎯 Scope

- [x] Implement `static async executeFile` in `SpecRunner.js`.
- [x] Update `README.md.js` and documentation.

## ✅ Acceptance Criteria (DoD)

- [x] **Contract tests** (`task.spec.js`) are written and pass successfully (Green).
- [x] **Model-as-Schema**: Architecture standards followed.
- [x] **Data Architecture**: DBFS integrated properly within `executeFile`.
- [x] **Architecture Check**: Documentation updated.
