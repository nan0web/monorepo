/* eslint-disable no-unused-vars */
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import assert from 'node:assert/strict'
import React from 'react'
import FS from '@nan0web/db-fs'
import fsNative from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatasetParser, DocsParser } from '@nan0web/test'
import { NoConsole } from '@nan0web/log'
import { UIProvider, renderers, UIContextValue } from './index.jsx'
import { Blocks } from './Blocks/index.js'

/** @typedef {import('react').ComponentType<{ element?: any, context: any, [key: string]: any }>} Renderer */

/** @type {Renderer} */
const RenderButton = /** @type {any} */ (renderers.get('button'))
/** @type {Renderer} */
const RenderInput = /** @type {any} */ (renderers.get('input'))
/** @type {Renderer} */
const RenderSelect = /** @type {any} */ (renderers.get('select'))
/** @type {Renderer} */
const RenderTypography = /** @type {any} */ (renderers.get('typography'))
/** @type {Renderer} */
const RenderForm = /** @type {any} */ (renderers.get('form'))
/** @type {Renderer} */
const RenderTable = /** @type {any} */ (renderers.get('table'))
/** @type {Renderer} */
const RenderAvatar = /** @type {any} */ (renderers.get('avatar'))
/** @type {Renderer} */
const RenderCard = /** @type {any} */ (renderers.get('card'))
/** @type {Renderer} */
const RenderCheckbox = /** @type {any} */ (renderers.get('checkbox'))
/** @type {Renderer} */
const RenderRadio = /** @type {any} */ (renderers.get('radio'))
/** @type {Renderer} */
const RenderTextArea = /** @type {any} */ (renderers.get('textarea'))
/** @type {Renderer} */
const RenderModal = /** @type {any} */ (renderers.get('modal'))
/** @type {Renderer} */
const RenderTreeView = /** @type {any} */ (renderers.get('tree'))
/** @type {Renderer} */
const RenderAutocomplete = /** @type {any} */ (renderers.get('autocomplete'))

const testContext = new UIContextValue({ renderers })

const fs = new FS()
let pkg = {}

beforeAll(async () => {
	try {
		pkg = await fs.loadDocument('package.json', {})
	} catch {}
})

//
// documentation generation source.
//
function testRender() {
	/**
	 * @docs
	 * # @nan0web/ui-react
	 *
	 * > 🇺🇦 [Українська версія](docs/uk/README.md)
	 *
	 * Zero-dependency React UI library for the nan0web ecosystem.
	 * No `react-bootstrap` — pure HTML + Bootstrap CSS Custom Properties.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The React implementation of the Nan0web UI standard.
	 * Provides highly interactive, themeable components that share the same underlying logic as the CLI.
	 *
	 * Key Features:
	 *
	 * - **Zero UI Dependencies** — No react-bootstrap. Pure HTML + Bootstrap CSS tokens.
	 * - **Dot-Notation Syntax** — `Alert.warning.lg` → `<Alert className="warning lg" />`.
	 * - **Universal Blocks** — Nav, Sidebar, Alert, Markdown, ThemeToggle, LangSelect.
	 * - **Doc Prop Pattern** — Components accept a `doc` object for dynamic YAML-driven content.
	 * - **Render-First Architecture** — Powerful unified rendering engine for Markdown, YAML, and Models.
	 * - **Modern Aesthetics** — Premium look and feel with full accessibility.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui-react
		 * ```
		 */
		assert.ok(pkg.name)
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/ui-react
		 * ```
		 */
		assert.ok(pkg.name)
	})

	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/ui-react
		 * ```
		 */
		assert.ok(pkg.name)
	})

	/**
	 * @docs
	 * ## Playground
	 */
	it('How to start the playground sandbox?', () => {
		/**
		 * ```bash
		 * npm run play
		 * ```
		 */
		assert.ok(pkg.scripts.play)
	})

	/**
	 * @docs
	 * ## Universal Blocks
	 *
	 * Universal Blocks are high-level documentation components that work across all UI adapters.
	 *
	 * ### Alert
	 */
	it('How to render Alert block with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - Alert: "Informational message"
		 *   - Alert.warning: "Warning message"
		 *   - Alert.danger.lg: "Critical error message"
		 *   - Alert.success: "Operation completed"
		 * ```
		 */
		assert.ok(Blocks.Alert)
	})

	/**
	 * @docs
	 */
	it('How to render Alert block with React components?', () => {
		/**
		 * ```jsx
		 * import { Alert } from '@nan0web/ui-react/src/Blocks/index.js'
		 *
		 * <Alert type="warning">Warning message</Alert>
		 * <Alert className="danger lg">Via classes</Alert>
		 * ```
		 */
		assert.ok(Blocks.Alert)
	})

	/**
	 * @docs
	 * ### Markdown
	 */
	it('How to render Markdown content with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - Markdown: "# Hello World\n\nThis is **bold** text."
		 * ```
		 */
		assert.ok(Blocks.Markdown)
	})

	/**
	 * @docs
	 */
	it('How to render Markdown content with React components?', () => {
		/**
		 * ```jsx
		 * import { Markdown } from '@nan0web/ui-react/src/Blocks/index.js'
		 *
		 * <Markdown content="# Hello World" />
		 * ```
		 */
		assert.ok(Blocks.Markdown)
	})

	/**
	 * @docs
	 * ### Nav
	 */
	it('How to render Nav with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * $nav:
		 *   brand: My Site
		 * nav:
		 *   - title: Home
		 *     href: /
		 * ```
		 */
		assert.ok(Blocks.Nav)
	})

	/**
	 * @docs
	 */
	it('How to render Nav with React components?', () => {
		/**
		 * ```jsx
		 * import { Nav } from '@nan0web/ui-react/src/Blocks/index.js'
		 *
		 * <Nav doc={doc} />
		 * ```
		 */
		assert.ok(Blocks.Nav)
	})

	/**
	 * @docs
	 * ### Sidebar
	 */
	it('How to render Sidebar with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * $sidebar:
		 *   title: Documentation
		 * sidebar:
		 *   - title: Getting Started
		 *     url: /guide
		 * ```
		 */
		assert.ok(Blocks.Sidebar)
	})

	/**
	 * @docs
	 */
	it('How to render Sidebar with React components?', () => {
		/**
		 * ```jsx
		 * import { Sidebar } from '@nan0web/ui-react/src/Blocks/index.js'
		 *
		 * <Sidebar doc={doc} />
		 * ```
		 */
		assert.ok(Blocks.Sidebar)
	})

	/**
	 * @docs
	 * ## Dot-Notation Syntax
	 *
	 * The Element renderer supports dot-notation for adding CSS classes to components.
	 * Each segment after the first dot becomes a CSS class.
	 *
	 * ```yaml
	 * content:
	 *   - Alert.warning: "Watch out!"          # → <Alert className="warning" />
	 *   - Alert.danger.lg: "Error!"            # → <Alert className="danger lg" />
	 *   - Button.primary.rounded: "Submit"     # → <Button className="primary rounded" />
	 * ```
	 *
	 * Components can inspect `className` to resolve semantic variants (e.g. Alert detects `warning` from className).
	 *
	 * ## Basic Renderers
	 *
	 * ### Typography
	 */
	it('How to render Typography with Data-Driven Model?', () => {
		/**
		 * Use standard HTML tags in YAML for typography elements (`h1`-`h6`, `p`).
		 *
		 * ```yaml
		 * content:
		 *   - h1: "Welcome Title"
		 *   - p: "This is a paragraph."
		 * ```
		 */
		assert.ok(RenderTypography)
	})

	/**
	 * @docs
	 */
	it('How to render Typography with React components?', () => {
		/**
		 * ```jsx
		 * import { Typography } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Typography variant="h1">Welcome Title</Typography>
		 * ```
		 */
		assert.ok(RenderTypography)
	})

	/**
	 * @docs
	 * ### Button
	 */
	it('How to render a Button with Data-Driven Model?', () => {
		/**
		 * Using the capitalized `Button` maps to the React component, allowing dot-notation for classes or explicit props.
		 *
		 * ```yaml
		 * content:
		 *   - Button.primary.lg: "Get Started"
		 *   - Button: "Click me"
		 *     variant: success
		 * ```
		 */
		assert.ok(RenderButton)
	})

	/**
	 * @docs
	 */
	it('How to render a Button with React components?', () => {
		/**
		 * ```jsx
		 * import { Button } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Button variant="primary">Click Me</Button>
		 * ```
		 */
		assert.ok(RenderButton)
	})

	/**
	 * @docs
	 * ### Avatar
	 */
	it('How to render an Avatar with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - avatar:
		 *       src: "/avatar.png"
		 *       alt: "User"
		 * ```
		 */
		assert.ok(RenderAvatar)
	})

	/**
	 * @docs
	 */
	it('How to render an Avatar with React components?', () => {
		/**
		 * ```jsx
		 * import { Avatar } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Avatar src="/avatar.png" alt="User" />
		 * ```
		 */
		assert.ok(RenderAvatar)
	})

	/**
	 * @docs
	 * ## Interactive Inputs
	 *
	 * ### Input
	 */
	it('How to render an Input with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - input:
		 *       $value: "John Doe"
		 *       $placeholder: "Enter name..."
		 * ```
		 */
		assert.ok(RenderInput)
	})

	/**
	 * @docs
	 */
	it('How to render an Input with React components?', () => {
		/**
		 * ```jsx
		 * import { Input } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Input value="John Doe" placeholder="Enter name..." />
		 * ```
		 */
		assert.ok(RenderInput)
	})

	/**
	 * @docs
	 * ### Select
	 */
	it('How to render a Select with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - select:
		 *       $options:
		 *         - value: "usd"
		 *           label: "USD"
		 *         - value: "eur"
		 *           label: "EUR"
		 * ```
		 */
		assert.ok(RenderSelect)
	})

	/**
	 * @docs
	 */
	it('How to render a Select with React components?', () => {
		/**
		 * ```jsx
		 * import { Select } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * const options = [{ value: 'usd', label: 'USD' }, { value: 'eur', label: 'EUR' }]
		 * <Select options={options} />
		 * ```
		 */
		assert.ok(RenderSelect)
	})

	/**
	 * @docs
	 * ### Checkbox
	 */
	it('How to render a Checkbox with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - checkbox:
		 *       $checked: true
		 *       $label: "Accept terms"
		 * ```
		 */
		assert.ok(RenderCheckbox)
	})

	/**
	 * @docs
	 */
	it('How to render a Checkbox with React components?', () => {
		/**
		 * ```jsx
		 * import { Checkbox } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Checkbox checked={true} label="Accept terms" />
		 * ```
		 */
		assert.ok(RenderCheckbox)
	})

	/**
	 * @docs
	 * ### Radio
	 */
	it('How to render a Radio with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - radio:
		 *       $name: "theme"
		 *       $label: "Dark Mode"
		 *       $checked: true
		 * ```
		 */
		assert.ok(RenderRadio)
	})

	/**
	 * @docs
	 */
	it('How to render a Radio with React components?', () => {
		/**
		 * ```jsx
		 * import { Radio } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Radio name="theme" label="Dark Mode" checked={true} />
		 * ```
		 */
		assert.ok(RenderRadio)
	})

	/**
	 * @docs
	 * ### TextArea
	 */
	it('How to render a TextArea with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - textarea:
		 *       $placeholder: "Enter description..."
		 *       $rows: 5
		 * ```
		 */
		assert.ok(RenderTextArea)
	})

	/**
	 * @docs
	 */
	it('How to render a TextArea with React components?', () => {
		/**
		 * ```jsx
		 * import { TextArea } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <TextArea placeholder="Enter description..." rows={5} />
		 * ```
		 */
		assert.ok(RenderTextArea)
	})

	/**
	 * @docs
	 * ## Advanced Components
	 *
	 * ### Card
	 */
	it('How to render a Card with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - Card:
		 *       - img:
		 *           src: "/card.jpg"
		 *       - h3: "Card Title"
		 *       - p: "Description text."
		 * ```
		 */
		assert.ok(RenderCard)
	})

	/**
	 * @docs
	 */
	it('How to render a Card with React components?', () => {
		/**
		 * ```jsx
		 * import { Card } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Card>
		 *   <img src="/card.jpg" />
		 *   <h3>Card Title</h3>
		 *   <p>Description text.</p>
		 * </Card>
		 * ```
		 */
		assert.ok(RenderCard)
	})

	/**
	 * @docs
	 * ### Table
	 */
	it('How to render a Table with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - table:
		 *       - tr:
		 *           - td: "Value 1"
		 *           - td: "Value 2"
		 * ```
		 */
		assert.ok(RenderTable)
	})

	/**
	 * @docs
	 */
	it('How to render a Table with React components?', () => {
		/**
		 * ```jsx
		 * import { Table } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Table>
		 *   <tbody>
		 *     <tr>
		 *       <td>Value 1</td>
		 *     </tr>
		 *   </tbody>
		 * </Table>
		 * ```
		 */
		assert.ok(RenderTable)
	})

	/**
	 * @docs
	 * ### Modal Window
	 */
	it('How to render a Modal with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - Modal:
		 *       $triggerText: "Open Details"
		 *       $content:
		 *         h2: "Modal Body Content"
		 * ```
		 */
		assert.ok(RenderModal)
	})

	/**
	 * @docs
	 */
	it('How to render a Modal with React components?', () => {
		/**
		 * ```jsx
		 * import { Modal } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Modal triggerText="Open Details">
		 *   <h2>Modal Body Content</h2>
		 * </Modal>
		 * ```
		 */
		assert.ok(RenderModal)
	})

	/**
	 * @docs
	 * ### Form
	 */
	it('How to render a Form with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - id: "example-form"
		 *     form:
		 *       - label: "User Name"
		 *         input:
		 *           $value: "admin"
		 * ```
		 */
		assert.ok(RenderForm)
	})

	/**
	 * @docs
	 */
	it('How to render a Form with React components?', () => {
		/**
		 * ```jsx
		 * import { Form } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * const config = {
		 *   id: 'example-form',
		 *   form: [
		 *     { label: 'User Name', input: { $value: 'admin' } }
		 *   ]
		 * }
		 * <Form element={config} />
		 * ```
		 */
		assert.ok(RenderForm)
	})

	/**
	 * @docs
	 * ### TreeView
	 */
	it('How to render a TreeView with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - tree:
		 *       - name: "src"
		 *         type: "dir"
		 *         children:
		 *           - name: "index.js"
		 *             type: "file"
		 * ```
		 */
		assert.ok(RenderTreeView)
	})

	/**
	 * @docs
	 */
	it('How to render a TreeView with React components?', () => {
		/**
		 * ```jsx
		 * import { TreeView } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * const data = [
		 *   { name: 'src', type: 'dir', children: [ { name: 'index.js', type: 'file' } ] }
		 * ]
		 * <TreeView data={data} mode="file" />
		 * ```
		 */
		assert.ok(RenderTreeView)
	})

	/**
	 * @docs
	 * ### Autocomplete
	 */
	it('How to render an Autocomplete with Data-Driven Model?', () => {
		/**
		 * ```yaml
		 * content:
		 *   - autocomplete:
		 *       $options: ["Apple", "Banana", "Cherry"]
		 *       $placeholder: "Select fruit..."
		 * ```
		 */
		assert.ok(RenderAutocomplete)
	})

	/**
	 * @docs
	 */
	it('How to render an Autocomplete with React components?', () => {
		/**
		 * ```jsx
		 * import { Autocomplete } from '@nan0web/ui-react/src/index.jsx'
		 *
		 * <Autocomplete options={['Apple', 'Banana', 'Cherry']} placeholder="Select fruit..." />
		 * ```
		 */
		assert.ok(RenderAutocomplete)
	})

	/**
	 * @docs
	 * ## Data-Driven UI
	 *
	 * The core architectural pattern of the ecosystem.
	 * Content is defined in YAML/JSON files, and UI components render it automatically.
	 *
	 * ```yaml
	 * # data/index.yaml
	 * $content:
	 *   - Content
	 * content:
	 *   - h1: "Welcome"
	 *   - Alert.success: "Ready to go!"
	 *   - Button.primary: "Get Started"
	 * ```
	 *
	 * ```jsx
	 * import { UIReact } from '@nan0web/ui-react/src/index.jsx'
	 *
	 * <UIReact db={db} uri="index" />
	 * ```
	 *
	 * ## API
	 *
	 * ### `UIReact`
	 *
	 * Top-level component that loads a document, resolves translations, and renders content.
	 *
	 * | Prop | Type | Default | Description |
	 * |------|------|---------|-------------|
	 * | `db` | `DB` | — | Database instance |
	 * | `uri` | `string` | `''` | Document URI |
	 * | `context` | `object` | `{}` | Extra context (apps, actions) |
	 * | `console` | `Console` | `window.console` | Logger instance |
	 *
	 * ### `UIRoot`
	 *
	 * Complete application shell with routing, theme switching, and document loading.
	 *
	 * ### `renderers`
	 *
	 * A `Map<string, Component>` of all available renderers:
	 *
	 * | Key | Component | Description |
	 * |-----|-----------|-------------|
	 * | `typography` | Typography | Semantic text rendering |
	 * | `button` | Button | Interactive buttons |
	 * | `input` | Input | Text input fields |
	 * | `select` | Select | Dropdown menus |
	 * | `checkbox` | Checkbox | Boolean toggles |
	 * | `radio` | Radio | Single selection |
	 * | `textarea` | TextArea | Multi-line text |
	 * | `avatar` | Avatar | Profile pictures |
	 * | `card` | Card | Content containers |
	 * | `table` | Table | Tabular data |
	 * | `modal` | Modal | Overlay windows |
	 * | `form` | Form | Schema-generated forms |
	 * | `tree` | TreeView | Hierarchical data |
	 * | `autocomplete` | Autocomplete | Searchable selection |
	 *
	 * ### Universal Blocks
	 *
	 * | Block | Description |
	 * |-------|-------------|
	 * | `Nav` | Top navigation bar with doc prop |
	 * | `Sidebar` | Side navigation with doc prop |
	 * | `Alert` | Semantic callout with dot-notation |
	 * | `Markdown` | Markdown rendering via `marked` |
	 * | `ThemeToggle` | Light/dark theme switcher |
	 * | `LangSelect` | Language selector |
	 * | `CodeBlock` | Syntax-highlighted code |
	 * | `Page` | Full page layout |
	 */
	it('All the above renderers are covered by `vitest` tests and rendered automatically via YAML data.', () => {
		assert.ok(renderers)
		assert.ok(renderers.size > 0)
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](../../CONTRIBUTING.md)', () => {
		assert.ok(pkg.scripts)
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license? - [ISC LICENSE](./LICENSE) file.', () => {
		assert.ok(pkg.license)
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()
	const __filename = fileURLToPath(import.meta.url)
	const fnString = fsNative.readFileSync(__filename, 'utf8')
	const text = String(parser.decode(fnString))

	it('How to verify README has the correct title?', async () => {
		assert.ok(text.includes('# @nan0web/ui-react'))
		expect(text).toContain('# @nan0web/ui-react')
	})

	// Dataset generation for LLM
	it('How to generate dataset for LLM?', async () => {
		const dataset = DatasetParser.parse(text, pkg.name)
		assert.ok(dataset.length > 0)
		expect(dataset.length).toBeGreaterThan(0)
		await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)
		await fs.saveDocument('README.md', text)
	})
})
