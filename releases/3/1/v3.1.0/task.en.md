---
version: 3.1.0
type: architecture
status: planning
locale: en
models: []
---

# 🚀 Mission: Dynamic Format Registry & Self-Contained Markdown Frontmatter

[Ukrainian version](task.md)

## 🏁 Overview
The goal of this release is to develop an instantiated and configurable serialization format registry system (`FormatRegistry`) in `@nan0web/db` with default sets for `db-fs` and `db-browser`. Also, we move the parsing and saving logic of frontmatter metadata (in `yaml` and `nan0` formats) directly into the `Markdown` class from the `@nan0web/markdown` package, while preserving full architectural isolation.

## 👥 User Stories
- **As an application developer (User Space)**, I want to connect arbitrary document formats (YAML, Markdown, CSV, etc.) dynamically via the database config `new DB({ formats })`, so that the frontend bundler does not drag in unnecessary dependencies.
- **As a database user**, when loading a `.md` file via `db.loadDocument('docs/guide')`, I want to immediately receive a ready-made identified `Markdown` class instance with automatically parsed frontmatter fields (in YAML or NAN0 format).
- **As a Markdown document developer**, I want the `Markdown` object to be able to read and write its metadata into frontmatter (default `nan0`) on its own, so that formatting integrity is preserved when calling `md.toString()`.

## 🏗 Data-Driven Architecture
1. **`FormatRegistry`**: A lightweight instantiated format registry for DB drivers.
2. **`DBFS` (db-fs)**: Automatically includes formats: `json`, `jsonl`, `txt`, `md`, `yaml`, `nan0`, `csv`, `csv0`.
3. **`DBBrowser` (db-browser)**: Automatically includes formats: `json`, `jsonl`, `txt`, `csv`.
4. **`Markdown`**: Gains built-in capabilities to recognize frontmatter (`---` or another marker) in `yaml` or `nan0` format, store this metadata in instance properties, and write it back upon serialization.

## 🎯 Scope
- [x] Create `FormatRegistry.js` in `@nan0web/db`.
- [x] Update `DBDriverProtocol` and `DB` to use `FormatRegistry` by default and support the `formats` parameter in the constructor.
- [x] Implement default format sets in `db-fs` and `db-browser` drivers.
- [x] Update the `Markdown` class in `@nan0web/markdown` for automatic parsing and generation of YAML/NAN0 frontmatter.
- [x] Fix broken tests in `packages/log/src/README.md.js`.

## ✅ Acceptance Criteria (DoD)
- [x] Contract tests (`task.spec.js`) are written and pass successfully (Green).
- [x] `FormatRegistry` successfully isolates serialization logic; the web build does not pull in `yaml` and `csv` libraries.
- [x] `Markdown` independently parses frontmatter (default `nan0`, optional `yaml`) and serializes it back.
- [x] The monorepo ecosystem is fully green (`pnpm test:all` passes successfully).
