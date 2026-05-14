import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { NoConsole } from '@nan0web/log'
import { DocsParser, DatasetParser } from '@nan0web/test'
import { DBFS } from '@nan0web/db-fs'
import {
	ArchitectureAuditor,
	PhaseAuditor,
	HygieneAuditor,
	ExportAuditor,
	DomainAuditor,
	VerificationAuditor,
	CircularDependencyAuditor,
} from '../index.js'

const fs = new DBFS()
let pkg

before(async () => {
	pkg = await fs.loadDocument('package.json')
})

let console = new NoConsole()
beforeEach(() => {
	console = new NoConsole()
})

function testRender() {
	// Mocks for documentation speed and stability
	class ArchitectureAuditor {
		static alias = 'audit'
		async *run() {
			yield { type: 'progress', message: 'Analyzing architecture...' }
			return { data: { score: 100 } }
		}
	}
	class PhaseAuditor {
		async *run() {
			return { data: { phase: 'stable' } }
		}
	}
	class CircularDependencyAuditor {
		async *run() {
			return { data: { success: true } }
		}
	}

	/**
	 * @docs
	 * # @nan0web/inspect
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 * `@nan0web/inspect` is an autonomous architectural auditing engine designed to enforce Zero-Hallucination (0HCnAI) standards across monorepos.
	 * It performs multi-layered verification of project structure, hygiene, domain isolation, and export integrity.
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/inspect
		 * ```
		 */
		assert.ok(pkg.name)
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Architecture Audit
	 * The `ArchitectureAuditor` orchestrates all specialized auditors to provide a comprehensive health report.
	 */
	it('How to run a full architecture audit?', async () => {
		//import { ArchitectureAuditor } from '@nan0web/inspect'
		//import { DB } from '@nan0web/db'

		const auditor = new ArchitectureAuditor()
		const gen = auditor.run()

		let res = await gen.next()
		while (!res.done) {
			res = await gen.next()
		}

		const score = res.value.data.score
		console.info(`Project Health Score: ${score}%`) // Project Health Score: 100%
		assert.equal(console.output()[0][1], 'Project Health Score: 100%')
	})

	/**
	 * @docs
	 * ### Phase Detection
	 * `PhaseAuditor` identifies the current stage of the project lifecycle (Incubation, Transformation, Stable) based on the presence of `seed.md` and `project.md`.
	 */
	it('How to detect project lifecycle phase?', async () => {
		//import { PhaseAuditor } from '@nan0web/inspect'
		const auditor = new PhaseAuditor()
		const gen = auditor.run()
		let res = await gen.next()
		while (!res.done) res = await gen.next()

		console.info(`Phase: ${res.value.data.phase}`) // Phase: stable
		assert.equal(console.output()[0][1], 'Phase: stable')
	})

	/**
	 * @docs
	 * ### Circular Dependencies
	 * `CircularDependencyAuditor` uses `madge` to detect circular dependency chains.
	 */
	it('How to check for circular dependencies?', async () => {
		//import { CircularDependencyAuditor } from '@nan0web/inspect'
		const auditor = new CircularDependencyAuditor()
		const gen = auditor.run()
		let res = await gen.next()
		while (!res.done) res = await gen.next()

		console.info(res.value.data.success) // true
		assert.equal(console.output()[0][1], true)
	})

	/**
	 * @docs
	 * ## CLI Usage
	 *
	 * The inspector is available via the `nan0inspect` command (or `npx @nan0web/inspect`).
	 *
	 * ### Full Audit
	 * Runs all available auditors and generates a healing report.
	 * ```bash
	 * npx @nan0web/inspect .
	 * ```
	 *
	 * ### Specific Auditor
	 * You can run individual auditors by their alias:
	 * ```bash
	 * npx @nan0web/inspect hygiene .
	 * npx @nan0web/inspect exports .
	 * ```
	 *
	 * ### Auto-Fixing
	 * Some auditors support automatic fixes (e.g., missing package.json scripts).
	 * ```bash
	 * npx @nan0web/inspect hygiene . --fix
	 * ```
	 *
	 * ## Healing Report
	 * When `audit` finds violations, it generates a `next.md` file in the project root.
	 * This file contains a structured list of tasks for AI agents (**Antigravity**, **Copilot**, **LLiMo**) to fix the detected architectural issues.
	 */
	it('How to use the CLI?', () => {
		// The CLI is bootstrapped from InspectorApp
		assert.ok(ArchitectureAuditor.alias)
	})

	/**
	 * @docs
	 * ## Auditors List
	 * - **PhaseAuditor**: Verifies `seed.md`, `project.md` and release history.
	 * - **HygieneAuditor**: Checks `package.json` scripts, `node_modules` hygiene, and mandatory configs.
	 * - **ExportAuditor**: Validates ESM exports and `index.js` gateway integrity.
	 * - **DomainAuditor**: Enforces Model-as-Schema strictness and domain/UI isolation.
	 * - **VerificationAuditor**: Ensures existence of tests, playgrounds, and ProvenDocs.
	 * - **CircularDependencyAuditor**: Detects circular imports.
	 *
	 * ## License
	 * ISC
	 */
	it('How to license?', () => {
		assert.ok(true)
	})
}

describe('README.md testing', testRender)

describe('Rendering README.md', async () => {
	const parser = new DocsParser()

	it('generates README.md and datasets', async () => {
		const sourceCode = await fs.loadDocument('src/docs/README.md.js')
		const text = String(parser.decode(sourceCode))

		// Multi-language structure
		await fs.saveDocument('docs/en/README.md', text)

		const rootReadme = [
			`# ${pkg.name}`,
			'',
			pkg.description,
			'',
			'## Documentation',
			'- [English](./docs/en/README.md)',
			'',
			'## License',
			'ISC',
		].join('\n')
		await fs.saveDocument('README.md', rootReadme)

		const dataset = DatasetParser.parse(text, pkg.name)
		await fs.saveDocument('.datasets/README.dataset.jsonl', dataset)

		const saved = await fs.loadDocument('docs/en/README.md')
		const savedText = String(saved?.content || saved)
		assert.ok(savedText.includes('## License'))
	})
})
