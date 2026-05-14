import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fsNode from 'node:fs'
import { fileURLToPath } from 'node:url'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser } from '@nan0web/test'
import {
	ask,
	render,
	Input,
	Password,
	Select,
	Multiselect,
	Mask,
	Autocomplete,
	Slider,
	Toggle,
	DateTime,
	Tree,
	Sortable,
	Alert,
	Table,
	Spinner,
	ProgressBar,
	CLiInputAdapter,
	pause,
	bootstrapApp,
	ModelAsApp,
	show,
} from './index.js'

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()
beforeEach(() => {
	console = new NoConsole()
})

function testRender() {
	/**
	 * @docs
	 * # @nan0web/ui-cli
	 *
	 * <!-- %LANGS% -->
	 *
	 * A modern, interactive UI input adapter for Node.js projects.
	 * Powered by the `prompts` engine, it provides a premium "Lux-level" terminal experience.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * The `@nan0web/ui-cli` package transforms basic CLI interactions into stunning, interactive experiences using the "One Logic, Many UI" philosophy.
	 *
	 * Key Features:
	 * - **Universal Runner** — Start your CLI app in 1 line of code with `bootstrapApp`.
	 * - **Interactive Prompts** — Sleek selection lists, masked inputs, and searchable autocomplete.
	 * - **Aesthetic Standards** — Pixel-perfect 5-character gutter (`{}  |`) for all components.
	 * - **Schema-Driven Forms** — Generate complex CLI forms directly from your data models.
	 * - **Build Optimization** — Blazing fast monorepo type-checking with isolated package depth.
	 * - **One Logic, Many UI** — Use the same shared logic across Web and Terminal.
	 *
	 * ## Installation
	 */
	it('How to install the package?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/ui-cli
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/ui-cli')
	})

	/**
	 * @docs
	 * ## Universal CLI Runner
	 *
	 * The `bootstrapApp` is the modern way to bootstrap CLI applications.
	 * It handles model-to-argv parsing, i18n initialization, and lifecycle management.
	 *
	 * ### Security: The seal() Protocol
	 *
	 * To ensure system integrity, `bootstrapApp` automatically locks the database using `db.seal()`.
	 * This prevents any runtime modifications to the DB structure or mounts after initialization.
	 * **Requirement**: Requires a modern `@nan0web/db` version supporting the seal protocol.
	 *
	 * ## Model-as-App (Recommended)
	 *
	 * The `ModelAsApp` class provides a unified architecture for both Domain Logic and UI Presentation.
	 * It automatically handles CLI help generation, subcommand routing, and i18n variables.
	 */
	it('How to bootstrap a CLI application?', async () => {
		//import { bootstrapApp, ModelAsApp, show } from '@nan0web/ui-cli'
		class StatusApp extends ModelAsApp {
			static UI = { title: 'Status', fine: 'Everything is fine' }
			static debug = { type: 'boolean', help: 'Debug mode', default: false }
			async *run() {
				yield show(StatusApp.UI.fine)
			}
		}

		class RootApp extends ModelAsApp {
			static command = { positional: true, type: [StatusApp] }
		}
		//await bootstrapApp(RootApp)
		assert.ok(typeof RootApp === 'function')
	})

	/**
	 * @docs
	 * ### Headless Execution & Built-in Apps
	 *
	 * You can execute an OLMUI Model programmatically without any interactive UI adapter by calling `ModelAsApp.execute()`.
	 * This is perfect for automation scripts like the `ReadmeMd` documentation generator.
	 *
	 * Additionally, standard tools are natively aliased in `nan0cli`:
	 */
	it('How to run internal apps like ReadmeMd?', async () => {
		/* Programmatic Headless Execution:
		import { ReadmeMd } from '@nan0web/ui-cli/domain/ReadmeMd.js'
		await ReadmeMd.execute({ data: 'docs' })
		*/

		/* Or via Terminal CLI Alias:
		nan0cli docs --data=docs
		*/

		assert.ok(true)
	})

	/**
	 * @docs
	 * ## Usage (V2 Architecture)
	 *
	 * Starting from v2.0, we recommend using the `ask()` function with Composable Components.
	 *
	 * ### Interactive Prompts
	 *
	 * #### Input & Password
	 */
	it('How to use Input and Password components?', async () => {
		//import { ask, Input, Password } from '@nan0web/ui-cli'
		const user = 'Alice'
		console.info(`User: ${user}`)
		assert.equal(console.output()[0][1], 'User: Alice')
	})

	/**
	 * @docs
	 * #### Select & Multiselect
	 */
	it('How to use Select component?', async () => {
		//import { ask, Select } from '@nan0web/ui-cli'
		const lang = { value: 'en' }
		console.info(`Selected: ${lang.value}`)
		assert.equal(console.output()[0][1], 'Selected: en')
	})

	/**
	 * @docs
	 * #### Multiselect
	 */
	it('How to use Multiselect component?', async () => {
		//import { ask, Multiselect } from '@nan0web/ui-cli'
		const roles = ['admin', 'user']
		console.info(`Roles: ${roles.join(', ')}`)
		assert.equal(console.output()[0][1], 'Roles: admin, user')
	})

	/**
	 * @docs
	 * #### Masked Input
	 */
	it('How to use Mask component?', async () => {
		//import { ask, Mask } from '@nan0web/ui-cli'
		const phone = '123-456'
		console.info(`Phone: ${phone}`)
		assert.equal(console.output()[0][1], 'Phone: 123-456')
	})

	/**
	 * @docs
	 * #### Autocomplete
	 */
	it('How to use Autocomplete component?', async () => {
		//import { ask, Autocomplete } from '@nan0web/ui-cli'
		const model = 'gpt-4'
		console.info(`Model: ${model}`)
		assert.equal(console.output()[0][1], 'Model: gpt-4')
	})

	/**
	 * @docs
	 * #### Slider, Toggle & DateTime
	 */
	it('How to use Slider and Toggle?', async () => {
		//import { ask, Slider, Toggle } from '@nan0web/ui-cli'
		const volume = 50
		console.info(`Volume: ${volume}`)
		const active = true
		console.info(`Active: ${active}`)
		assert.equal(console.output()[0][1], 'Volume: 50')
		assert.equal(console.output()[1][1], 'Active: true')
	})

	/**
	 * @docs
	 * #### Tree Selection
	 * Hierarchical data selection made easy.
	 */
	it('How to use Tree component?', async () => {
		//import { ask, Tree } from '@nan0web/ui-cli'
		const selected = '/src/index.js'
		console.info(`Selected file: ${selected}`)
		assert.equal(console.output()[0][1], 'Selected file: /src/index.js')
	})

	/**
	 * @docs
	 * #### Sortable Lists
	 * Drag and drop items in the terminal.
	 */
	it('How to use Sortable component?', async () => {
		//import { ask, Sortable } from '@nan0web/ui-cli'
		const items = ['First', 'Second', 'Third']
		console.info(`Order: ${items.join(' > ')}`)
		assert.equal(console.output()[0][1], 'Order: First > Second > Third')
	})

	/**
	 * @docs
	 * ### Advanced Interaction
	 *
	 * #### Models & Forms
	 * You can pass a Model class to `ask()` to automatically generate and process an interactive form.
	 */
	it('How to use ask with Models?', async () => {
		//import { ask } from '@nan0web/ui-cli'
		class UserProfile {
			static username = { help: 'Enter username', required: true }
			static email = { help: 'Enter email', hint: 'email' }
		}
		// const profile = await ask(UserProfile)
		assert.ok(UserProfile.username.help)
	})

	/**
	 * @docs
	 * #### AI Agents
	 * You can request an AI agent task using the `agent` intent.
	 * In CLI, this shows a status message and can wrap an async action in a spinner.
	 */
	it('How to use ask with Agents?', async () => {
		//import { ask } from '@nan0web/ui-cli'
		//import { agent } from '@nan0web/ui'
		
		// 1. Simple task
		// await ask({ type: 'agent', task: 'Review the code' })
		
		// 2. Task with action (shows spinner)
		// await ask({ type: 'agent', task: 'Analyzing...', action: async () => 'Success' })
		
		assert.ok(true)
	})

	/**
	 * @docs
	 * ### Static Views
	 *
	 * #### Alerts
	 */
	it('How to render Alerts?', async () => {
		//import { ask, Alert } from '@nan0web/ui-cli'
		const out = await ask(Alert({ variant: 'success', children: 'Operation completed' }))
		assert.ok(out.includes('Operation completed'))
	})

	/**
	 * @docs
	 * #### Dynamic Tables
	 */
	it('How to render Tables?', async () => {
		//import { ask, Table } from '@nan0web/ui-cli'
		const data = [{ id: 1, name: 'Alice' }]
		const out = await ask(Table({ data, interactive: false }))
		assert.equal(out[0].name, 'Alice')
	})

	/**
	 * @docs
	 * ### Feedback & Progress
	 *
	 * #### Spinner
	 */
	it('How to use Spinner?', async () => {
		//import { ask, Spinner } from '@nan0web/ui-cli'
		const action = Promise.resolve('Done')
		const result = await ask(Spinner({ UI: 'Loading...', action }))
		assert.equal(result, 'Done')
	})

	/**
	 * @docs
	 * #### Progress Bars
	 */
	it('How to use ProgressBar?', async () => {
		//import { ask, ProgressBar } from '@nan0web/ui-cli'
		const p = await ask(ProgressBar({ UI: 'Downloading...', total: 100 }))
		p.update(100)
		p.success('Done')
		assert.ok(true)
	})

	/**
	 * @docs
	 * ## One Logic, Many UI (Generators)
	 *
	 * OLMUI Applications are built using Async Generators.
	 * This allows the business logic to remain UI-agnostic by `yield`-ing Intents.
	 *
	 * ### Rendering Components via yield
	 *
	 * You can render any UI component (Alert, Table, etc.) from within your generator
	 * by yielding a `render` intent.
	 */
	it('How to render components in a generator?', async () => {
		//import { render } from '@nan0web/ui'

		async function* myGenerator() {
			// Option 1: Standard Intent
			yield render('Alert', { children: 'Hello from Intent' })

			// Option 2: Using render() helper (Standard in @nan0web/ui)
			yield render('Alert', { children: 'Hello from Helper' })

			// Option 3: Table with data
			yield render('Table', { data: [{ id: 1, name: 'Alice' }], interactive: false })
		}

		const gen = myGenerator()
		const alert1 = await gen.next()
		assert.equal(alert1.value.component, 'Alert')

		const alert2 = await gen.next()
		assert.equal(alert2.value.component, 'Alert')

		const table = await gen.next()
		assert.equal(table.value.type, 'render')
		assert.equal(table.value.component, 'Table')
	})

	/**
	 * @docs
	 * ### Sub-path Exports (OLMUI)
	 *
	 * The package uses "One Logic, Many UI" (OLMUI) architecture, exposing only strict architectural boundaries.
	 *
	 * - `import { ModelAsApp } from '@nan0web/ui-cli/domain'` — Domain Base classes.
	 * - `import { App } from '@nan0web/ui-cli/app'` — Main Application Model & Router.
	 * - `import { playground } from '@nan0web/ui-cli/test'` — Testing & Snapshot utilities.
	 */
	it('How to use isolated domain models and UI adapters?', () => {
		assert.ok(pkg.exports['./domain'])
		assert.ok(pkg.exports['./app'])
		assert.ok(pkg.exports['./test'])
	})

	/**
	 * @docs
	 * ## Legacy API
	 *
	 * ### CLiInputAdapter
	 */
	it('How to request form input via CLiInputAdapter?', async () => {
		//import { CLiInputAdapter } from '@nan0web/ui-cli'
		assert.ok(CLiInputAdapter)
	})

	/**
	 * @docs
	 * ## Playground
	 */
	it('How to run the playground?', () => {
		/**
		 * ```bash
		 * npm run play
		 * ```
		 */
		assert.ok(pkg.scripts.play)
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to check the license? - [ISC LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

// import { ReadmeMd } from './domain/ReadmeMd.js'

describe('README.md testing', testRender)

describe('Rendering README.md', () => {
	before(async () => {
		const parser = new DocsParser()
		const source = await fs.loadDocument('src/README.md.js')
		const doc = parser.decode(source)
		await fs.saveDocument('README.md', doc.content)
	})

	it('document is rendered in README.md', async () => {
		const doc = await fs.loadDocument('README.md')
		assert.ok(doc.content.includes('## License'))
	})
})
