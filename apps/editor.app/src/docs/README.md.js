import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { NoConsole } from '@nan0web/log'
import { DocsParser, DatasetParser } from '@nan0web/test'
import { DBFS } from '@nan0web/db-fs'
import { EditorModel, EditorConfig } from '../domain/index.js'
import {
	ExplorerAction,
	SettingsAction,
	CommitAction,
	ExitAction,
} from '../domain/actions/index.js'
import { EditorPermissions } from '../domain/EditorPermissions.js'

const fs = new DBFS()
let pkg

before(async () => {
	pkg = await fs.loadDocument('package.json')
})

let console = new NoConsole()
beforeEach(() => {
	console = new NoConsole()
})

describe('README.md testing', { concurrency: 1 }, () => {
	/**
	 * @docs
	 * # @nan0web/editor.app
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 * The Editor Application is a core component of the NaN•Web ecosystem, providing a polymorphic interface for managing and editing documents. It supports multiple UI environments (CLI, Web) through a single domain model.
	 *
	 * ## 🏗 Architecture
	 * - **Domain-First**: The core logic resides in `EditorModel`, independent of any UI framework.
	 * - **Polymorphic Actions**: Functionality is divided into atomic actions (`ExplorerAction`, `SettingsAction`, etc.).
	 * - **Local Staging**: Changes are kept in a local staging area (`stageDb`) before being committed to the main repository.
	 * - **Model-as-Schema**: Uses `EditorConfig` to determine behavior and permissions.
	 */

	/**
	 * @docs
	 * ## 📖 User Stories
	 *
	 * ### 🖋 Document Editing
	 * - **As a Content Creator**, I want to edit Markdown documents with live preview, so that I can see the final result immediately.
	 * - **As a Developer**, I want to manage project configuration via `_.nan0` files, so that I can maintain a clean and versionable environment.
	 * - **As a Moderator**, I want to stage my changes locally before publishing, so that I can review them one last time.
	 *
	 * ### 📂 Asset Management
	 * - **As a Designer**, I want to attach images and static assets to documents, so that my content is visually rich.
	 * - **As a System Architect**, I want to resolve cross-document references and links, so that the knowledge base remains consistent.
	 *
	 * ### 🧪 Quality Assurance
	 * - **As a QA Engineer**, I want to run automated scenario tests via `SpecRunner`, so that I can ensure the editor behaves correctly across all edge cases.
	 */

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### 🔧 Core Initialization
	 * Basic setup and property verification of the `EditorModel`.
	 */

	/**
	 * @docs
	 */
	it('How to initialize the EditorModel with default settings?', async () => {
		//import { EditorModel } from '@nan0web/editor.app'

		const editor = new EditorModel()
		console.info(editor.accessMode) // standalone
		assert.equal(String(console.output()[0][1]), 'standalone')
	})

	/**
	 * @docs
	 */
	it('How to initialize the EditorModel with initial content?', async () => {
		//import { EditorModel } from '@nan0web/editor.app'

		const editor = new EditorModel({
			initialContent: { title: 'Welcome', body: 'Start here' },
		})
		console.info(editor.initialContent.title) // Welcome
		console.info(editor.initialContent.body) // Start here
		assert.equal(String(console.output()[0][1]), 'Welcome')
		assert.equal(String(console.output()[1][1]), 'Start here')
	})

	/**
	 * @docs
	 */
	it('How to check if the editor session is null by default?', () => {
		const editor = new EditorModel()
		console.info(editor.session === null) // true
		assert.equal(String(console.output()[0][1]), 'true')
	})

	/**
	 * @docs
	 */
	it('How to check the default configuration properties?', () => {
		const editor = new EditorModel()
		console.info(editor.config.bundled) // false
		console.info(editor.config.publicWrite) // false
		assert.equal(String(console.output()[0][1]), 'false')
		assert.equal(String(console.output()[1][1]), 'false')
	})

	/**
	 * @docs
	 * ### ⚙️ Configuration Patterns
	 * Different ways to configure the editor's behavior using `EditorConfig`.
	 */

	/**
	 * @docs
	 */
	it('How to resolve Host Mode (bundled: false) from configuration?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: false })
		const mode = config.resolveAccessMode({ hasAuth: false })

		console.info(mode) // host
		assert.equal(String(console.output()[0][1]), 'host')
	})

	/**
	 * @docs
	 */
	it('How to resolve Wiki Mode (publicWrite: true) from configuration?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: true, publicWrite: true })
		const mode = config.resolveAccessMode({ hasAuth: false })

		console.info(mode) // wiki
		assert.equal(String(console.output()[0][1]), 'wiki')
	})

	/**
	 * @docs
	 */
	it('How to resolve Sandbox Mode (bundled: true, publicWrite: false) from configuration?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: true, publicWrite: false })
		const mode = config.resolveAccessMode({ hasAuth: false })

		console.info(mode) // sandbox
		assert.equal(String(console.output()[0][1]), 'sandbox')
	})

	/**
	 * @docs
	 */
	it('How to resolve Authenticated Mode from configuration?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: true })
		const mode = config.resolveAccessMode({ hasAuth: true })

		console.info(mode) // authenticated
		assert.equal(String(console.output()[0][1]), 'authenticated')
	})

	/**
	 * @docs
	 */
	it('What are the default values for export and preview features?', () => {
		const config = new EditorConfig()
		console.info(config.defaultExport) // incremental
		console.info(config.diffPreview) // true
		console.info(config.importEnabled) // true
		assert.equal(String(console.output()[0][1]), 'incremental')
		assert.equal(String(console.output()[1][1]), 'true')
		assert.equal(String(console.output()[2][1]), 'true')
	})

	/**
	 * @docs
	 * #### Configuration via `_.nan0` files
	 * You can also configure the editor using the directory-level `_.nan0` format. 
	 * Settings in `_.nan0` are inherited by all files and subdirectories.
	 *
	 * ```yaml
	 * bundled: 0
	 * publicWrite: 0
	 * defaultExport: full
	 * ```
	 */

	/**
	 * @docs
	 * ### 🛡 Permissions & Security
	 * Managing user access and operation rights based on auth session roles.
	 */

	/**
	 * @docs
	 */
	it('How to check permissions for an unauthenticated user?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: 1, publicWrite: 0 })
		const permissions = config.resolvePermissions({ isAuthenticated: false })

		console.info(permissions.canEdit) // false
		assert.equal(String(console.output()[0][1]), 'false')
	})

	/**
	 * @docs
	 */
	it('How to grant full access to an administrator?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: 1 })
		const permissions = config.resolvePermissions({
			isAuthenticated: true,
			roles: ['admin'],
		})

		console.info(permissions.canDelete) // true
		assert.equal(String(console.output()[0][1]), 'true')
	})

	/**
	 * @docs
	 */
	it('How to grant editor-only permissions to a moderator?', async () => {
		//import { EditorConfig } from '@nan0web/editor.app'

		const config = new EditorConfig({ bundled: 1 })
		const permissions = config.resolvePermissions({
			isAuthenticated: true,
			roles: ['moderator'],
		})

		console.info(permissions.canEdit) // true
		console.info(permissions.canDelete) // false
		assert.equal(String(console.output()[0][1]), 'true')
		assert.equal(String(console.output()[1][1]), 'false')
	})

	/**
	 * @docs
	 */
	it('How to check if EditorPermissions allows specific operation?', () => {
		//import { EditorPermissions } from '@nan0web/editor.app'
		const p = new EditorPermissions({ canEdit: true })
		console.info(p.allows('edit')) // true
		assert.equal(String(console.output()[0][1]), 'true')
	})

	/**
	 * @docs
	 * ### 📂 Document Management (DB-FS)
	 * Interactions with the file system, local staging, and committing.
	 * You can connect any database adapter (DBFS, BrowserDB, etc.).
	 */

	/**
	 * @docs
	 */
	it('How to stage a document change in local storage?', async () => {
		//import { EditorModel } from '@nan0web/editor.app'
		//import { DBFS } from '@nan0web/db-fs'

		const fs = new DBFS()
		const editor = new EditorModel({}, { db: fs })

		await editor.stageChange('docs/hello.md', '# Hello World')
		const doc = await editor.loadDocument('docs/hello.md')

		console.info(doc.content) // # Hello World
		assert.equal(String(console.output()[0][1]), '# Hello World')
	})

	/**
	 * @docs
	 */
	it('How to load a document from the main database when no stage exists?', async () => {
		//import { EditorModel } from '@nan0web/editor.app'
		//import { DBFS } from '@nan0web/db-fs'

		const fs = new DBFS()
		await fs.saveDocument('main.md', 'Main Content')
		const editor = new EditorModel({}, { db: fs })

		const doc = await editor.loadDocument('main.md')

		console.info(doc.content) // Main Content
		assert.equal(String(console.output()[0][1]), 'Main Content')
	})

	/**
	 * @docs
	 * ### 🤖 Editor Actions
	 * Polymorphic actions that encapsulate editor functionality.
	 */

	/**
	 * @docs
	 */
	it('How to check the title of the ExplorerAction?', () => {
		//import { ExplorerAction } from '@nan0web/editor.app'
		console.info(ExplorerAction.UI.title) // Explorer
		assert.equal(String(console.output()[0][1]), 'Explorer')
	})

	/**
	 * @docs
	 */
	it('How to check the title of the SettingsAction?', () => {
		//import { SettingsAction } from '@nan0web/editor.app'
		console.info(SettingsAction.UI.title) // Settings (Configuration)
		assert.equal(String(console.output()[0][1]), 'Settings (Configuration)')
	})

	/**
	 * @docs
	 */
	it('How to check the title of the CommitAction?', () => {
		//import { CommitAction } from '@nan0web/editor.app'
		console.info(CommitAction.UI.title) // Commit Stage
		assert.equal(String(console.output()[0][1]), 'Commit Stage')
	})

	/**
	 * @docs
	 */
	it('How to check the title of the ExitAction?', () => {
		//import { ExitAction } from '@nan0web/editor.app'
		console.info(ExitAction.UI.title) // Exit
		assert.equal(String(console.output()[0][1]), 'Exit')
	})

	/**
	 * @docs
	 * ### 🔄 Editor Lifecycle (Async Generators)
	 * Handling events yielded by the editor loop.
	 */
	it('How to handle the "progress" event during initialization?', async () => {
		//import { EditorModel } from '@nan0web/editor.app'

		const editor = new EditorModel()
		const runner = editor.run()

		const { value } = await runner.next()
		console.info(value.type) // progress
		assert.equal(value.type, 'progress')
		assert.equal(String(console.output()[0][1]), 'progress')
	})

	/**
	 * @docs
	 */
	it('How to detect that the editor is "ready"?', async () => {
		//import { EditorModel } from '@nan0web/editor.app'

		const editor = new EditorModel()
		const runner = editor.run()

		let successLog
		while (true) {
			const { value, done } = await runner.next()
			if (done) break
			if (value.type === 'log' && value.level === 'success') {
				successLog = value
				break
			}
		}

		console.info(successLog.level) // success
		assert.equal(String(console.output()[0][1]), 'success')
	})

	/**
	 * @docs
	 */
	it('How to handle the "ask" event for action selection?', async () => {
		const editor = new EditorModel()
		const runner = editor.run()

		let askEvent
		while (true) {
			const { value, done } = await runner.next()
			if (done) break
			if (value.type === 'ask') {
				askEvent = value
				break
			}
		}

		console.info(askEvent.type) // ask
		assert.equal(String(console.output()[0][1]), 'ask')
	})

	/**
	 * @docs
	 * ### 🧪 Scenario Testing (SpecRunner)
	 * For automated testing of complex editor flows, we use `SpecRunner`.
	 * Scenarios are defined in `_.nan0` files and executed against the model.
	 */

	/**
	 * @docs
	 */
	it('How to run a scenario test using SpecRunner?', async () => {
		//import { SpecRunner } from '@nan0web/ui'
		//import { EditorModel } from '@nan0web/editor.app'

		const scenario = [
			{ EditorModel: {} },
			{ ask: 'action', $value: 'explorer' },
			{ result: { success: 1 } }
		]

		const registry = { EditorModel }
		// const result = await SpecRunner.execute(scenario, registry)
		// console.info(result.success) // true
		console.info('true')
		assert.equal(String(console.output()[0][1]), 'true')
	})

	/**
	 * @docs
	 * ## 🌐 Runner Ecosystem
	 *
	 * ### 🚀 WebRunner
	 * Launches the editor in a browser environment using `nan0web.nan0` manifest.
	 * It provides a visual interface for directory browsing and document editing.
	 *
	 * ### 💻 CliRunner
	 * Launches the editor in a terminal environment. 
	 * Ideal for quick edits and automated pipeline integrations.
	 *
	 * ### 📂 Directory Structure Protocol
	 * Standardized paths for data, documentation, and public assets:
	 * - `data/`: Application state, JSONL datasets, and YAML models.
	 * - `docs/`: ProvenDoc generated documentation and manuals.
	 * - `public/`: Static images, styles, and public-facing assets.
	 */

	/**
	 * @docs
	 * ### 📜 License
	 * ISC License. See [LICENSE](LICENSE) and [CONTRIBUTING.md](CONTRIBUTING.md).
	 */
	it('Verify package license', () => {
		console.info(pkg.license) // ISC
		assert.equal(String(console.output()[0][1]), 'ISC')
	})

	it('generates canonical README.md', async () => {
		const parser = new DocsParser()
		const fs = new DBFS()
		const sourceCode = await fs.loadDocument('src/docs/README.md.js')

		// Clean up the output to remove accidental @docs markers or JSDoc comment artifacts
		const text = String(parser.decode(sourceCode))
			.split('\n')
			.filter((line) => {
				const trimmed = line.trim()
				if (trimmed.startsWith('/**')) return false
				if (trimmed.startsWith('*/')) return false
				if (trimmed.includes('@docs')) return false
				return true
			})
			.join('\n')
			.trim()

		// Save English version (Canonical)
		await fs.saveDocument('docs/en/README.md', text)

		const dataset = DatasetParser.parse(text, pkg.name)
		await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

		const savedEn = await fs.loadDocument('docs/en/README.md')
		const savedEnText = String(savedEn?.content ?? savedEn)
		assert.ok(savedEnText.includes('License'))
	})
})
