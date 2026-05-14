# @nan0web/ui-react-bootstrap

> 🇺🇦 [Українська](docs/uk/README.md)

Bootstrap integration for the Nan0web ecosystem.
Combines declarative UI logic with the power of React Bootstrap.

## Description

This package provides a set of renderers and components that map the Nan0web UI standard
to Bootstrap classes and components. It includes a universal **OlmuiInspector** for
real-time visual customization of any component's CSS Custom Properties.

## Installation

```bash
# pnpm (recommended)
pnpm add @nan0web/ui-react-bootstrap

# npm
npm install @nan0web/ui-react-bootstrap

# yarn
yarn add @nan0web/ui-react-bootstrap
```

Should have correct package name

## Components

### TreeView

Hierarchical data visualization styled with Bootstrap ListGroup.

Should render Bootstrap TreeView
```js
const data = [{ name: 'Root', type: 'dir', children: [{ name: 'Child', type: 'file' }] }]
render(
	<UIProvider value={testContext}>
		<RenderTreeView element={{ tree: data }} context={testContext} />
	</UIProvider>,
)
```
### Autocomplete

Searchable dropdown using Bootstrap Form controls.

Should render Bootstrap Autocomplete
```js
const options = ['Red', 'Green', 'Blue']
render(
	<UIProvider value={testContext}>
		<RenderAutocomplete
			element={{ options, placeholder: 'Pick color' }}
			context={testContext}
		/>
	</UIProvider>,
)
const input = screen.getByPlaceholderText('Pick color')
```
### Header

Multi-level navigation header with Bootstrap Navbar.
Supports 3-level navigation, language selector, search modal, and signin dropdown.
All visual properties are driven by `--header-*` CSS Custom Properties defined in `Header.v2.scss`.

```jsx
import Header from './components/organisms/Header/Header'

<Header
  nav={{ items: navData }}
  title="My App"
  $logo={false}
/>
```

### OlmuiInspector

Universal visual inspector for real-time CSS Custom Property editing.
Wraps any component and generates a control panel based on a **StylesClass** schema (Model as Schema pattern).

**Features:**
- Auto-detects control types: `SizeControl`, `SelectControl`, `ColorAlphaPicker`, `SpacingControl`, `ShadowControl`, `BorderControl`
- Simultaneous Light/Dark theme CSS generation via `<style>` block
- Dark-only CSS variables (no duplicates in `[data-bs-theme="dark"]`)
- Undo history (up to 50 steps) with full control sync
- Inline Reset confirmation (no native dialogs)
- Export modal: copy CSS Variables or JSON state to clipboard
- `onUpdate` callback prop for external state integration

```jsx
import { OlmuiInspector } from './play/components/OlmuiInspector'
import { HeaderStyles } from './components/organisms/Header/HeaderStyles'

<OlmuiInspector StylesClass={HeaderStyles}>
  <Header nav={{ items }} title="Preview" />
</OlmuiInspector>
```

#### StylesClass (Model as Schema)

Each static property defines a CSS variable with metadata:

```js
class HeaderStyles {
  static bg = {
    help: 'Header background',
    alias: 'header-bg',
    default: '#ffffff',
    defaultDark: '#212529'
  }
  bg = HeaderStyles.bg.default

  static shadow = {
    control: 'shadow',
    help: 'Header shadow',
    alias: 'header-shadow',
    default: '0 2px 10px rgba(0,0,0,0.05)',
    defaultDark: '0 2px 15px rgba(0,0,0,0.5)'
  }
  shadow = HeaderStyles.shadow.default
}
```

Supported meta fields: `help`, `alias`, `default`, `defaultDark`, `units`, `options`, `min`, `max`, `step`, `control`, `isColor`.

#### Export

The Export modal generates ready-to-use CSS:

```css
:root {
  --header-bg: #ffffff;
  --header-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

[data-bs-theme="dark"] {
  --header-bg: #212529;
  --header-shadow: 0 2px 15px rgba(0,0,0,0.5);
}
```

## Atoms

### Button

Declarative button mapped to Bootstrap `<Button>` with variant, size and icon support.

### Input

Bootstrap Form.Control wrapper with label, help text and validation states.

### Typography

Semantic text rendering (`<h1>`–`<h6>`, `<p>`, `<small>`) with Bootstrap typography utilities.

## Molecules

### Card

Bootstrap Card component with header, body, footer slots and image support.

### SortableList

Drag-and-drop reorderable list with Bootstrap styling.
Uses `useSortableList()` hook from `@nan0web/ui-react` internally.

```jsx
import { SortableList } from '@nan0web/ui-react-bootstrap'

<SortableList
  items={models}
  renderItem={(item) => <span>{item.name}</span>}
  onReorder={setModels}
  persist="my_order"
/>
```

## Organisms

### Modal

Bootstrap Modal wrapper for declarative dialog management.

### Footer

Responsive page footer with multi-column layout and social links.

## Layout Blocks

### Nav

Top navigation bar rendered from `$nav` AST tree. Supports dropdowns and mobile hamburger.

### Sidebar

Tree-based side navigation for documentation and multi-section layouts.

### Page

Structural skeleton layout that combines `Nav`, `Sidebar` and main content area.

### Callout

Attention blocks (Warning, Info, Tip) mapped to Bootstrap `Alert` variants.

### Markdown

Clean container for rendering pre-generated HTML from Markdown content.

### ThemeToggle

Day/Night theme switcher that toggles `data-bs-theme` attribute.

### LangSelect

Locale selector widget for switching the active `$locale`.

### Search

Universal search widget with modal overlay and real-time results.

### Content / Description / Excerpt / Features / Files / Price / Accordion

Specialized rendering blocks for catalog items, product pages, and structured content display.

Should have HeaderStyles schema
