# Changelog

All notable changes to `@nan0web/ui-react` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-02-25

### ⚠ BREAKING CHANGES

- **Removed `react-bootstrap`** — zero UI framework dependencies. All components now use pure HTML + Bootstrap CSS Custom Properties (−97 kB / −29 kB gzip).
- **Renamed `Callout` → `Alert`** — the `Callout` block is removed; use `Alert` instead.

### Added

- **Dot-Notation Syntax** — `Alert.warning.lg` is parsed as `<Alert className="warning lg" />` by the Element renderer. Each segment after the first dot becomes a CSS class.
- **Universal Blocks** — high-level documentation components (`Nav`, `Sidebar`, `Alert`, `Markdown`, `ThemeToggle`, `LangSelect`, `CodeBlock`, `Page`) exported from `src/Blocks/index.js`.
- **Doc Prop Pattern** — `Nav` and `Sidebar` blocks accept a `doc` object for dynamic YAML-driven content.
- **Alert className detection** — `Alert` auto-resolves variant (`warning`, `danger`, `success`, `info`) from `className` if no explicit `type` prop is provided.
- **Header component** (`src/components/organisms/Header/`) — full-featured responsive navigation bar built with native HTML, replacing the old `react-bootstrap` Navbar/Dropdown/Modal composition.
- **`useHeaderNav` hook** — pure-function `calculateNewPath` and React hook for multi-level dropdown state management.
- **`useSortableList` hook** — React wrapper over `@nan0web/ui` headless `SortableList` with optional `localStorage` persistence and `onChange` callback.
- **`Autocomplete` component** — searchable selection list with dropdown filtering.
- **`TreeView` component** — interactive hierarchical data visualization with expand/collapse, async loading, and multi-selection modes.
- **`renderAutocomplete`** and **`renderTreeView`** renderers registered in the renderer map.
- **Sandbox app** (`src/apps/sandbox/App.js`) — demonstration of TreeView, Autocomplete, Typography, and Buttons.
- **Playground** (`play/Playground.jsx`) — unified OLMUI catalog with live component examples and YAML previews.
- **`OlmuiInspector`** — visual CSS Custom Property inspector for the playground.
- **E2E tests** — Playwright specs for Sandbox and SortableList demos.
- **ProvenDocs README** (`src/README.md.jsx`) — 45 tests that generate `README.md` and LLM dataset with dual Data-Driven / React examples for every component.
- **Ukrainian README** (`docs/uk/README.md`) — full Ukrainian translation of the documentation.
- **CHANGELOG.md** — this file.

### Changed

- **`Element.jsx`** — dot-notation block now merges classes into `className` prop instead of setting `type` prop.
- **`UIContextValue`** — added `document` property for passing document data through context.
- **`Document` model** — added `$hideTitle` boolean.
- **`renderTypography`** — simplified props destructuring; fixed variant resolution.
- **`vite.config.js`** — build `outDir` changed to `../dist/`.
- **`vitest.setup.js`** — switched to explicit `expect.extend(matchers)` for `@testing-library/jest-dom`.

### Removed

- `react-bootstrap` from `devDependencies`.

## [1.0.0] — 2026-02-13

### Added

- **Core rendering engine** (`Element.jsx`) — recursive YAML/JSON → React element renderer with support for HTML tags, registered components, renderers, and inline apps.
- **UIReact** — top-level component: loads document from DB, resolves i18n translations, renders content.
- **UIRoot** — full application shell with routing, theme switching, and document loading.
- **UIContextValue** — context provider carrying theme, lang, db, renderers, apps, and actions.
- **Renderer map** — `typography`, `button`, `input`, `select`, `checkbox`, `radio`, `textarea`, `avatar`, `card`, `table`, `modal`, `form`.
- **Theme system** — theming via `@nan0web/ui` tokens with CSS Custom Properties.
- **`InternalErrorBoundary`** — graceful error handling inside rendered content.
- **Playwright E2E base** — initial testing infrastructure on port 4246.
- **TypeScript declarations** — auto-generated `.d.ts` files via `tsconfig.json`.
- **`.npmignore`** — excludes dev/test/playground files from published package.

[1.1.0]: https://github.com/nicekid1/nan.web/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nicekid1/nan.web/releases/tag/v1.0.0
