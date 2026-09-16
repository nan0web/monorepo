---
version: 3.2.0
type: feature
status: in_progress
locale: en
models: []
---

# 🚀 Mission: OLMUI Theming Standard & Automated Style Auditor

## 🏁 Overview
This release introduces the new OLMUI theming architecture based on the ultra-short `--0-` CSS variables prefix and implements the automated `OlmuiThemingAuditor` to prevent hardcoded colors, sizes, paddings, margins, and animations in components.

## 👥 User Stories
- **As a Developer**, I want to use a short and convenient CSS variable naming convention starting with `--0-` (e.g. `--0-bg-primary`) so that components can scale gracefully across Light, Dark, and High Contrast themes.
- **As a Contributor**, I want to receive real-time warnings during building/testing if I accidentally introduce hardcoded design tokens (such as `#ffffff` or `12px` instead of using the variables with fallbacks).

## 🏗 Data-Driven Architecture
We introduce `OlmuiThemingAuditor` which:
*   Extends `AuditorModel` from `@nan0web/inspect`.
*   Scans component files asynchronously using `this._.db.browse('@app/src')`.
*   Implements native English late-bound localization via `static.UI`.

## 🎯 Scope
- [ ] Add English translation of the theming architecture documentation to `docs/en/theming-architecture-plan.md`.
- [ ] Implement `OlmuiThemingAuditor` class.
- [ ] Write integration and unit tests for `OlmuiThemingAuditor`.
- [ ] Apply theming validation to the demo application files.

## ✅ Acceptance Criteria (DoD)
- [ ] **Contract tests** (`OlmuiThemingAuditor.test.js`) are written and pass successfully (Green).
- [ ] The auditor correctly flags un-themed colors, measurements, and layouts.
- [ ] Zero hardcoded variables are present in the core demo components (`DemoCounter`, `DemoUserProfile`).
