# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2026-04-09
### Changed
- **Architecture (Lazy Evaluation):** Replaced `static DB = DB` with getter `static get DB()` in `AppCore` to solve initialization problems and avoid "Temporal Dead Zone" (TDZ) and circular dependencies during core module resolution.
- **Dependency Isolation:** Replaced relative imports in tests with direct and correctly mapped imports to prevent ESM circular reference crashes during `index.js` loading. Rebuilt `index.js` as an explicit re-export wrapper.
- **Version Hygiene:** Transitioned all internal `@nan0web/*` package cross-dependencies to `workspace:*` for deterministic and strict monorepo synchronization.
- **Package Hygiene:** Cleaned `package.json` build scripts and updated `tsconfig.json` correctly to exclude `types/**/*` avoiding `TS5055` overwrite lock loops during `test:all` execution. `knip.json` rules tightened for test isolation.

## [1.1.2] - 2026-03-29
### Changed
- **AppCore:** Improved inheritance stability of `.from()` method using polymorphic `new this(...)` strategy instead of fixed base class instances.
- **Model:** Delegated the entire class implementation of `Model` to `@nan0web/types`, acting only as an explicit re-export in the `core` package for backward-compatibility.

## [1.1.1] - 2026-03-18
### Added
- **Documentation:** Upgraded and formalized the "Golden Standard v2" rules emphasizing "Model as Schema" and "Model as App" within architectural principles.
- **System Documentation:** Appended English translations `system.md` for international architecture readers.
- **AppCore UI:** Introduced `CORE-12` `UI` metadata rules inside `@nan0web/core` and formalized the base refactoring (CORE-11).

## [1.0.5] - 2026-03-04
### Fixed
- Fixed packaging configuration to cleanly exclude `README.md.js` provenance testing files from standard npm package tarballs.

## [1.0.4] - 2026-03-04
### Changed
- Cleared dead code, cleaned up old stale typings for `registry/` and `system/` components.
- Established and verified ProvenDoc (Test-Driven README) stability logic.

## [1.0.3] - 2025-12-10
### Fixed
- Fixed `@nan0web/protocol` dependency resolution and structural bounds.

## [1.0.2] - 2025-12-09
### Changed
- Automated dependency resolution and internal package optimizations.

## [1.0.1] - 2025-10-23
### Added
- Standardized package structure and built initial minor runtime improvements.

## [1.0.0] - 2025-10-23
### Added
- Initial public release.
- Core Application (`AppCore`) interface and foundational `Model` layout.
- Basic bilingual documentation rules (`en`, `uk`).
