# @nan0web/monorepo

> **🧭 FUNDAMENTAL**: Before diving in, read the [SYSTEM.md](SYSTEM.md).
> It contains the **Philosophy of Will**, Coding Standards, and Lux-Level Protocols used across all projects.

## 🌐 Vision: One Logic, Many UI

NanoWeb is a universal engine where business logic (models, validation, algorithms) is strictly decoupled from its presentation.

- **Pure Logic**: Models and services are platform-agnostic.
- **Multi-UI Adapters**: The same logic drives CLI, Web (React/Lit), Chat, and Voice interfaces.
- **Living Documentation**: Documentation is derived directly from tests (like this README), ensuring it never goes stale.

## 🏛️ Architecture

The monorepo is organized into specialized layers:

- **`apps/`**: Consumer applications (e.g., `nan0web.app`, `llimo.app`).
- **`packages/`**: Core libraries and UI adapters.
  - `ui-core`: Framework-agnostic UI logic.
  - `ui-cli`: Premium terminal interface with "Lux-level" aesthetics.
  - `db-fs`: Document-based filesystem database.
  - `i18n`: Hierarchical translation engine.

This document is available in other languages:

- [Ukrainian 🇺🇦](./docs/uk/README.md)

## Installation

How to install with npm?

```bash
npm install @nan0web/monorepo
```

How to install with pnpm?

```bash
pnpm add @nan0web/monorepo
```

How to install with yarn?

```bash
yarn add @nan0web/monorepo
```

## Applications

- [LLiMo chat and developer application with the help of Ai](https://github.com/nan0web/llimo.app/)
- Auth.app - user authorization, registration and other standard auth features
- Editor.app - editing data, basically for nan0web projects

## Packages

Table of the packages and their status

<!-- %PACKAGE_STATUS% -->

Statuses are updated on every git push

## Contributing

How to contribute? [check here](./CONTRIBUTING.md)

## License

How to license? See the [ISC LICENSE](./LICENSE) file.
