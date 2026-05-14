# API Reference: @nan0web/release

The core of the Anti-Gravity Release Protocol (AGRP) is built on several key classes that manage the lifecycle of release contracts.

## Scanner

The `Scanner` class is responsible for recursively searching your project for release contracts (`.spec.js` and `.test.js`).

### Methods
- `findSpecs(version?)`: Returns an array of `ContractEntry` for WIP specs.
- `findTests(version?)`: Returns an array of `ContractEntry` for closed tests from both `releases/` and `src/releases/`.
- `status()`: Returns the overall status of all release versions.
- `close(version?)`: Atomically renames specs to tests and moves them to `src/releases/`.

## MarkdownToTest

A utility to generate executable Node.js tests from Markdown release notes or task lists.

### Methods
- `generateTests(markdown)`: Parses the markdown and returns a string with `node:test` code.

## ReleaseDocument

Represents a single release document (Markdown file) with metadata.

## CLI Commands

The package provides a message-based CLI using `@nan0web/ui-cli`. 

- `InitCommand`: Sets up the `releases/` structure.
- `SpecCommand`: Runs active specs for a given version.
- `CloseCommand`: Finalizes a release (Specs -> Tests).
- `StatusCommand`: Displays a summary table of all releases.
- `DepsCommand`: Verifies and synchronizes project dependencies.
- `PublishCommand`: Handles the physical publication (GPG-signed).
