# Changelog

## [0.2.0] — 2026-02-24

### Added

- **OlmuiInspector** — universal visual inspector for real-time CSS Custom Property editing
  - Model as Schema pattern: `StylesClass` with static metadata fields (`help`, `alias`, `default`, `defaultDark`, `units`, `options`, `min`, `max`, `step`, `control`, `isColor`)
  - Auto-detected control types: `SizeControl`, `SelectControl`, `ColorAlphaPicker`, `SpacingControl`, `ShadowControl`, `BorderControl`
  - Dual-theme `<style>` block: light (`.olmui-preview-{id}`) + dark (`[data-bs-theme="dark"]`)
  - Dark CSS block includes only variables that differ from light (no duplicates)
  - Undo history (up to 50 steps) with `useEffect` sync on all controls
  - Inline Reset confirmation (replaces `window.confirm()` flicker)
  - `onUpdate` callback prop for external state integration (Share App / db-browser)
  - localStorage persistence per StylesClass name
- **Export Modal** — Bootstrap Modal with CSS Variables / JSON State toggle and copy-to-clipboard
- **BorderControl** — composite control for `border` shorthand (width + unit selector, style dropdown, ColorAlphaPicker)
- **SpacingControl** — per-side unit selector (rem / px / em / %) for padding/margin values
- **`--header-subnav-offset`** CSS variable + `calc()` in Header.v2.scss for subnav positioning
- **`defaultDark`** fields in `HeaderStyles.js` for bg, shadow, navLinkColor, activeColor, langBg, langBorder, langShadow, subnavBg, subnavLinkColor, dropdownBg, dropdownShadow
- Full README documentation for all components (EN + UK translation in `docs/uk/README.md`)
- CHANGELOG.md

### Changed

- **SelectControl** — vertical layout (`flex-column`): label on top row, select below; prevents text truncation
- **Header.v2.scss** — `.logo-brand` and `.search-btn` use `var(--header-nav-link-color)` instead of hardcoded `$dark`
- **Header.jsx** — removed hardcoded `px-2 px-md-3` from signin button to allow CSS variable control
- **DocsParser** — added `expect(` to stops list for clean README.md generation (no test code leaks)
- Installation docs now include pnpm, npm, and yarn commands

### Removed

- Signin button fields from `HeaderStyles.js` (`btnRadius`, `btnPadding`, `btnWeight`, `btnBorderWidth`) — styling now handled purely by Bootstrap `variant="outline-primary"`

## [0.1.0] — 2026-02-16

### Added

- Initial release
- Bootstrap renderers: Button, Input, TreeView, Autocomplete, Typography, Card, Modal
- Header organism with 3-level navigation
- Footer organism
- Layout Blocks: Nav, Sidebar, Page, Callout, Markdown, ThemeToggle, LangSelect, Search
- Content Blocks: Content, Description, Excerpt, Features, Files, Price, Accordion
- SortableList component with `useSortableList()` hook integration
- Playground (Vite dev server)
