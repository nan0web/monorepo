import { describe, it, mock, before } from 'node:test'
import childProcess from 'node:child_process'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { EventEmitter } from 'node:events'

import { SpecRunner } from '@nan0web/ui/testing'

import { LlimoApp } from './app/LlimoApp.js'
import DB from '@nan0web/db'
import DBFS from '@nan0web/db-fs'
import { createT } from '@nan0web/types'
import { PipelineCommand } from '../Chat/commands/pipeline.js'

// Mock PipelineCommand.prototype.execSync to prevent recursive npm test run during pipeline:seed verification
mock.method(PipelineCommand.prototype, 'execSync', (cmd) => {
	if (cmd.includes('pnpm install')) {
		return 'Lockfile is up-to-date\nProgress: resolved 302, reused 302, downloaded 0, added 0, done'
	}
	if (cmd.includes('setup-agents.js')) {
		return 'Agent system setup completed. 19 workflows linked successfully.'
	}
	if (cmd.includes('npm test')) {
		return globalThis.mockTestOutput || 'Mocked test output: all 302 tests passed'
	}
	return `Executed: ${cmd}`
})

// Mock PipelineCommand.prototype.spawn to return mocked stream outputs without spawning real OS processes
mock.method(PipelineCommand.prototype, 'spawn', (cmd, args, options) => {
	const ee = new EventEmitter()
	const stdout = new Readable({
		read() {
			const output = globalThis.mockTestOutput || 'Mocked test output: all 302 tests passed'
			this.push(output)
			this.push(null)
		}
	})
	const stderr = new Readable({
		read() {
			this.push(null)
		}
	})
	// @ts-ignore
	ee.stdout = stdout
	// @ts-ignore
	ee.stderr = stderr
	process.nextTick(() => {
		ee.emit('close', 0)
	})
	return ee
})

class MemoryDB {
	constructor(initialFiles = {}) {
		this.files = new Map(Object.entries(initialFiles))
	}

	async has(path) {
		return this.files.has(path)
	}

	async exists(path) {
		return this.files.has(path)
	}

	async get(path) {
		if (!this.files.has(path)) {
			throw new Error(`File not found: ${path}`)
		}
		return this.files.get(path)
	}

	async load(path) {
		return this.get(path)
	}

	async set(path, content) {
		this.files.set(path, content)
	}

	async save(path, content) {
		return this.set(path, content)
	}

	async browse(path, options = {}) {
		const list = []
		for (const key of this.files.keys()) {
			if (key.startsWith('.agent') || key.startsWith('.git') || key.includes('node_modules')) {
				continue
			}
			list.push(key)
		}
		return list
	}

	async stat(path) {
		return { exists: this.files.has(path) }
	}
}

class MockAI {
	constructor(streamedText = '') {
		this.streamedText = streamedText
	}

	setModels(models) {
		this._models = models
	}

	findModel(id) {
		return {
			id,
			provider: 'cerebras',
			context_length: 65000,
			pricing: {
				calc(usage, costs) {
					if (costs) {
						costs.input = 0
						costs.reason = 0
						costs.output = 0
					}
					return 0
				},
			},
		}
	}

	async listModels() {
		return [{ id: 'gpt-oss-120b', provider: 'cerebras', context_length: 65000 }]
	}

	async streamText(model, messages, options) {
		const text = this.streamedText
		return {
			textStream: {
				async *[Symbol.asyncIterator]() {
					yield { type: 'text-delta', text }
				},
			},
			async *[Symbol.asyncIterator]() {
				yield { type: 'text-delta', text }
			},
			_totalUsage: {
				status: {
					type: 'resolved',
					value: { outputTokens: 120, inputTokens: 45 },
				},
			},
			_steps: {
				status: {
					type: 'resolved',
					value: [],
				},
			},
		}
	}
}

describe('PipelineModel OLMUI Scenarios', () => {
	before(() => {
		process.env.NODE_ENV = 'test'
	})

	const registry = {
		llimo: LlimoApp,
	}

	const mockT = (key, params = {}) => {
		let s = key
		for (const [k, v] of Object.entries(params)) {
			s = s.replace(`{${k}}`, v)
		}
		return s
	}

	it('Scenario 1: pipeline:seed in an Empty Project', async () => {
		const db = new DB({
			predefined: [],
		})
		await db.connect()
		const ai = new MockAI(`Here is the code:
---boundary:src/index.js---
console.log("hello empty project");
---boundary---
`)

		const stream = [
			{
				llimo: {
					command: 'pipeline:seed',
					intent: 'Create simple app',
					model: 'gpt-oss-120b',
				},
			},
			{ show: 'package.json not found' }, // 1. package.json not found
			{ show: 'Running pnpm install to link the workspace...' }, // 2. running pnpm install
			{ show: 'Project initialized successfully and linked to monorepo workspace!' }, // 3. project initialized
			{ show: 'Pipeline step: seed' }, // 4. step started
			{ show: 'Session: 1 workflows loaded' }, // 5. workflows loaded
			{ show: '*' }, // 6. context tokens count
			{ show: 'Initializing AI...' }, // 7. initializing AI
			{ show: '*' }, // 8. AI ready
			{ show: '*' }, // 9. specified model
			{ show: '*' }, // 9.5 warning: strategy not found
			{ show: '*' }, // 10. step complete
			{ show: 'Extracting files...' }, // 11. extracting files
			{ show: '*' }, // 12. extracted file
			{ show: 'Running tests...' }, // 13. running tests
			{ progress: '*' }, // test progress line 1
			{ progress: '*' }, // progress cleanup
			{ show: '✅ Tests: 0, Pass: 0, Fail: 0, Cancelled: 0, Skip: 0, Todo: 0 (0ms)' }, // 14. tests passed
			{ result: { status: 'ok' } },
		]

		const t = createT({})

		const runner = new SpecRunner({ stream, registry }, { assert, db, t, ai })

		for await (const _ of runner.run()) {
			// Drive generator completely
		}

		// Verify files got written correctly to memory DB
		assert.ok((await db.stat('package.json'))?.exists)
		assert.ok((await db.stat('src/index.js'))?.exists)
		const indexContent = await db.get('src/index.js')
		assert.match(indexContent, /hello empty project/)
	})

	it('Scenario 2: pipeline:seed in a Non-Empty Project (Context Injection)', async () => {
		const db = new DB({
			predefined: [
				['package.json', { name: 'existing-app' }],
				['src/domain/todo/Todo.js', 'class Todo {}'],
			],
		})
		await db.connect()
		const ai = new MockAI(`Here is the updated class:
---boundary:src/domain/todo/Todo.js---
class Todo {
	constructor() {
		this.done = false;
	}
}
---boundary---
`)

		const stream = [
			{
				llimo: {
					command: 'pipeline:seed',
					intent: 'Refactor Todo class',
					model: 'gpt-oss-120b',
				},
			},
			{ show: 'Pipeline step: seed' }, // 1. step started
			{ show: 'Session: 1 workflows loaded' }, // 2. workflows loaded
			{ show: '*' }, // 3. context tokens count
			{ show: 'Initializing AI...' }, // 4. initializing AI
			{ show: '*' }, // 5. AI ready
			{ show: '*' }, // 6. specified model
			{ show: '*' }, // 6.5 warning: strategy not found
			{ show: '*' }, // 7. step complete
			{ show: 'Extracting files...' }, // 8. extracting files
			{ show: '*' }, // 9. extracted file
			{ show: 'Running tests...' }, // 10. running tests
			{ progress: '*' }, // test progress line 1
			{ progress: '*' }, // progress cleanup
			{ show: '✅ Tests: 0, Pass: 0, Fail: 0, Cancelled: 0, Skip: 0, Todo: 0 (0ms)' }, // 11. tests passed
			{ result: { status: 'ok' } },
		]

		const t = createT({})
		const runner = new SpecRunner({ stream, registry }, { assert, db, t, ai })

		for await (const _ of runner.run()) {
			// Drive generator completely
		}

		assert.ok((await db.stat('src/domain/todo/Todo.js'))?.exists)
		const todoContent = await db.get('src/domain/todo/Todo.js')
		assert.match(todoContent, /this\.done = false/)
	})

	it('Scenario 3: pipeline:seed verifies raw markdown content preservation and single-line test summary', async () => {
		const tempDir = join(process.cwd(), '.test_home_scenario3')
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
		fs.mkdirSync(tempDir, { recursive: true })

		const db = new DBFS({
			predefined: [],
			cwd: tempDir,
		})
		await db.connect()

		// Mock _dbBrowse specifically for this test's workflow listing
		const originalDbBrowse = PipelineCommand.prototype._dbBrowse
		mock.method(PipelineCommand.prototype, '_dbBrowse', async function (path, options) {
			if (path.includes('.agent/session/workflows')) {
				return []
			}
			return originalDbBrowse.call(this, path, options)
		})

		globalThis.mockTestOutput =
			'# tests 5\n# suites 1\n# pass 5\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n# duration_ms 12.5'

		const ai = new MockAI(`Here is the docs:
---boundary:docs/uk/project.md---
# Title

| Column 1 | Column 2 |
| --- | --- |
| Row 1 | Row 2 |

- List item 1
---boundary---
`)

		const stream = [
			{
				llimo: {
					command: 'pipeline:seed',
					intent: 'Create docs',
					model: 'gpt-oss-120b',
				},
			},
			{ show: 'package.json not found' }, // package.json not found
			{ show: 'Running pnpm install to link the workspace...' }, // running pnpm install
			{ show: 'Project initialized successfully and linked to monorepo workspace!' }, // project initialized
			{ show: 'Pipeline step: seed' }, // step started
			{ show: 'Session: 1 workflows loaded' }, // workflows loaded
			{ show: '*' }, // context tokens count
			{ show: 'Initializing AI...' }, // initializing AI
			{ show: '*' }, // AI ready
			{ show: '*' }, // specified model
			{ show: '*' }, // strategy not found warning
			{ show: '*' }, // step complete
			{ show: 'Extracting files...' }, // extracting files
			{ show: '*' }, // extracted file
			{ show: 'Running tests...' }, // running tests
			{ progress: '*' }, // progress line 1
			{ progress: '*' }, // progress line 2
			{ progress: '*' }, // progress line 3
			{ progress: '*' }, // progress line 4
			{ progress: '*' }, // progress line 5
			{ progress: '*' }, // progress line 6
			{ progress: '*' }, // progress line 7
			{ progress: '*' }, // progress line 8
			{ progress: '*' }, // progress cleanup
			{
				show: '✅ Tests: 5, Pass: 5, Fail: 0, Cancelled: 0, Skip: 0, Todo: 0 (12.5ms)',
			},
			{ result: { status: 'ok' } },
		]

		const t = createT({})
		const runner = new SpecRunner({ stream, registry }, { assert, db, t, ai })

		try {
			for await (const intent of runner.run()) {
				// Drive generator completely
			}

			// Verify files got written correctly to memory DB
			assert.ok((await db.stat('docs/uk/project.md'))?.exists)
			const mdString = await db.loadDocumentAs('.txt', 'docs/uk/project.md')
			// It must contain the raw markdown table exactly, without it being formatted/stripped by DBFS Markdown AST saver
			assert.match(mdString, /\| Column 1 \| Column 2 \|/)
			assert.match(mdString, /\| --- \| --- \|/)
			assert.match(mdString, /\| Row 1 \| Row 2 \|/)
		} finally {
			globalThis.mockTestOutput = null
			PipelineCommand.prototype._dbBrowse = originalDbBrowse
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
	})
})
