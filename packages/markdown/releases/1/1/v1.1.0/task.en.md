---
version: 1.1.0
type: feature
status: done
locale: en
models: ['ProvenDocsAuditor']
---

[Українська версія](task.md)

# 🚀 Mission: Markdown Stabilization & ProvenDocs Auditor

## 🏁 Overview

Finalizing the stabilization of the `@nan0web/markdown` package according to `seed.md`. Implementing an inspector for ProvenDocs and improving link handling and formatting.

## 👥 User Stories

- As a developer, I want to use internal anchors (#anchor) in documentation to create navigation within pages.
- As a developer, I want nested formatting elements (e.g., links inside bold text) to render correctly.
- As an architect, I want to automatically verify the integrity of ProvenDocs (translations, paths, artifacts) via `ProvenDocsAuditor`.
- As a user, I want to use the `provendocs` workflow, which uses language models to correctly generate scripts.
- As a user, I want to use the inspector to ensure the full documentation generation cycle is verified.
- The inspector should be primarily scripted, with minimal LLM usage (script-first approach).

## 🏗 Data-Driven Architecture

- **ProvenDocsAuditor**: Inspector model inheriting from `AuditorModel`. Verifies translations, correctness of `src/docs/**/*.md.js` paths, and artifact integrity.

## 🎯 Scope

- [x] **Inline Formatting**: Support links inside formatted text (Bold/Italic).
- [x] **Internal Anchors**: Implement support and resolution for `#anchor` in links.
- [x] **HTML Indentation**: Improve indentation when generating HTML.
- [x] **ProvenDocsAuditor**: Implement audit logic in `src/inspect/index.js` as per @todo.
- [x] **Workflows**: Add `provendocs.md` and `translatedocs.md` to the system.
- [x] **Slugify Stability**: Ensure Slug generation identity with `nan0web.app`.
- [x] **Case-insensitive Anchors**: Implement case-insensitive anchor validation.
- [x] **Living Docs Manifest**: Implement `README.md.js` as the source of truth for documentation and AI datasets.

## ✅ Acceptance Criteria (DoD)

- [x] Contract tests (`task.test.js`) pass.
- [x] `ProvenDocsAuditor` detects missing translations and incorrect paths.
- [x] Links with anchors render correctly in HTML.
- [x] Nested formatting (links in bold/italic) works without regex artifacts.
- [x] `ProvenDocsAuditor` uses `static UI` for all messages (late-bound i18n).
- [x] Audit implemented via scripting (minimum LLM).
- [x] Anchors are detected regardless of case and special characters.
- [x] `README.md.js` successfully generates documentation for all locales.
