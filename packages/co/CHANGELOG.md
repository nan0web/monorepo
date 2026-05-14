# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-04-09
### Fixed
- Addressed ES build issues with redundant `types` inclusion during recursive tests.
### Changed
- Refactored `StackDetector` to decouple from `.protocol` layer returning its core utilities back to `@nan0web/inspect`.
- Enforced monotonic dependency normalization using workspace resolutions (`workspace:*`).
- Cleaned stylistic formatting patterns via deep Prettier traversal.
- Stabilized release testing architecture moving unit verification to internal spec testing.

## [2.0.0] - Prior
### Added
- Release 2.0.0

## [1.1.3] - Prior
### Fixed
- OutputMessage types updated.

## [1.1.2] - Prior
### Changed
- `@nan0web/test` dependency fix.
- Added static `Body` validation schema, enhance `Message.validate()`, deprecate `getErrors`, update docs, tests, and type definitions.

## [1.1.1] - Prior
### Added
- Added Types with documentation.

## [1.1.0] - Prior
### Added
- `Message` is extended with a `Body` to use it like a Schema for message bodies. `InputMessage`, `OutputMessage` added.
- Playground renamed to `play`.

## [1.0.2] - Prior
### Changed
- Exported function `str2argv`.

## [1.0.1] - Prior
### Changed
- Optimized npm package.

## [1.0.0] - Prior
### Added
- Release dev dependency added.
- `I18nMessage` added. Playground added.
- Documentation and types updated.
- `Chat` added. System.md added. Translations into Ukrainian and Greek.
- `Contact` added, Command moved, tests added.
- Added JSDoc.
- Table help output of arguments, options and subcommands.
- Escaped default string.
- Command improvements with subcommands, aliases and types `d.ts`.
- Command added and `CommandMessage` updated.
- Commit with husky.
- Initial version.
