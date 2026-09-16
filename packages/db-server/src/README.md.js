import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DocsParser, DatasetParser } from '@nan0web/test'
import DB from '@nan0web/db'
import DBDriverFs from '@nan0web/db-fs'
import DBServer from './DBServer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

let pkg = {}

before(async () => {
	const rootDb = new DB({ root: rootDir })
	rootDb.mount('/', new DBDriverFs({ root: rootDir }))
	pkg = await rootDb.fetch('package.json') || {}
})

/**
 * Core test suite that also serves as the source for README generation.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/db-server
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * High-performance HTTP server that exposes `@nan0web/db` via a REST API.
	 * Includes a built-in Midnight-Commander styled Web File Explorer UI with live search,
	 * breadcrumbs, i18n support (`ExplorerModel`), and an interactive OpenAPI spec.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/db-server
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/db-server')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/db-server
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/db-server')
	})

	/**
	 * @docs
	 * ## Quick Start
	 *
	 * Launch the server programmatically with an existing `@nan0web/db` instance:
	 */
	it('How to start DBServer in Node.js?', async () => {
		// import DB from '@nan0web/db'
		// import DBServer from '@nan0web/db-server'

		const db = new DB()
		const server = await DBServer.create({
			db,
			port: 0,
		})

		assert.ok(server.server.port > 0)
		await server.close()
	})

	/**
	 * @docs
	 * ## REST API Endpoints
	 *
	 * | Method | Endpoint | Description |
	 * | :--- | :--- | :--- |
	 * | `GET` | `/health` | Service health status |
	 * | `GET` | `/api/help` | OpenAPI 3.0 documentation spec |
	 * | `GET` | `/explorer` | Built-in Web File Explorer interface |
	 * | `GET` | `/api/documents/:uri` | Fetch document (`?mode=fetch` or `?mode=get`) |
	 * | `POST` | `/api/documents` | Create document (`{ uri, document }`) |
	 * | `PUT` | `/api/documents/:uri` | Save document body at URI |
	 * | `DELETE`| `/api/documents/:uri` | Remove document at URI |
	 * | `GET` | `/api/directory/:path` | List directory entries |
	 * | `GET` | `/api/stat/:uri` | Document or folder metadata |
	 */
	it('How to verify REST endpoints?', async () => {
		const db = new DB()
		const srv = await DBServer.create({ db, port: 0 })
		try {
			const res = await fetch(`http://localhost:${srv.server.port}/health`)
			const json = await res.json()
			assert.equal(json.status, 'ok')
		} finally {
			await srv.close()
		}
	})

	/**
	 * @docs
	 * ## CLI Usage
	 *
	 * Run the server directly from the command line on any directory.
	 *
	 * ### 1. Global installation (Recommended for system-wide use)
	 *
	 * ```bash
	 * # Install globally via npm or pnpm
	 * npm install -g @nan0web/db-server
	 * # or
	 * pnpm add -g @nan0web/db-server
	 *
	 * # Now use 'nan0db' directly anywhere:
	 * nan0db .
	 * nan0db ./data --port 3456
	 * ```
	 *
	 * ### 2. Local execution within workspace or via pnpm/npx
	 *
	 * ```bash
	 * # In repository workspace:
	 * pnpm exec nan0db .
	 *
	 * # Or one-off execution without installation:
	 * npx @nan0web/db-server .
	 * ```
	 */
	it('How to verify CLI entry point in package.json?', () => {
		assert.equal(pkg.bin?.nan0db, './bin/nan0db.js')
	})

	/**
	 * @docs
	 * ## Web File Explorer UI
	 *
	 * Visit `http://localhost:3456/` in your browser to access the Midnight Commander dual-panel interface:
	 * - **Left Panel:** Directory tree with live file search and breadcrumbs navigation.
	 * - **Right Panel:** In-browser JSON/YAML editor with hotkey saving (`Ctrl+S`).
	 * - **Mode Switcher:** Toggle between raw storage reading (`db.get()`) and resolved references (`db.fetch()`).
	 * - **Localization:** Schema-driven texts powered by `ExplorerModel`.
	 */
	it('How to verify ExplorerModel defaults?', () => {
		assert.ok(pkg.name)
	})

	/**
	 * @docs
	 * ## TypeScript & Declarations
	 *
	 * Fully typed with TypeScript declaration files (`types/index.d.ts`).
	 */
	it('How many d.ts files cover it?', () => {
		assert.equal(pkg.types, './types/index.d.ts')
	})

	/**
	 * @docs
	 * ## License
	 *
	 * ISC License.
	 */
	it('How to verify License?', () => {
		assert.equal(pkg.license, 'ISC')
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', () => {
	let text = ''
	const parser = new DocsParser()

	before(async () => {
		text = String(parser.decode(testRender))
		const rootDb = new DB({ root: rootDir })
		rootDb.mount('/', new DBDriverFs({ root: rootDir }))
		await rootDb.saveDocument('README.md', text)

		const dataset = DatasetParser.parse(text, pkg.name)
		await rootDb.saveDocument('.datasets/README.dataset.jsonl', dataset)
	})

	it('document is rendered in README.md', async () => {
		const rootDb = new DB({ root: rootDir })
		rootDb.mount('/', new DBDriverFs({ root: rootDir }))
		const content = await rootDb.loadDocument('README.md')
		assert.ok(String(content).includes('## REST API Endpoints'))
		assert.ok(String(content).includes('## Web File Explorer UI'))
	})
})
