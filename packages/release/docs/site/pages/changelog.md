# Changelog: @nan0web/release

The official history of the Anti-Gravity Release Protocol (AGRP) development.

## v1.0.3 — 2026-03-29
### Fixes
- Updated `@nan0web/ui` to `^1.8.0` and `@nan0web/ui-cli` to `^2.9.0` to resolve `MaskHandler` export issues.
- Fixed `Scanner` to properly handle version directory matching with `v` prefix.
- Removed unused `@nan0web/db-browser` dependency.

## v1.0.2 — 2026-03-03
### Enhancements
- Refactored `Scanner.js` to search for closed contracts in both `releases/` and `src/releases/`.
- Updated `InitCommand` to use nested structure: `releases/{major}/{minor}/v{version}/`.
- Redesigned `ReleaseCLi` with message-based architecture for better async flow and UX.
- Improved JSDoc typization and passed full `knip` audit.

## v1.0.0
### Initial Release
- Core Release Protocol implementation.
- `spec` and `test` lifecycle: planning -> spec (WIP) -> test (Closed).
- Mandatory `GPG` signing integration for immutable releases.
- Native `node:test` integration for zero-dependency contract verification.
