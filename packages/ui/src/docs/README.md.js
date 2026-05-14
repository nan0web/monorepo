import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import {
	Frame,
	Model,
	Models,
	OutputMessage,
	View,
	FormInput,
	UiMessage,
	UiForm,
	ask,
	progress,
	show,
	result,
	render,
} from '../index.js'
import { Welcome } from '../Component/index.js'

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach((info) => {
	console = new NoConsole()
})

// Core test suite that also serves as the source for README generation.
// The block comments inside each `it` block are extracted to build
// the final `README.md`. Keeping the comments here ensures the
// documentation stays close to the code.
function testRender() {
	/**
	 * @docs
	 * # @nan0web/ui
	 *
	 * 🏴󠁧󠁢󠁥󠁮󠁧󠁿 [English](./README.md) | 🇺🇦 [Українською](../uk/README.md)
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * A lightweight, agnostic UI framework designed with the **nan0web philosophy**
	 * — one application logic, many UI implementations.
	 *
	 * This library provides core classes and utilities for building structured user interfaces.
	 * It supports:
	 *
	 * - Messaging (Input/Output)
	 * - Forms with validation
	 * - Progress tracking
	 * - Component rendering
	 * - View management with Frame rendering
	 * - App structure with core and user apps
	 *
	 * Built to work in sync or async, terminal-based or web-based apps,
	 * focusing on type safety, minimalism, and pure JavaScript design.
	 *
	 * ## Table of Contents
	 *
	 * - [Installation](#installation)
	 * - [Concepts & Architecture](#concepts--architecture)
	 *   - [Intent-Based Communication (OLMUI)](#intent-based-communication-olmui)
	 *   - [Model-as-Schema](#model-as-schema)
	 *   - [Forms](#forms)
	 *   - [View & Frames](#view--frames)
	 *   - [Application & CoreApp](#application--coreapp)
	 * - [Testing (TDD+)](#testing-tdd)
	 *   - [Scenario Testing (v1.12+)](#scenario-testing-v112)
	 *   - [Story Testing (.nan0)](#story-testing-nan0-spec-files)
	 * - [Master IDE](#master-ide-component-sandbox)
	 * - [Philosophy & Economy](./philosophy-economy.md)
	 * - [Legacy Architecture v1](./legacy/v1.md)
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui')
	})
	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/ui
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/ui
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui')
	})

	/**
	 * @docs
	 * ## Concepts & Architecture
	 *
	 * ### Intent-Based Communication (OLMUI)
	 *
	 * UI communication is built around **Intents**. Instead of directly manipulating message objects,
	 * the application logic yields intents that are interpreted by environment-specific adapters (CLI, Web, Mobile).
	 *
	 * - **`ask()`** – request data from the user.
	 * - **`show()`** – display a notification or message.
	 * - **`result()`** – return the final result of a workflow.
	 *
	 * For a deep dive into our core values and the new economy, see [Philosophy & Economy](./philosophy-economy.md).
	 *
	 * > [!NOTE]
	 * > The legacy `UiMessage` system is deprecated as of v1.12.0. For older projects, refer to the [Legacy v1 Documentation](./legacy/v1.md).
	 */
	it('How to use intents for communication?', () => {
		//import { ask, show, result } from '@nan0web/ui'

		const a = ask('name', { help: 'Enter name' })
		const s = show('Welcome!', 'info')
		const r = result({ ok: true })

		assert.equal(a.type, 'ask')
		assert.equal(a.field, 'name')
		assert.equal(s.type, 'show')
		assert.equal(s.message, 'Welcome!')
		assert.equal(r.type, 'result')
		assert.ok(r.data.ok)
	})

	/**
	 * @docs
	 * ### Forms
	 *
	 * `UiForm` supports field definitions, data management, and schema validation.
	 * Every form includes a title, fields, and current state.
	 *
	 * Field types include:
	 *
	 * - `text`
	 * - `email`
	 * - `number`
	 * - `select`
	 * - `checkbox`
	 * - `textarea`
	 */
	it('How to define and validate a UiForm?', () => {
		//import { UiForm } from '@nan0web/ui'

		const form = new UiForm({
			title: 'Contact Form',
			fields: [
				FormInput.from({ name: 'email', label: 'Email Address', type: 'email', required: true }),
				FormInput.from({
					name: 'message',
					label: 'Your Message',
					type: 'textarea',
					required: true,
				}),
			],
			state: {
				email: 'invalid-email',
				message: 'Hello!',
			},
		})

		const { isValid, errors } = form.validate()
		console.info(Object.keys(errors).length) // ← 1
		console.info(errors.email) // ← Invalid email format

		assert.equal(isValid, false)
		assert.equal(console.output()[0][1], 1)
		assert.equal(console.output()[1][1], 'Invalid email format')
	})

	/**
	 * @docs
	 * ### Components
	 *
	 * Components render data as frame-ready output.
	 *
	 * - `Welcome` – greets user by name
	 * - `Process` – shows progress bar and time
	 */
	it('How to render the Welcome component?', () => {
		//import { Welcome } from '@nan0web/ui'

		const frame = Welcome({ user: { name: 'Alice' } })
		const firstLine = frame[0].join('')
		console.info(firstLine) // ← Welcome Alice!
		assert.equal(console.output()[0][1], 'Welcome Alice!')
	})

	/**
	 * @docs
	 * ### View Manager
	 *
	 * `View` combines components and renders frames.
	 *
	 * Every view has:
	 *
	 * - Locale – formatted text, numbers, currency
	 * - StdIn / StdOut – input/output streams
	 * - Frame – output buffer with visual properties
	 */
	it('How to render frame with View?', () => {
		//import { View } from '@nan0web/ui'

		const view = new View()
		view.render(1)(['Hello, world'])
		console.info(String(view.frame)) // ← "\rHello, world"
		assert.ok(String(view.frame).includes('Hello, world'))
	})

	/**
	 * @docs
	 * ### Frame Rendering
	 *
	 * `Frame` manages visual rendering with width and height limits.
	 * Useful for fixed-size terminals or UI blocks.
	 *
	 * Render methods:
	 *
	 * - `APPEND` – adds content after previous frame
	 * - `REPLACE` – erases and replaces full frame area
	 * - `VISIBLE` – renders only visible part of frame
	 */
	it('How to create a Frame with fixed size?', () => {
		//import { Frame } from '@nan0web/ui'

		const frame = new Frame({
			value: [['Frame content']],
			width: 20,
			height: 5,
			renderMethod: Frame.RenderMethod.APPEND,
		})

		const rendered = frame.render()
		console.info(rendered.includes('Frame content')) // ← true
		assert.ok(rendered.includes('Frame content'))
	})
	it('How to create a Frame with different render methods?', () => {
		//import { Frame } from '@nan0web/ui'

		const frame = new Frame({
			value: [['Frame content']],
			width: 20,
			height: 5,
		})

		frame.renderMethod = Frame.RenderMethod.REPLACE
		const renderedReplace = frame.render()
		assert.ok(renderedReplace.includes('Frame content'))

		frame.renderMethod = Frame.RenderMethod.VISIBLE
		const renderedVisible = frame.render()
		assert.ok(renderedVisible.includes('Frame content'))
	})

	/**
	 * @docs
	 * ### Domain Models (v1.9.0)
	 *
	 * v1.9.0 introduces a comprehensive set of domain models for layout and components.
	 * These models follow the **Model-as-Schema** pattern.
	 *
	 * #### Layout Models
	 * - `HeaderModel` — title, logo, navigation actions
	 * - `FooterModel` — copyright, version, social links
	 * - `HeroModel` — prominent call-to-action
	 *
	 * #### HTML5 Base Elements
	 * Fully typed zero-cost support for standard tags: `div`, `span`, `p`, `h1`-`h6`, `a`, `ul`, `table`, etc., plus SVG basics (`svg`, `path`, `rect`). Data must be standard `camelCase`.
	 *
	 * #### Component Models
	 * - `PricingModel` / `PricingSection` — plans with features and prices
	 * - `FeatureGrid` — grid of feature highlights
	 * - `ProfileDropdown` — user avatar and settings menu
	 * - `CommentModel` & `TestimonialModel` — social proof
	 * - `StatsModel` — data visualizations
	 * - `TimelineModel` — event history
	 */
	it('How to use the Models container?', () => {
		//import { Models } from '@nan0web/ui'
		const { HeaderModel, HeroModel } = Models

		const header = new HeaderModel({
			title: 'NaN•Web',
			logo: '/logo.svg',
			actions: [/** @type {any} */ ({ title: 'Docs', href: '/docs' })],
		})
		const hero = new HeroModel({
			title: 'One Logic — Many UI',
			actions: [/** @type {any} */ ({ title: 'Get Started', href: '/start' })],
		})

		console.info(header.title) // ← NaN•Web
		console.info(hero.actions[0].title) // ← Get Started

		assert.equal(header.title, 'NaN•Web')
		assert.equal(hero.actions[0].title, 'Get Started')
	})

	it('How to import models directly?', () => {
		//import { HeaderModel, HeroModel } from '@nan0web/ui/models'
		// Note: For testing we use the already imported Models registry
		const { HeaderModel, HeroModel } = Models

		const header = new HeaderModel({ title: 'Direct Import' })
		assert.equal(header.title, 'Direct Import')
	})

	it('How to use the Pricing and Testimonial models?', () => {
		//import { Models } from '@nan0web/ui'
		const { PricingModel, TestimonialModel } = Models

		const plan = new PricingModel({
			title: 'Professional',
			features: ['Unlimited data', '24/7 support'],
		})
		const feedback = new TestimonialModel({
			author: 'John Doe',
			text: 'Absolute game changer!',
			rating: 5,
		})

		console.info(plan.features.length) // ← 2
		console.info(feedback.rating) // ← 5

		assert.equal(plan.features.length, 2)
		assert.equal(feedback.rating, 5)
	})

	it('How to use a User model?', () => {
		//import { Models } from '@nan0web/ui'

		const user = new Models.User({ name: 'Charlie', email: 'charlie@example.com' })
		console.info(user.name) // ← Charlie
		console.info(user.email) // ← charlie@example.com
		assert.equal(user.name, 'Charlie')
		assert.equal(user.email, 'charlie@example.com')
	})

	/**
	 * @docs
	 * ### Model Inheritance & Normalization (v1.12.3)
	 *
	 * From v1.12.3, the system supports robust inheritance for static metadata.
	 * Child classes automatically inherit and can override parent fields.
	 *
	 * Additionally, input data is automatically normalized:
	 * - `boolean`: Strings `"0"`, `"1"`, `"false"`, `"true"` are cast to real booleans.
	 * - `number`: Empty strings `""` are cast to `0`.
	 */
	it('How to use Model inheritance and normalization?', () => {
		//import { Model } from '@nan0web/ui'
		class Base extends Model {
			static timeout = { type: 'number', default: 30 }
			constructor(data = {}, options = {}) {
				super(data, options)
				/** @type {number} */
				this.timeout
			}
		}
		class Child extends Base {
			static dir = { default: '.' }
			constructor(data = {}, options = {}) {
				super(data, options)
				/** @type {string} */
				this.dir
			}
		}

		const instance = new Child({ timeout: '10' })
		console.info(instance.timeout) // ← 10 (number)
		console.info(instance.dir) // ← . (default from parent/self)

		assert.strictEqual(instance.timeout, 10)
		assert.strictEqual(instance.dir, '.')
	})
	/**
	 * @docs
	 * ### Intent Generators (v1.11.0)
	 *
	 * From v1.11.0, Intent creators are standard named functions generating
	 * strict interactions (ask, progress, show, render, result).
	 *
	 * - `ask(field, schema)` — requests input from the environment.
	 * - `progress(message)` — updates a visual loader.
	 * - `show(message, level, data)` — displays a notification (replaces deprecated `log`).
	 * - `render(component, props)` — renders a specific component view.
	 * - `result(data)` — ends the model execution cleanly.
	 */
	it('How to use Intent generators? (v1.11.0)', () => {
		//import { ask, show, result } from '@nan0web/ui'

		const nameIntent = ask('name', { help: 'Your name' })
		const msgIntent = show('Processing...', 'info')
		const endIntent = result({ ok: true })

		assert.equal(nameIntent.type, 'ask')
		assert.equal(msgIntent.type, 'show')
		assert.equal(msgIntent.message, 'Processing...')
		assert.equal(endIntent.type, 'result')
		assert.equal(typeof show, 'function')
	})

	/**
	 * @docs
	 * ### Testing UI (v1.11.0 Deterministic Testing)
	 *
	 * Core unit-tested to ensure stability in different environments.
	 * With **v1.11.0**, the architecture formally introduces `ScenarioTest` for zero-I/O deterministic testing.
	 *
	 * By lifting the asynchronous logic and providing an explicit scenario array, models are evaluated instantly without waiting on user prompt delays.
	 */
	it('How to test Model pipelines deterministically?', async () => {
		//import { ModelAsApp, ask, result, show } from '@nan0web/ui'
		//import { ScenarioTest } from '@nan0web/ui/test/ScenarioTest.js'
		const { ModelAsApp, ask, result, show } = await import('../index.js')
		const { ScenarioTest } = await import('../test/ScenarioTest.js')

		class ShoppingCartApp extends ModelAsApp {
			async *run() {
				const product = /** @type {import('../core/Intent.js').AskResponse} */ (
					yield ask('product', { help: 'Select product' })
				)
				if (product?.value === 'laptop') {
					yield show('Good choice!', 'success')
				}
				const confirm = /** @type {import('../core/Intent.js').AskResponse} */ (
					yield ask('confirm', { help: 'Confirm purchase?' })
				)
				return result({ product: product?.value, confirm: confirm?.value })
			}
		}

		const res = await ScenarioTest.run(ShoppingCartApp, [
			{ field: 'product', value: 'laptop' },
			{ field: 'confirm', value: true },
		])

		assert.ok(!res.error, 'Should not have an error')
		assert.equal(res.value.product, 'laptop')
		assert.equal(res.value.confirm, true)

		// The show intent was also collected inside ScenarioTest
		// Product ask (1), Show (2), Confirm ask (3), Result (4)
		const shows = res.intents.filter((i) => i.type === 'show')
		assert.equal(shows.length, 1)
		assert.equal(shows[0].message, 'Good choice!')
	})

	/**
	 * @docs
	 * You can also verify exceptions and validation rules by observing the final error in ScenarioTest.
	 */
	it('How to test validation errors with ScenarioTest?', async () => {
		//import { ModelAsApp, ask, result } from '@nan0web/ui'
		//import { ScenarioTest } from '@nan0web/ui/test/ScenarioTest.js'
		const { ModelAsApp, ask, result } = await import('../index.js')
		const { ScenarioTest } = await import('../test/ScenarioTest.js')

		class ValidatedApp extends ModelAsApp {
			async *run() {
				const code = /** @type {import('../core/Intent.js').AskResponse} */ (
					yield ask('code', { help: 'Enter code', required: true })
				)
				if (!code?.value) throw new Error('Code is mandatory')
				return result({ code: code?.value })
			}
		}

		const res = await ScenarioTest.run(ValidatedApp, [
			{ field: 'code', value: '' }, // Simulating empty response
		])

		assert.ok(res.error instanceof Error)
		assert.equal(res.error.message, 'Code is mandatory')
	})

	/**
	 * @docs
	 * ### Story Testing (.nan0 spec files)
	 *
	 * The `SpecRunner.executeFile` helper allows running `.nan0` spec stories automatically without boilerplate DBFS setup.
	 * All manual assertions are omitted because `SpecAdapter` handles strict expectation matching internally.
	 */
	it('How to execute .nan0 spec files automatically?', async () => {
		//import { SpecRunner } from '@nan0web/ui/testing'
		const { SpecRunner } = await import('../testing/index.js')

		assert.equal(typeof SpecRunner.executeFile, 'function')
	})

	/**
	 * @docs
	 * All components, adapters, and models are designed to be testable
	 * with minimal setup.
	 */
	it('How to test visual UI components with assertions?', () => {
		//import { Welcome } from '@nan0web/ui'

		const output = Welcome({ user: { name: 'Test' } })
		console.info(output) // ← Welcome Test!
		assert.deepStrictEqual(console.output()[0][1], [
			['Welcome', ' ', 'Test', '!'],
			['What can we do today great?'],
			[''],
		])
	})

	/**
	 * @docs
	 * ### Master IDE (Component Sandbox)
	 *
	 * The Master IDE (OlmuiInspector) provides a unified environment for testing and documenting
	 * web components across platforms. It supports:
	 *
	 * - **NaN0 Spec** — a concise YAML-based shorthand for declaring component variations.
	 * - **OlmuiInspector** — unified UI for exploring component models and props.
	 * - **Live Preview** — real-time rendering of component states.
	 * - **i18n UI** — fully localized interface (UK/EN) for global developers.
	 * - **Theme Editor** — Bootstrap-like CSS variable system with live preview.
	 *
	 * It follows the **Olmui** core pattern: *One Logic — Many UI* (same manifest powers both CLI and Web).
	 *
	 * #### Theme Editor (CSS Variables)
	 *
	 * Professional-grade theming with live preview. Supports:
	 *
	 * - **Palette**: primary, secondary, success, warning, danger, info
	 * - **Geometry**: border-radius (sm/md/lg/pill/circle), spacing (sm/md/lg)
	 * - **Type-safe inputs**: `type="color"` for colors, number inputs for dimensions
	 *
	 * #### Component Rendering Architecture
	 *
	 * The IDE handles data transformation between YAML models and web components:
	 *
	 * - **Table**: `rows[][] + columns[]` → `data[]` (array of objects)
	 * - **Tree**: `data` → `items` mapping with 4-level taxonomy
	 * - **Markdown**: Raw markdown → HTML via `_md2html()` converter
	 * - **ProgressBar**: Tag alias (`ui-progress-bar` → `ui-progress`), variant colors
	 * - **LangSelect**: `string[]` → `{code,title}[]` conversion
	 * - **Hyphenated props**: Auto `camelCase` conversion (`show-label` → `showLabel`)
	 *
	 * #### NaN0 Spec (YAML)
	 *
	 * Concise format for defining variations:
	 */
	it('How to define a component variation using NaN0 Spec?', () => {
		/**
		 * ```yaml
		 * - Button: Primary
		 *   $variant: brand
		 *   $outline: true
		 * ```
		 */
		assert.ok(pkg.name === '@nan0web/ui')
	})

	/**
	 * @docs
	 * #### Documentation Site
	 *
	 * The IDE includes an auto-generated documentation site.
	 * HTML pages are generated from `ide.html` template via `generate-pages.js`:
	 *
	 * - Per-language pages (`/uk/Data/Table.html`, `/en/Feedback/Alert.html`)
	 * - SEO-optimized with `<title>` and `<meta>` per component
	 * - Category-based URL routing (`/Data/`, `/Feedback/`, `/Forms/`, `/Actions/`, `/System/`)
	 * - i18n navbar with `data-i18n` attributes
	 */
	it('How to run the documentation site?', () => {
		/**
		 * ```bash
		 * npm run docs:dev
		 * ```
		 */
		assert.ok(pkg.scripts?.['docs:dev'])
	})

	/**
	 * @docs
	 * ## Playground Demos
	 *
	 * The library includes rich playground demos:
	 *
	 * - [Registration Form](./play/registration.form.js)
	 * - [Currency Exchange](./play/currency.exchange.js)
	 * - [Mobile Top-up](./play/topup.telephone.js)
	 * - [Language Selector](./play/language.form.js)
	 *
	 * Run to explore live functionality:
	 */
	it('How to run the playground?', async () => {
		/**
		 * ```bash
		 * # Clone repository and run playground
		 * git clone https://github.com/nan0web/ui.git
		 * cd ui
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play).includes('node play'))
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0, 'git command fails (e.g., not in a git repo)')
		assert.ok(response.text.trim().endsWith(':nan0web/ui.git'))
	})

	/**
	 * @docs
	 * ## API Documentation
	 *
	 * Detailed API docs are available in each class JSDoc.
	 * Explore:
	 *
	 * - [Messages](./src/core/Message/)
	 * - [Forms](./src/core/Form/)
	 * - [Stream](./src/core/Stream.js)
	 * - [Components](./src/Component/)
	 * - [View](./src/View/)
	 * - [App](./src/App/)
	 * - [Models](./src/Model/)
	 *
	 * ## Project Architecture & Specs
	 *
	 * - [Package Architecture (`architecture.md`)](./architecture.md)
	 * - [Catalog & Filter Architecture (`architecture-catalog.md`)](./architecture-catalog.md)
	 * - [Universal Blocks Spec (`project.md`)](./project.md)
	 *
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
		const str = await fs.loadDocumentAs('.txt', 'CONTRIBUTING.md')
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocumentAs('.txt', 'LICENSE')
		assert.ok(text.includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	const source = await fs.loadDocument('src/docs/README.md.js')
	text = String(parser.decode(source))
	await fs.saveDocument('docs/en/README.md', { content: text })
	const dataset = DatasetParser.parse(text, pkg?.name ?? '@nan0web/ui')
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered in docs/en/README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocumentAs('.txt', 'docs/en/README.md')
		assert.ok(text.includes('## License'))
	})
})
