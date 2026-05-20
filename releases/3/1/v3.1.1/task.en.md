---
version: 3.1.1
type: bugfix
status: planning
locale: en
models: []
---

# 🚀 Mission: E5-Instruct Embedding Prefix Integration & Contextual Chunking

[Ukrainian version](task.md)

## 🏁 Overview
The purpose of this release is to optimize the semantic search quality in the monorepo knowledge base. We introduce automatic `"query: "` and `"passage: "` prefixing for the `text-embedding-multilingual-e5-large-instruct` model inside the `Embedder` class, and enrich text chunks with contextual metadata (filename, section hierarchy) before generating embeddings.

Remove `.editorconfig` inside packages and apps instead of the root in monorepo.


## 👥 User Stories
- **As a developer (User Space)** searching via `SearchSourcesIntent`, I want to receive precise, contextually relevant search results without excessive noise, as queries are automatically prefixed for the instruct model.
- **As an indexer user**, I want indexed chunks to retain metadata about their source (filename, section name), even when they are split into paragraphs, so that vector search can associate them via context.

## 🏗 Data-Driven Architecture
1. **`Embedder`**: adds parameterized support for prefixing `{ type: 'query' | 'passage' }` for `e5` family models.
2. **`MarkdownIndexer`**: adapts `embedBatch` calls with prefix `'passage'`, and enriches each chunk's text with file context prior to embedding.
3. **`SearchSourcesIntent`**: adapts the `embed` call with prefix `'query'`.

## 🎯 Scope
- [x] Add support for `{ type }` options to the `embed` and `embedBatch` methods of the `Embedder` class.
- [x] Update `MarkdownIndexer.js` to use `embed` / `embedBatch` with type `'passage'` and add chunk text enrichment with file context.
- [x] Update `SearchSourcesIntent.js` to use `embed` with type `'query'`.

## ✅ Acceptance Criteria (DoD)
- [x] Contract tests (`task.spec.js`) are written and pass successfully (Green).
- [x] The `Embedder` model with custom `fetch` correctly verifies query/passage prefixing for E5 models.
- [x] Monorepo build and test suite remain clean.
- [x] Only one `.editorconfig`
