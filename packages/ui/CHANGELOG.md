# Changelog

## [1.12.4] — 2026-05-06

### Fixed
- **Changelog Integrity**: Restored missing `v1.12.2` release notes to maintain history continuity.
- **Model Exports**: Verified and standardized `./models` subpath export in `package.json` for ESM compatibility.
- **Docs Pathing**: Validated relative links in root `README.md` to ensure correct navigation to localized documentation.

## [1.12.3] — 2026-05-05

### Added
- **Inheritance-Aware Metadata**: Refactored `ModelAsApp` to use the new `@nan0web/types` `getMetadata` protocol. This ensures that sub-commands and help generation correctly identify static metadata from parent classes.
- **Direct Model Exports**: Exposed `./models` subpath in `package.json` to enable direct imports of UI models for improved developer experience and tree-shaking.
- **Multi-language Documentation**: Reorganized documentation into localized paths (`docs/en/`, `docs/uk/`) and added full Ukrainian translation.

### Fixed
- **Sub-Command Instantiation**: Fixed a bug where inherited sub-command definitions were ignored during application bootstrapping.
- **Positional Argument Resolution**: Enhanced `resolvePositionalArgs` to be inheritance-aware, correctly mapping arguments based on the full class hierarchy.
- **Namespace Collision**: Renamed UI component container from `Model` to `Models` to resolve collision with the base framework class.
- **Docs Rendering**: Fixed JSDoc parsing issues in `README.md.js` by isolating type comments on separate lines.

## [1.12.2] — 2026-05-04

### Added
- **SpecRunner Helper**: Introduced `SpecRunner.executeFile` in `@nan0web/ui/testing` to simplify `.nan0` story testing with automated DBFS initialization and scenario execution.
- **SpecAdapter Integration**: Enhanced `SpecAdapter` to support strict expectation validation during story runs.

## [1.12.1]

### Fixed
- **Typescript Typings:** Refined and fixed `JSDoc` types in `CoreApp`, `Widget`, and `View` to prevent implicit `any` and incompatibility errors downstream.

### Added
- **Workflow Sync:** Added global Agents Workflows into the package for AI consistency.

## [1.12.0]

### Added

- **Model-as-App (v2.1):** Enhanced `ModelAsApp` base class with built-in interpolation. Re-architected Intent generators (`ask`, `progress`, `show`, `render`, `result`) as strict typed standard functions.
- **Deterministic Scenario Testing:** Introduced `ScenarioAdapter` and `ScenarioTest` in `test/` for lightning-fast, zero-I/O edge-case test verification of complex domain interactions.
- **Full OLMUI HTML5 Typings:** Expanded `HTML5Elements` JSDoc dictionary in `Content.js` to include exhaustive support for standard HTML5 and base SVG elements with zero runtime cost.
- **Model-as-Schema Casing Standard:** Officially documented `camelCase` as the single canonical standard for all multi-word tags (`featureGrid`, `profileDropdown`) in `.nan0` data payloads (translated into HTML kebab-case strictly by View Adapters like `@nan0web/ui-lit`).

### Fixed

- **Typescript Circularity:** Resolved `TS2502` circular dependency crash by preventing type intersection overlap (`button`, `input`, `select`) in `CoreUIElements` and `HTML5Elements`.

### Removed

- **Legacy E2E Suite:** Purged `playwright.config.js`, `test/e2e` suite, and `ssg.test.js`. DOM testing is explicitly removed from the raw `@nan0web/ui` base package to strictly enforce the pure Domain Logic (OLMUI Model-as-Schema) boundary. Visual tests belong exclusively to View Adapters.
