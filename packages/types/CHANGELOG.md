# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.6] - 2026-05-05

### Added
- **Inheritance-Aware Metadata**: Refactored `getMetadata` to traverse the prototype chain from Parent to Child, preserving natural field declaration order and enabling seamless metadata inheritance.
- **Reserved Property Support**: Enabled support for `static name` and `static length` as metadata fields while still skipping default class properties.
- **Normalization**: Standardized type casting for `boolean` ('0'/'1') and `number` ('') across the Model ecosystem.
- **Architectural Alignment**: Synchronized `@nan0web/ui` and `@nan0web/ui-cli` to use the unified metadata collector for subcommand instantiation and positional argument resolution.
- **Full details**: [releases/1/7/v1.7.6/task.md](releases/1/7/v1.7.6/task.md)

## [1.7.5] - 2026-05-05

### Added
- **resolveDefaults**: Integrated comprehensive contract tests to ensure stable metadata handling and type inference.
- **Normalization**: Enhanced boolean casting to support `'0'` and `'1'` strings (mapping to `false` and `true` respectively), improving compatibility with web forms and CLI inputs.
- **Full details**: [releases/1/7/v1.7.5/task.md](releases/1/7/v1.7.5/task.md)

## [1.7.4] - 2026-05-02

### Fixed
- **NaN0 Parser**: Fixed a critical bug in `NaN0.stringify()` where multiline strings within array objects lost their `|` marker, causing parsing errors.
- **Model Refactoring**: Moved `Model` class to `src/domain/Model.js` and enforced strict JSDoc typization for `ModelOptions`.
- **Full details**: [releases/1/7/v1.7.4/task.md](releases/1/7/v1.7.4/task.md)

## [1.7.3] - 2026-04-26

- **Types**: Made the second argument (`arg1`) of `TFunction` optional to prevent TypeScript errors when calling `t('key')` without parameters.
- **Parser**: Added line number (`lineNum`) and surrounding context to `invalid indent` parsing errors, improving the debuggability of the `NaN0` format.
- **Model Architecture**: Integrated a default fallback for the `t` (translation) function in `ModelOptions` that dynamically replaces `{key}` tags with provided parameters when `i18n` is not fully initialized.
- **Full details**: [releases/1/7/v1.7.3/task.md](releases/1/7/v1.7.3/task.md)

## [1.7.2] - 2026-04-14

### Fixed
- **NaN0 Parser & Serializer**: Fixed state machine transitions to support nested arrays inside array structures.
- **Empty Collections**: Enhanced stringifier and parser logic to reliably support empty objects `{}` and arrays `[]` inside deeply nested collections.
- **Multiline Strings**: Added support for proper parsing and serialization of multiline strings (`|`) when embedded directly as array items.
- **Documentation**: Restored the missing `Model` section in the Ukrainian `README.md` and updated property rendering.
- **Full details**: [releases/1/7/v1.7.2/task.md](releases/1/7/v1.7.2/task.md)

## [1.7.1] - 2026-04-06

### Refined
- **Model Architecture**: Decoupled `db` from built-in getters to prevent shadowing when used as a data property.
- **Developer Ergonomics**: Added `setData()` method for incremental updates with alias resolution.
- **TFunction Introspection**: Integrated `TFunction` type into `ModelOptions` for seamless i18n support in domain models.
- **String Shorthand**: `new Model('text')` maps to `{ UI: 'text' }` for CLI/Chat inputs.
- **Array Aliases**: `resolveAliases` now supports `alias: ['name', 'n']` for multi-alias fields.
- **Build Hygiene**: `build` script cleans `types/` before `tsc` to prevent stale `.d.ts`.
- **Full details**: [releases/1/7/v1.7.1/task.md](releases/1/7/v1.7.1/task.md)

## [1.7.0] - 2026-03-29

### Added
- **Model class**: Introduced `Model` base class in `src/Model.js` for centralized domain logic (Model-as-Schema). Supports automatic default resolution, alias mapping, and schema-driven validation.
- **TypeScript support**: Added `types/Model.d.ts` and updated exports in `types/index.d.ts`.

### Fixed
- **Parser stability**: Restored `readIndent()` call in `Parser.scanLines` to ensure consistent indentation tracking, fixing `DocsParser` documentation generation for derived packages.
- **JSDoc documentation**: Corrected `ModelError` import path in `Model.js` JSDoc for better IDE support.

## [1.6.0] - 2026-03-26

### Added
- **VS Code Extension**: Built-in `nan0-vscode` extension with syntax highlighting (TextMate grammar) and document formatting via `NaN0.parse` + `NaN0.stringify` round-trip.
- **Build Pipeline**: esbuild bundling to single 15.9 KB CJS file, VSIX packaging (9.39 KB).
- **Documentation**: Table of Contents in README, VS Code Extension section (EN + UK), Marketplace README.

### Changed
- **NPM Isolation**: `src/ui/vscode/**` excluded from NPM tarball via `files` array.
- **TSConfig**: `src/ui/vscode/**` excluded from TypeScript checking (separate build pipeline).
- **Knip**: `src/ui/vscode/**/*` added to ignore list.
- **Full details**: [releases/1/6/v1.6.0/task.md](releases/1/6/v1.6.0/task.md)

## [1.4.1] - 2026-03-25

### Changed
- **Schema-Aware Parsing**: NaN0 format now infers types (e.g., `String` over `Number`) from `Body` static schemas. 
- **Bug Fix**: Fixed top-down comment extraction order for NaN0 objects with 3+ keys.
- **Documentation**: Split README into modular `docs/en` and `docs/uk`, including deep benchmarking vs JSON & YAML.
- **Full details**: [releases/1/4/v1.4.1/task.md](releases/1/4/v1.4.1/task.md)

## [1.4.0] - 2026-03-24

### Added
- **TFunction Contract**: Centralized `createT` export for robust `t(key, vars)` localization.
- **Symmetrical i18n Validation**: Refactored `ModelError` to support `TFunction` injection natively.
- **Full details**: [releases/1/4/v1.4.0/task.md](releases/1/4/v1.4.0/task.md)

## [1.0.0] - 2025-08-04
### Added

- NANO format parser and stringifier for structured data storage
- ContainerObject class for managing nested object hierarchies
- Type conversion utilities (`to`, `typeOf`, `functionOf`)
- Deep merge utility with unique array merging option
- Deep clone utility with circular reference handling
- Validation helpers (`Enum`, `match`, `oneOf`, `empty`, `notEmpty`, `equal`)
- FullObject, UndefinedObject, NonEmptyObject, and ObjectWithAlias classes
- Comprehensive test suite with 82 tests
