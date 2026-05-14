# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-06
### Added
- TypeScript Stabilization: Resolved `TS5055` overwrite errors and fixed `NodeNext` ESM module resolution.
- Living Docs Manifest: Implemented `README.md.js` as the single source of truth for multi-language documentation and AI datasets.
- `ProvenDocsAuditor`: New inspector model to verify documentation integrity, translations, and artifact paths.
- Workflow `provendocs.md`: Procedure for documentation verification and strict structural audit.
- Workflow `translatedocs.md`: Procedure for AI-assisted documentation translation (paragraph-by-paragraph).
- Support for internal anchors (`#anchor`) in Markdown links.
- Slugify Stability: Standardized anchor generation for headings and link normalization.
- Case-insensitive anchor validation: Link anchors are now correctly matched against headers regardless of casing or special characters.
- Deep Indexing refinement: Ensured comprehensive cross-file anchor validation during project-wide documentation audits.
- Mandatory documentation structure: `docs/[lang]/index.md`, `docs/[lang]/README.md`, and language manifest.
- New scripts: `pnpm test:docs` and `pnpm translate:docs`.

### Fixed
- Nested inline formatting: Fixed rendering of bold/italic elements containing links.
- HTML Indentation: Cleaned up output by filtering empty space elements in stringification.
- `MDSpace`: Updated `toHTML` to return empty string to prevent double newlines in SSR output.

## [1.0.3] - 2026-04-20
### Refactored
- Structural formatting updates: transition from double quotes `"` to single quotes `'`.
- `Markdown` class constructor now accepts direct `string` arguments for rapid inline parsing.
- HTML stringification logic refactored to delegate to `MDElement#toHTML({ indent: })` for standardized template generation.
- Internal dependencies (`@nan0web/*`) migrated to `workspace:*` references for monorepo consistency.

## [1.0.2]
### Fixed
- Fixed playground initialization issues due to unpublished dependencies.
### Added
- Default value for constructor implemented.
- Type errors in JSDoc corrected.

## [1.0.1]
### Refactored
- Transformed `MDElement` into a trusted knowledge model with dynamic tag definitions and comprehensive test coverage.

## [1.0.0]
### Added
- Initial core release of `@nan0web/markdown` package.
- Native parsing support for `MDSpace` and nested Markdown blocks within code.
- System LLM instructions added.
