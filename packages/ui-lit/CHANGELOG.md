# Changelog

All notable changes to `@nan0web/ui-lit` will be documented in this file.

## [1.1.0] — 2026-02-25

### Added

- **UIBadge**: `<slot>` support — content can be passed as children instead of `label` attr
- **UIBadge**: semantic variants — `neutral`, `unread`, `complete`, `dangerous`, `not-found`
- **UISlider**: visible track fill via `_getPercentage()` + inline `linear-gradient`
- **UISortable**: `numbered` property — renders ordinal numbers (`1. 2. 3.`) before items
- **Playground**: initialization of all secondary e2e-\* elements (10 new bindings)
- **Playground**: `querySelectorAll` for ThemeToggle and LangSelect — all instances now respond
- **Release contract**: `releases/1/1/v1.1.0/task.spec.js` — 18 contract tests
- **Scripts**: `release:spec`, `release:verify` in package.json
- `.npmignore` — excludes dev artifacts from npm publish
- `.gitignore` — excludes `dist/`, `.cache/`, `.datasets/`

### Changed

- **UIBadge** variants renamed: `info→unread`, `success→complete`, `warning→dangerous`, `error→not-found`
- **UIToast**: removed `duration="0"` from all examples — toasts auto-dismiss after 4s (default)
- **README.md**: updated test counts (209 unit + 240 E2E)

### Fixed

- Second component examples not rendering (Nav, Sidebar, Markdown, CodeBlock, Table, Select, Accordion, Autocomplete, Sortable, Tree)
- ThemeToggle and LangSelect only responding on first instance

## [1.0.0] — 2026-02-24

### Added

- 25 Universal Web Components (LitElement, Shadow DOM)
- Data-Driven Playground via `data/play/index.yaml`
- `<e2e-example>` component for live code previews
- In-browser E2E test runner (240 assertions)
- CI headless runner (`ci-runner.js`)
- Unit tests (209 tests across 26 suites)
- Phase 1 — Core: Nav, Sidebar, Alert, Markdown, ThemeToggle, LangSelect, Badge, CodeBlock, Table
- Phase 2 — Forms: Input, Select, Button, Toggle, Confirm
- Phase 2 — Structure: Page, Card, Modal, Accordion, Toast
- Phase 2 — Advanced: Spinner, ProgressBar, Slider, Autocomplete, Sortable, Tree
