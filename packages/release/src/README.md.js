import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DatasetParser, DocsParser, runSpawn } from '@nan0web/test'
import ReleaseCLi from './ui/cli/ReleaseCLi.js'
import Release from './Release.js'
import ReleaseDocument from './Release/Document.js'
import Person from './Release/Person.js'
import {
	ProjectManagement,
	ReleaseManager,
	TaskTestSuite,
	ChangelogTaskManager,
} from './architecture/ProjectManagementAsCode.js'

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/release
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * Project management as code, Git-native, GPG-signed, and test-driven.
	 *
	 * Unlike traditional project tools that require constant syncing or manual updates,
	 * `@nan0web/release` enforces project structure where:
	 * - Tasks are represented as tests in `.test.js` files.
	 * - Status is tracked via test outcomes.
	 * - Team roles and approvals are stored in structured files.
	 * - All changes are signed, versioned, and composable.
	 *
	 * This ensures:
	 * - Clear, automatable project tracking.
	 * - Immutable release notes and retro reflections.
	 * - Zero ambiguity – tasks don't exist unless tested.
	 *
	 * ## Installation
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/release
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/release')
	})
	/**
	 * @docs
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/release
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/release')
	})
	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/release
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/release')
	})

	/**
	 * @docs
	 * ## CLI Usage
	 *
	 * Start by initializing a new release:
	 */
	it('How to initialize a new release version?', () => {
		/**
		 * ```bash
		 * release init v1.0.0
		 * ```
		 */
		const cli = ReleaseCLi()
		assert.ok(cli.logger)
	})

	/**
	 * @docs
	 * Show release details:
	 */
	it('How to show release information?', () => {
		/**
		 * ```bash
		 * release show [--full]
		 * ```
		 */
		const release = new Release({
			version: 'v1.0.0',
			createdAt: new Date('2025-08-20'),
		})
		console.info(release.version) // v1.0.0
		assert.strictEqual(console.output()[0][1], 'v1.0.0')
	})

	/**
	 * @docs
	 * List all releases in the project:
	 */
	it('How to list all releases?', () => {
		/**
		 * ```bash
		 * release list [--json]
		 * ```
		 */
		const cli = ReleaseCLi()
		assert.ok(cli.logger)
	})

	/**
	 * @docs
	 * Add a chat message to the current release:
	 */
	it('How to write a release chat message?', () => {
		/**
		 * ```bash
		 * release chat write --user alice "Issue with the build pipeline"
		 * ```
		 */
		const cli = ReleaseCLi()
		assert.ok(cli.logger)
	})

	/**
	 * @docs
	 * Host a static server for viewing releases:
	 */
	it('How to host release UI?', () => {
		/**
		 * ```bash
		 * release host [--webui] [--port 3000]
		 * ```
		 */
		const cli = ReleaseCLi()
		assert.ok(cli.logger)
	})

	/**
	 * @docs
	 * Serve all release files for local inspection:
	 */
	it('How to serve release static assets?', () => {
		/**
		 * ```bash
		 * release serve [--port 8080]
		 * ```
		 */
		const cli = ReleaseCLi()
		assert.ok(cli.logger)
	})

	/**
	 * @docs
	 * Validate release tasks and integrity:
	 */
	it('How to validate release tasks?', () => {
		/**
		 * ```bash
		 * release validate [--ignore-fail]
		 * ```
		 */
		const release = new Release({
			version: 'v1.0.0',
			createdAt: new Date('2025-08-20'),
		})
		assert.ok(release instanceof Release)
	})

	/**
	 * @docs
	 * Seal the release with retro reflection:
	 */
	it('How to seal a release?', () => {
		/**
		 * ```bash
		 * release seal [--message "All core APIs are stable and tested"]
		 * ```
		 */
		const cli = ReleaseCLi()
		assert.ok(cli.logger)
	})

	/**
	 * @docs
	 * ## Core Concepts
	 *
	 * ### 1. Release as Object
	 *
	 * A `Release` is a structured class containing:
	 * - `version`: release identifier (vX.Y.Z).
	 * - `createdAt`, `startAt`, `planAt`, `completeAt`: datetime milestones.
	 * - `document`: parsed markdown document with structure-aware parsing.
	 *
	 * Each property is typed and validated automatically via JSDoc and runtime parsing.
	 */
	it('How to instantiate a Release?', () => {
		//import { Release } from '@nan0web/release'
		const release = new Release({
			version: 'v1.0.0',
			createdAt: '2025-08-20T10:00:00Z',
		})
		console.info(release.version) // ← v1.0.0
		console.info(release.createdAt instanceof Date) // ← true

		assert.strictEqual(console.output()[0][1], 'v1.0.0')
		assert.strictEqual(console.output()[1][1], true)
	})

	/**
	 * @docs
	 * ### 2. Release Document Parsing
	 *
	 * A `ReleaseDocument` extends `@nan0web/markdown` with:
	 * - Structured parsing of markdown release notes
	 * - Extraction of sections and tasks
	 * - Team and role parsing from markdown frontmatter or code
	 */
	it('How to parse release notes markdown into structured data?', () => {
		//import { ReleaseDocument } from '@nan0web/release'
		const md = `# v1.0.0 - 2025-08-20

## Overview
Release milestone includes UI polish and core API stabilization.

### Tasks
### Done **Implement core UI design** [ui.core-design]
### InProgress **Fix responsive issues in mobile layout** [ui.mobile-fixes]`

		const doc = ReleaseDocument.from(md)
		console.info(doc.version) // ← v1.0.0
		console.info(doc.date instanceof Date) // ← true
		console.info(doc.document.children instanceof Array) // ← true

		assert.strictEqual(console.output()[0][1], 'v1.0.0')
		assert.strictEqual(console.output()[1][1], true)
		assert.strictEqual(console.output()[2][1], true)
	})

	/**
	 * @docs
	 * ### 3. Person & Team Structures
	 *
	 * A `Person` instance includes:
	 * - `name`: HumanName
	 * - `gender`: HumanGender
	 * - `contacts`: array of HumanContact
	 */
	it('How to create a Person with typed properties?', () => {
		//import { Person } from '@nan0web/release'
		const person = new Person({
			name: ['Alice', 'Developer'],
			gender: 'female',
			contacts: ['mailto:alice@example.com'],
		})
		console.info(person.name.firstName) // ← Alice
		console.info(person.contacts.length >= 0) // ← true

		assert.strictEqual(console.output()[0][1], 'Alice')
		assert.strictEqual(console.output()[1][1], true)
	})

	/**
	 * @docs
	 * ## Architecture: Project Management as Code
	 *
	 * This architecture treats tasks as tests, roles as classes, and progress as validated outcomes.
	 *
	 * ### Task Management
	 *
	 * Tasks are registered as `taskId` → `testFilePath` in `ProjectManagement`.
	 * Their status is derived by running `node:test` suites.
	 */
	it('How to register and validate tasks as tests?', async () => {
		//import { ProjectManagement } from '@nan0web/release'
		const pm = new ProjectManagement()
		pm.registerTask('task-1', './tests/task1.test.js')
		pm.registerTask('task-2', './tests/task2.test.js')

		const mockResults = {
			passed: ['task-1'],
			failed: [],
			pending: ['task-2'],
		}

		pm.validateProjectState = async () => mockResults
		const results = await pm.validateProjectState()

		console.info(results.passed.includes('task-1')) // ← true
		console.info(results.pending.includes('task-2')) // ← true

		assert.strictEqual(console.output()[0][1], true)
		assert.strictEqual(console.output()[1][1], true)
	})

	/**
	 * @docs
	 * ### Release Processing
	 *
	 * The `ReleaseManager` coordinates releases and validates readiness.
	 * It ensures:
	 * - All registered tests pass
	 * - Version is correctly incremented
	 * - Git tag is applied if all validations succeed
	 */
	it('How to execute a release after validation?', async () => {
		//import { ReleaseManager, ProjectManagement } from '@nan0web/release'
		const pm = new ProjectManagement()
		const rm = new ReleaseManager(pm)

		rm.calculateVersion = () => 'v1.0.1'
		rm.publish = async () => true

		const result = await rm.executeRelease('patch')
		console.info(result.version) // ← v1.0.1
		console.info(result.published) // ← true

		assert.strictEqual(console.output()[0][1], 'v1.0.1')
		assert.strictEqual(console.output()[1][1], true)
	})

	/**
	 * @docs
	 * ### Changelog Integration
	 *
	 * Using `ChangelogTaskManager`, you can:
	 * - Extract task definitions from changelog entries
	 * - Generate corresponding test files
	 * - Automate task progression in CI
	 */
	it('How to parse changelog and extract tasks?', () => {
		//import { ChangelogTaskManager } from '@nan0web/release'
		const ctm = new ChangelogTaskManager()
		const changelog = `# Changelog

## [1.0.0] - 2025-08-20
### Added
- Initial structure [core.init]
- Release notes support [docs.release-notes]`

		const tasks = ctm.parseChangelog(changelog)
		console.info(Array.isArray(tasks)) // ← true
		console.info(tasks.length >= 0) // ← true

		assert.strictEqual(console.output()[0][1], true)
		assert.strictEqual(console.output()[1][1], true)
	})

	/**
	 * @docs
	 * ## Java•Script Features
	 */
	it('Uses JSDoc and .d.ts files for autocompletion', () => {
		assert.ok(pkg.types)
		assert.ok(pkg.types.includes('.d.ts'))
	})

	/**
	 * @docs
	 * ## CLI Playground
	 *
	 * Try the package in the terminal:
	 */
	it('How to run playground demo?', async () => {
		/**
		 * ```bash
		 * git clone https://github.com/nan0web/release.git
		 * cd release
		 * pnpm install
		 * pnpm run playground
		 * ```
		 */
		assert.ok(pkg.scripts?.playground)
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0)
		assert.ok(response.text.trim().endsWith(':nan0web/release.git'))
	})

	/**
	 * @docs
	 * ## Project Status
	 *
	 * To verify the project is ready, run:
	 */
	it('How to check project status before publishing?', async () => {
		/**
		 * ```bash
		 * npm test
		 * npm run test:coverage
		 * npm run test:status
		 * ```
		 */
		assert.ok(pkg.scripts?.test)
		assert.ok(pkg.scripts?.['test:coverage'])
		assert.ok(pkg.scripts?.['test:status'])
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license ISC? - [check here](./LICENSE)', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument('README.md', text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

	it(`document is rendered [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await readFile('README.md', 'utf8')
		assert.ok(text.includes('## License'))
	})
})
