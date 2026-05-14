# @nan0web/ui-react — Project Architecture

> Version: 1.2.0 (The Great Stabilization)

## 🌐 Vision

The goal is to provide a zero-dependency React UI library that follows the **OLMUI (One Logic — Many UI)** and **Model-as-Schema v2** philosophy.
It enables building data-driven interfaces where content is defined in YAML/JSON and automatically rendered into high-performance React components.

## 🏛️ Monorepo Orchestration

This package is part of the `nan0web` ecosystem:

- **@nan0web/core**: Base Model class and validation engine.
- **@nan0web/ui**: Shared CSS tokens and design system constants.
- **@nan0web/ui-cli**: Command-line interface standard for shared Models.
- **@nan0web/i18n**: Multi-language support and Model extraction.

## 🧬 Architecture

- **Domain Layer (`src/models/`):** Pure JSDoc-typed classes extending `Model`.
- **UI Layer (`src/components/`):** React components consuming Models and `UIContext`.
- **Logic Isolation:** Components have zero external UI dependencies (no Bootstrap/MaterialJS).
- **Dot-Notation Styling:** Compact variation descriptions (e.g., `Alert.warning.lg`).

## 🛠️ Five Phases of Development

1.  ✅ **Phase 1: Seed** — Analysis and requirement formalization.
2.  ✅ **Phase 2: Model** — Data structure and schema (v2).
3.  ✅ **Phase 3: Contract** — TDD and regression stability (255 tests).
4.  ✅ **Phase 4: Adapter** — Component implementation.
5.  🚧 **Phase 5: Release** — Documentation and ecosystem integration.

## 🕹️ Playground & Sandbox

Run the local development environment:
```bash
npm run play
```

Run the documentation site:
```bash
npm run docs:dev
```
