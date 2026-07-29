import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ChatSessionModel } from './ChatSessionModel.js'
import { GetCommand, LsCommand, SearchCommand } from './commands/index.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { exec } from 'node:child_process'



const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tempStatsDir = path.resolve(__dirname, 'temp_stats_dir')

/**
 * @param {AsyncGenerator<import('@nan0web/ui').Intent>} gen
 * @returns {Promise<any[]>}
 */
async function runGenerator(gen) {
	const events = []
	let nextVal = undefined
	while (true) {
		const { value, done } = await gen.next(nextVal)
		if (value) {
			events.push(value)
			if (value.type === 'ask' && value.field === 'confirm') {
				nextVal = { value: true, cancelled: false }
			} else {
				nextVal = { value: undefined, cancelled: true }
			}
		}
		if (done) break
	}
	return events
}

/**
 * Helper to run a command and get its result
 * @param {import('./commands/Command.js').Command} cmd
 * @returns {Promise<import('@nan0web/ui').ResultIntent>}
 */
async function runCommand(cmd) {
	const gen = cmd.run()
	let res
	while (true) {
		const { value, done } = await gen.next()
		if (done) {
			res = value
			break
		}
	}
	return res
}

describe('ChatSessionModel Cascade & Boundary Execution', () => {
	it('should cascade from failing model to successful one, save files, run whitelisted commands, and write stats', async () => {
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir} && mkdir -p ${tempStatsDir}`, resolve))

		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'.agent/strategy.json',
					{
						cascadeQueue: ['failing-model', 'working-model'],
						budgetLimitUsd: 1.5,
						timeoutMs: 5000,
						failoverLimit: 2,
						retryCount: 0,
						fallbackCodes: ['500'],
						concurrencyLimit: 1,
						cachingMode: 'none',
					},
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		// Mock OS Executor
		const writtenFiles = {}
		let executedCommand = null

		const mockOs = {
			async exists(p) {
				return !!writtenFiles[p]
			},
			async readFile(p) {
				return writtenFiles[p] || ''
			},
			async writeFile(p, content) {
				writtenFiles[p] = content
			},
			async executeCommand(cmd) {
				executedCommand = cmd
				return { code: 0, stdout: 'tests passed', stderr: '' }
			},
		}

		// Mock AI Engine
		const mockAi = {
			async streamText(modelInfo, messages) {
				if (modelInfo.id === 'failing-model') {
					throw new Error('API Timeout')
				}
				return {
					textStream: (async function* () {
						yield '---boundary:src/output.txt---\nhello from agent\n---boundary---\n'
						yield '---boundary:@bash---\npnpm test\n---boundary---'
					})(),
					usage: Promise.resolve({ promptTokens: 10, completionTokens: 20 }),
				}
			},
		}

		const model = new ChatSessionModel(
			{ input: 'build me a web app' },
			{
				db,
				os: mockOs,
				ai: mockAi,
				statsBaseDir: tempStatsDir,
				t: (key, vars) => {
					if (typeof key === 'function') return key
					return key.replace(/\{(\w+)\}/g, (_, k) => vars[k])
				},
			}
		)

		const events = await runGenerator(model.run())

		// Verify cascade tried failing-model and then working-model
		const tryFailing = events.some(
			(e) => e.type === 'show' && e.message.includes('Trying model: failing-model')
		)
		const tryWorking = events.some(
			(e) => e.type === 'show' && e.message.includes('Trying model: working-model')
		)
		assert.ok(tryFailing)
		assert.ok(tryWorking)

		// Verify files written
		assert.strictEqual(await db.loadDocument('src/output.txt'), 'hello from agent')

		// Verify whitelisted command was run automatically without prompt
		assert.strictEqual(executedCommand, 'pnpm test')

		// Verify stats logged
		const { StatsLogger } = await import('../../utils/StatsLogger.js')
		const stats = await StatsLogger.readAll(tempStatsDir)
		assert.strictEqual(stats.length, 1)
		assert.strictEqual(stats[0].modelId, 'working-model')
		assert.strictEqual(stats[0].inputTokens, 10)
		assert.strictEqual(stats[0].outputTokens, 20)

		// Cleanup
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir}`, resolve))
	})

	it('should pack input and positionals files correctly', async () => {
		const db = new DB()
		await db.connect()

		// Mock OS Executor
		const files = {
			'input.txt': '- [File A](fileA.js)\n- [File B](fileB.js)\nnormal line',
			'fileA.js': 'console.log("A")',
			'fileB.js': 'console.log("B")',
			'fileC.js': 'console.log("C")',
		}

		const mockOs = {
			async exists(p) {
				return !!files[p]
			},
			async readFile(p) {
				return files[p] || ''
			},
		}

		const model = new ChatSessionModel(
			{
				input: 'input.txt',
				_positionals: ['fileC.js'],
			},
			{
				db,
				os: /** @type {any} */ (mockOs),
			}
		)

		const packed = await model.packInput(model.input)

		assert.ok(packed.includes('console.log("A")'))
		assert.ok(packed.includes('console.log("B")'))
		assert.ok(packed.includes('console.log("C")'))
		assert.ok(packed.includes('#### [File A](fileA.js)'))
		assert.ok(packed.includes('#### [File B](fileB.js)'))
		assert.ok(packed.includes('#### [fileC.js](fileC.js)'))
		assert.ok(packed.includes('normal line'))
	})

	it('should build system prompt from data/{locale}/system.md with workflows index', async () => {
		const systemContent = '# System\n\n<!--WORKFLOWS_INDEX-->\n'

		// Mock db with readDir and loadDocument
		const mockDb = {
			async loadDocument(path) {
				if (path.endsWith('/system.md')) return systemContent
				return null
			},
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			},
			async *readDir(_path) {
				yield { name: 'nan0web.md' }
				yield { name: 'code-style.md' }
			},
		}

		const model = new ChatSessionModel({}, { db: /** @type {any} */ (mockDb) })
		const prompt = await model.buildSystemPrompt('uk')

		assert.ok(prompt.includes('# System'))
		assert.ok(prompt.includes('nan0web.md'))
		assert.ok(prompt.includes('code-style.md'))
		assert.ok(!prompt.includes('<!--WORKFLOWS_INDEX-->'))
	})

	it('should append specific workflows to system prompt and use fallback', async () => {
		const systemContent = '# System\n\n<!--WORKFLOWS_INDEX-->\n'
		const mockDb = {
			async loadDocument(path) {
				if (path.endsWith('/system.md')) return systemContent
				if (path.includes('uk/workflows/wf1.md')) return 'uk content'
				if (path.includes('en/workflows/wf2.md')) return 'en content'
				return null
			},
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			},
			async stat(path) {
				if (path.includes('uk/workflows/wf1.md')) return { exists: true }
				if (path.includes('en/workflows/wf2.md')) return { exists: true }
				return { exists: false }
			},
			async *readDir(_path) {
				yield { name: 'wf1.md' }
			}
		}

		const model = new ChatSessionModel(
			{ workflow: ['wf1', 'wf2'] },
			{ db: /** @type {any} */ (mockDb) }
		)
		const prompt = await model.buildSystemPrompt('uk')

		assert.ok(prompt.includes('### Workflow: wf1.md'))
		assert.ok(prompt.includes('uk content'))
		assert.ok(prompt.includes('### Workflow: wf2.md'))
		assert.ok(prompt.includes('en content')) // fallback to en
	})

	it('should auto-detect nan0web workspace and load default workflows', async () => {
		const systemContent = '# System\n\n<!--WORKFLOWS_INDEX-->\n'
		const mockDb = {
			async loadDocument(path) {
				if (path.endsWith('/system.md')) return systemContent
				if (path.endsWith('package.json')) return { name: '@nan0web/my-app' }
				if (path.includes('workflows/nan0web.md')) return 'nan0web flow'
				if (path.includes('workflows/architecture.md')) return 'architecture flow'
				if (path.includes('workflows/olm-ui-architecture-core.md')) return 'olm core flow'
				if (path.includes('workflows/code-style.md')) return 'style flow'
				return null
			},
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			},
			async exists(path) {
				return false
			},
			async stat(path) {
				return { exists: true }
			},
			async *readDir(_path) {
				yield { name: 'nan0web.md' }
			}
		}

		const model = new ChatSessionModel({}, { db: /** @type {any} */ (mockDb) })
		const prompt = await model.buildSystemPrompt('uk')

		assert.ok(prompt.includes('### Workflow: nan0web.md'))
		assert.ok(prompt.includes('### Workflow: architecture.md'))
		assert.ok(prompt.includes('### Workflow: olm-ui-architecture-core.md'))
		assert.ok(prompt.includes('### Workflow: code-style.md'))
	})

	it('should auto-detect scaffold requests and load scaffold workflows', async () => {
		const systemContent = '# System\n\n<!--WORKFLOWS_INDEX-->\n'
		const mockDb = {
			async loadDocument(path) {
				if (path.endsWith('/system.md')) return systemContent
				if (path.includes('workflows/init-project.md')) return 'init flow'
				if (path.includes('workflows/app-pipeline.md')) return 'pipeline flow'
				if (path.includes('workflows/pipeline-no1-seed.md')) return 'seed flow'
				return null
			},
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			},
			async exists(path) {
				return false
			},
			async stat(path) {
				return { exists: true }
			},
			async *readDir(_path) {
				yield { name: 'init-project.md' }
			}
		}

		const model = new ChatSessionModel(
			{ input: 'створи новий додаток calc' },
			{ db: /** @type {any} */ (mockDb) }
		)
		const prompt = await model.buildSystemPrompt('uk')

		assert.ok(prompt.includes('### Workflow: init-project.md'))
		assert.ok(prompt.includes('### Workflow: app-pipeline.md'))
		assert.ok(prompt.includes('### Workflow: pipeline-no1-seed.md'))
	})

	it('should load workflow file by name', async () => {
		const workflowContent = '# NaN·Web Workflow\n\nUse OLMUI.'

		const mockDb = {
			async loadDocument(path) {
				if (path.endsWith('nan0web.md')) return workflowContent
				return null
			},
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			},
		}

		const model = new ChatSessionModel({}, { db: /** @type {any} */ (mockDb) })
		const content = await model.loadWorkflow('nan0web.md', 'uk')

		assert.strictEqual(content, workflowContent)
	})

	it('should ask confirmation before saving files and discard if user says no', async () => {
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir} && mkdir -p ${tempStatsDir}`, resolve))
		const db = new DB()
		const localDb = new DB()
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		let writeCalled = false
		const mockOs = {
			async exists() {
				return false
			},
			async readFile() {
				return ''
			},
			async writeFile() {
				writeCalled = true
			},
		}

		const mockAi = {
			async streamText() {
				return {
					textStream: (async function* () {
						yield '---boundary:src/a.txt---\nhello\n---boundary---'
					})(),
					usage: Promise.resolve({ promptTokens: 10, completionTokens: 10 }),
				}
			},
		}

		const model = new ChatSessionModel(
			{ input: 'write a file', model: 'working-model' },
			{
				db,
				os: /** @type {any} */ (mockOs),
				ai: mockAi,
				statsBaseDir: tempStatsDir,
				t: (key) => key,
			}
		)

		const gen = model.run()
		const events = []
		let nextVal = undefined
		while (true) {
			const { value, done } = await gen.next(nextVal)
			if (value) {
				events.push(value)
				if (value.type === 'ask' && value.field === 'confirm') {
					nextVal = { value: false, cancelled: false }
				} else {
					nextVal = { value: undefined, cancelled: true }
				}
			}
			if (done) break
		}

		// Verify expected events are present
		assert.ok(events.some((e) => e.type === 'show' && e.message.includes('Trying model')))
		assert.ok(events.some((e) => e.type === 'progress' && e.message === 'Streaming...'))
		assert.ok(events.some((e) => e.type === 'show' && e.message === 'Files to save:'))
		assert.ok(events.some((e) => e.type === 'ask' && e.field === 'confirm'))
		assert.ok(events.some((e) => e.type === 'show' && e.message === 'File changes discarded.'))

		assert.strictEqual(writeCalled, false)
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir}`, resolve))
	})

	it('should execute commands only from @bash blocks and ignore others like @validate', async () => {
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir} && mkdir -p ${tempStatsDir}`, resolve))
		const db = new DB()
		const localDb = new DB()
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		const executed = []
		const mockOs = {
			async exists() {
				return false
			},
			async readFile() {
				return ''
			},
			async writeFile() {},
			async executeCommand(cmd) {
				executed.push(cmd)
				return { code: 0, stdout: 'ok', stderr: '' }
			},
		}

		const mockAi = {
			async streamText() {
				return {
					textStream: (async function* () {
						yield '---boundary:@validate---\nsome/file.js\n---boundary---\n'
						yield '---boundary:@bash---\npnpm test\n---boundary---'
					})(),
					usage: Promise.resolve({ promptTokens: 10, completionTokens: 10 }),
				}
			},
		}

		const model = new ChatSessionModel(
			{ input: 'run something', model: 'working-model' },
			{
				db,
				os: /** @type {any} */ (mockOs),
				ai: mockAi,
				statsBaseDir: tempStatsDir,
				t: (key, vars) => {
					if (typeof key === 'string' && vars && vars.command) {
						return key.replace('{command}', vars.command)
					}
					return key
				},
			}
		)

		const events = await runGenerator(model.run())

		assert.ok(events.some((e) => e.type === 'show' && e.message.includes('Executing command:')))
		assert.ok(events.some((e) => e.type === 'show' && e.message.includes('pnpm test')))

		assert.deepEqual(executed, ['pnpm test'])
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir}`, resolve))
	})

	it('should format Node.js test runner statistics into a single line summary', () => {
		const model = new ChatSessionModel({}, {})
		const stdout = `
			some logs before
			ℹ tests 32
			ℹ suites 16
			ℹ pass 32
			ℹ fail 0
			ℹ cancelled 0
			ℹ skipped 0
			ℹ todo 0
			ℹ duration_ms 250.462167
			some logs after
		`
		const summary = model.formatOneLineSummary(stdout)
		assert.strictEqual(summary, 'tests: 32, suites: 16, pass: 32, fail: 0, duration: 250.462167ms')
	})

	it('should fallback to first line or truncated output in formatOneLineSummary when no stats found', () => {
		const model = new ChatSessionModel({}, {})
		assert.strictEqual(model.formatOneLineSummary('  ✔ All files linted  '), '✔ All files linted')
		assert.strictEqual(model.formatOneLineSummary(''), 'Empty output')
	})

	it('should resolve paths for local, DB, workflows and glob patterns using micromatch', async () => {
		const mockFiles = [
			{ path: 'index.js' },
			{ path: 'app.js' },
			{ path: 'package.json' },
			{ path: 'src/domain/Model.test.js' },
			{ path: 'src/domain/Model.js' },
			{ path: 'src/utils/Helper.js' },
			{ path: 'src/utils/Helper.ts' },
			{ path: 'docs/readme.md' },
			{ path: 'data/_/langs.nan0' },
			{ path: '@data/uk/workflows/wf1.md' },
			{ path: '@data/uk/workflows/wf2.md' }
		]
		const mockDb = {
			async *browse(baseDir, options = {}) {
				const ignore = options.ignore || []
				for (const file of mockFiles) {
					if (baseDir.startsWith('@') !== file.path.startsWith('@')) {
						continue
					}
					if (baseDir !== '.' && !file.path.startsWith(baseDir)) {
						continue
					}
					const parts = file.path.split('/')
					const isIgnored = ignore.some(pat => parts.includes(pat))
					if (isIgnored) continue
					yield { uri: file.path }
				}
			}
		}

		const model = new ChatSessionModel({}, { db: /** @type {any} */ (mockDb) })

		// 1. Basic wildcard
		const paths1 = await model.resolvePaths('*.js')
		assert.deepEqual(paths1.map(p => p.path), ['index.js', 'app.js'])

		// 2. Recursive globstar
		const paths2 = await model.resolvePaths('src/**/*.test.js')
		assert.deepEqual(paths2.map(p => p.path), ['src/domain/Model.test.js'])

		// 3. Single character wildcard
		const paths3 = await model.resolvePaths('package.jso?')
		assert.deepEqual(paths3.map(p => p.path), ['package.json'])

		// 4. Brace expansion
		const paths4 = await model.resolvePaths('src/{domain,utils}/*.js')
		assert.deepEqual(paths4.map(p => p.path), ['src/domain/Model.test.js', 'src/domain/Model.js', 'src/utils/Helper.js'])

		// 5. Brace extension wildcard
		const paths5 = await model.resolvePaths('src/utils/*.{js,ts}')
		assert.deepEqual(paths5.map(p => p.path), ['src/utils/Helper.js', 'src/utils/Helper.ts'])

		// 6. Deep recursive markdown wildcard
		const paths6 = await model.resolvePaths('**/*.md')
		assert.deepEqual(paths6.map(p => p.path), ['docs/readme.md'])

		// 7. Database/workflow wildcard
		const paths7 = await model.resolvePaths('@data/uk/workflows/*.md')
		assert.deepEqual(paths7.map(p => p.path), ['@data/uk/workflows/wf1.md', '@data/uk/workflows/wf2.md'])

		// 8. Language file wildcard
		const paths8 = await model.resolvePaths('data/_/langs.*')
		assert.deepEqual(paths8.map(p => p.path), ['data/_/langs.nan0'])

		// 9. Standard non-glob workflows resolution
		const paths9 = await model.resolvePaths('@workflows/app-pipeline.md')
		assert.deepEqual(paths9, [{ path: '@data/uk/workflows/app-pipeline.md', isDb: true }])
	})

	it('should packInput with globs and database logical paths in checklist and positionals', async () => {
		const db = {
			async loadDocumentAs(ext, path) {
				if (path === '@data/uk/workflows/app-pipeline.md') {
					return 'workflow content'
				}
				return ''
			}
		}

		const mockOs = {
			async exists(path) {
				return path === 'package.json' || path === 'tsconfig.json'
			},
			async readFile(path) {
				if (path === 'package.json') {
					return '{"name": "test"}'
				}
				if (path === 'tsconfig.json') {
					return '{"compilerOptions": {}}'
				}
				return ''
			}
		}

		const model = new ChatSessionModel(
			{
				input: 'Referenced files:\n- [Config](package.jso*)\n- [Pipeline](@workflows/app-pipeline.md)',
				_positionals: ['tsconfig.jso*']
			},
			{
				db: /** @type {any} */ (db),
				os: /** @type {any} */ (mockOs)
			}
		)

		const text = await model.packInput(model.input)
		
		// Matches checklist items
		assert.ok(text.includes('#### [Config](package.json)'))
		assert.ok(text.includes('{"name": "test"}'))
		assert.ok(text.includes('#### [Pipeline](@data/uk/workflows/app-pipeline.md)'))
		assert.ok(text.includes('workflow content'))

		// Matches positional items at the end
		assert.ok(text.includes('#### [tsconfig.json](tsconfig.json)'))
	})

	it('should execute agent commands @ls, @get and @search correctly', async () => {
		const mockDb = {
			async *readDir(path) {
				if (path === '@data/uk/workflows') {
					yield { uri: '@data/uk/workflows/wf1.md', name: 'wf1.md' }
				}
			},
			async loadDocumentAs(ext, path) {
				if (path === '@data/uk/workflows/wf1.md') {
					return 'wf1 content'
				}
				return null
			}
		}

		const model = new ChatSessionModel(
			{},
			{
				db: /** @type {any} */ (mockDb),
				os: {
					async exists(p) { return p === 'package.json' },
					async readFile(p) { return '{"name": "test"}' }
				},
				workspaceRoot: process.cwd()
			}
		)

		const utilsDir = path.join(__dirname, '../../utils')

		// 1. Test @ls - use LsCommand class
		const lsCmd = new LsCommand(model, {
			filename: '@ls',
			content: `@data/uk/workflows\n${utilsDir}`
		})
		const lsResult = await runCommand(lsCmd)
		assert.ok(lsResult.data.includes('### Command: ls'))
		assert.ok(lsResult.data.includes('@data/uk/workflows/wf1.md'))
		assert.ok(lsResult.data.includes('- StrictBoundaryInterpreter.js'))

		// Test @ls glob matching
		const globCmd = new LsCommand(model, {
			filename: '@ls',
			content: `${utilsDir}/*.js`
		})
		const globResult = await runCommand(globCmd)
		assert.ok(globResult.data.includes('StrictBoundaryInterpreter.js'))

		// 2. Test @get - use GetCommand class
		const getCmd = new GetCommand(model, {
			filename: '@get',
			content: '@data/uk/workflows/wf1.md\npackage.json'
		})
		const getResult = await runCommand(getCmd)
		assert.ok(getResult.data.includes('### Command: get'))
		assert.ok(getResult.data.includes('wf1 content'))
		assert.ok(getResult.data.includes('{"name": "test"}'))

		// 3. Test @search - use SearchCommand class
		const searchCmd = new SearchCommand(model, {
			filename: '@search',
			content: `StrictBoundaryInterpreter\n${utilsDir}`
		})
		const searchResult = await runCommand(searchCmd)
		assert.ok(searchResult.data.includes('Search query: "StrictBoundaryInterpreter"'))
		assert.ok(searchResult.data.includes('StrictBoundaryInterpreter.js'))
	})

	it('should perform inline snippet replacement using startLine and lineCount', async () => {
		const db = new DB({ cwd: tempStatsDir })
		const localDb = new DB({
			cwd: tempStatsDir,
			predefined: [
				[
					'.agent/strategy.json',
					{
						cascadeQueue: ['working-model'],
						budgetLimitUsd: 1.5,
						timeoutMs: 5000,
						failoverLimit: 2,
						retryCount: 0,
						fallbackCodes: ['500'],
						concurrencyLimit: 1,
						cachingMode: 'none',
					},
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		const writtenFiles = {
			'src/file.txt': 'line 1\nline 2\nline 3\nline 4\nline 5'
		}

		const mockOs = {
			async exists(p) { return !!writtenFiles[p] },
			async readFile(p) { return writtenFiles[p] || '' },
			async writeFile(p, content) { writtenFiles[p] = content },
			async executeCommand(cmd) { return { code: 0, stdout: '' } }
		}

		const mockAi = {
			async streamText(modelInfo, messages) {
				return {
					textStream: (async function* () {
						yield '---boundary:src/file.txt:2:2---\nnew line 2\nnew line 3\n---boundary---\n'
					})(),
					usage: Promise.resolve({ promptTokens: 5, completionTokens: 5 }),
				}
			}
		}

		const model = new ChatSessionModel(
			{ input: 'update lines' },
			{
				db,
				os: /** @type {any} */ (mockOs),
				ai: /** @type {any} */ (mockAi),
				statsBaseDir: tempStatsDir,
				t: (k) => k
			}
		)

		const events = await runGenerator(model.run())

		assert.strictEqual(await db.loadDocument('src/file.txt'), 'line 1\nnew line 2\nnew line 3\nline 4\nline 5')
	})

	it('should apply diff patch fallback when startLine/lineCount are not specified', async () => {
		const db = new DB({ cwd: tempStatsDir })
		const localDb = new DB({
			cwd: tempStatsDir,
			predefined: [
				[
					'.agent/strategy.json',
					{
						cascadeQueue: ['working-model'],
						budgetLimitUsd: 1.5,
						timeoutMs: 5000,
						failoverLimit: 2,
						retryCount: 0,
						fallbackCodes: ['500'],
						concurrencyLimit: 1,
						cachingMode: 'none',
					},
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		const writtenFiles = {
			'src/file.txt': 'line 1\nline 2\nline 3\nline 4\nline 5'
		}

		const mockOs = {
			async exists(p) { return !!writtenFiles[p] },
			async readFile(p) { return writtenFiles[p] || '' },
			async writeFile(p, content) { writtenFiles[p] = content },
			async executeCommand(cmd) { return { code: 0, stdout: '' } }
		}

		const mockAi = {
			async streamText(modelInfo, messages) {
				return {
					textStream: (async function* () {
						yield '---boundary:src/file.txt---\nline 1\n-line 2\n-line 3\n+patched line 2\n+patched line 3\nline 4\nline 5\n---boundary---\n'
					})(),
					usage: Promise.resolve({ promptTokens: 5, completionTokens: 5 }),
				}
			}
		}

		const model = new ChatSessionModel(
			{ input: 'apply patch' },
			{
				db,
				os: /** @type {any} */ (mockOs),
				ai: /** @type {any} */ (mockAi),
				statsBaseDir: tempStatsDir,
				t: (k) => k
			}
		)

		await runGenerator(model.run())

		assert.strictEqual(await db.loadDocument('src/file.txt'), 'line 1\npatched line 2\npatched line 3\nline 4\nline 5')
	})

	it('should track injected files in injectedFiles map with their sizes', async () => {
		const db = new DB()
		await db.connect()

		const files = {
			'checklist.txt': '- [A](a.js)\n- [B](b.js)',
			'a.js': 'console.log("a")',
			'b.js': 'console.log("b")',
			'c.js': 'console.log("c")',
		}

		const mockOs = {
			async exists(p) { return !!files[p] },
			async readFile(p) { return files[p] || '' },
		}

		const model = new ChatSessionModel(
			{
				input: 'checklist.txt',
				_positionals: ['c.js'],
			},
			{
				db,
				os: /** @type {any} */ (mockOs),
			}
		)

		await model.packInput(model.input)

		assert.strictEqual(model.injectedFiles.get('a.js'), Buffer.byteLength('console.log("a")', 'utf8'))
		assert.strictEqual(model.injectedFiles.get('b.js'), Buffer.byteLength('console.log("b")', 'utf8'))
		assert.strictEqual(model.injectedFiles.get('c.js'), Buffer.byteLength('console.log("c")', 'utf8'))
	})

	it('should save messages.json, response.md, and error.log to the active chat session directory', async () => {
		const tempStatsDirSave = path.resolve(__dirname, 'temp_stats_dir_save')
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDirSave} && mkdir -p ${tempStatsDirSave}`, resolve))

		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'.agent/strategy.json',
					{
						cascadeQueue: ['working-model'],
					},
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDirSave })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		const mockAi = {
			async streamText(modelInfo, messages) {
				return {
					textStream: (async function* () {
						yield '---boundary:src/out.txt---\nhello\n---boundary---\n'
					})(),
					usage: Promise.resolve({ promptTokens: 1, completionTokens: 1 }),
				}
			}
		}

		const model = new ChatSessionModel(
			{ input: 'hello' },
			{
				db,
				os: /** @type {any} */ ({
					async exists() { return false },
					async writeFile() {},
				}),
				ai: /** @type {any} */ (mockAi),
				statsBaseDir: tempStatsDirSave,
				t: (k) => k,
			}
		)

		await runGenerator(model.run())

		const sessionDir = path.join(tempStatsDirSave, model.id)
		const fs = await import('node:fs')

		assert.ok(!fs.existsSync(path.join(sessionDir, 'messages.json')))
		assert.ok(fs.existsSync(path.join(sessionDir, 'messages.jsonl')))
		assert.ok(fs.existsSync(path.join(sessionDir, 'response.md')))

		const jsonlContent = fs.readFileSync(path.join(sessionDir, 'messages.jsonl'), 'utf8')
		assert.ok(jsonlContent.includes('"role"'))
		assert.ok(jsonlContent.includes('hello'))

		const responseContent = fs.readFileSync(path.join(sessionDir, 'response.md'), 'utf8')
		assert.ok(responseContent.includes('out.txt'))

		// Cleanup
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDirSave}`, resolve))
	})

	it('should skip model if estimated prompt tokens exceed context_length', async () => {
		const tempStatsDirSkip = path.join(tempStatsDir, 'skip_context')
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDirSkip} && mkdir -p ${tempStatsDirSkip}`, resolve))

		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'.agent/strategy.json',
					{
						cascadeQueue: ['small-context-model', 'working-model'],
						budgetLimitUsd: 1.5,
						timeoutMs: 5000,
						failoverLimit: 2,
						retryCount: 0,
						fallbackCodes: ['500'],
						concurrencyLimit: 1,
						cachingMode: 'none',
					},
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDirSkip })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		let streamCalledWithModel = null

		const mockAi = {
			findModel(id) {
				if (id === 'small-context-model') {
					return { id, provider: 'mock', context_length: 10 }
				}
				return { id, provider: 'mock', context_length: 4000 }
			},
			async streamText(modelInfo, messages) {
				streamCalledWithModel = modelInfo.id
				return {
					textStream: (async function* () {
						yield '---boundary:src/out.txt---\nsuccess\n---boundary---\n'
					})(),
					usage: Promise.resolve({ promptTokens: 10, completionTokens: 20 }),
				}
			},
		}

		const model = new ChatSessionModel(
			{ input: 'this prompt is long enough to exceed ten tokens' },
			{
				db,
				os: /** @type {any} */ ({
					async exists() { return false },
					async writeFile() {},
				}),
				ai: /** @type {any} */ (mockAi),
				statsBaseDir: tempStatsDirSkip,
				t: (k) => k,
			}
		)

		await runGenerator(model.run())

		assert.strictEqual(streamCalledWithModel, 'working-model')

		// Cleanup
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDirSkip}`, resolve))
	})

	it('should extract only failures from TAP output', () => {
		const model = new ChatSessionModel({}, { t: (k) => k })
		const tapOutput = `TAP version 13
ok 1 - successful test
not ok 2 - failing test
  ---
  message: 'failed assertion'
  severity: fail
  stack: |-
    Error: failed assertion
        at TestContext.<anonymous> (test.js:1:2)
  ...
ok 3 - another successful test
1..3
`
		const extracted = model.extractErrors(tapOutput)
		assert.match(extracted, /not ok 2 - failing test/)
		assert.match(extracted, /message: 'failed assertion'/)
		assert.doesNotMatch(extracted, /successful test/)
	})

	it('should extract failures from Vitest output heuristically', () => {
		const model = new ChatSessionModel({}, { t: (k) => k })
		const vitestOutput = `
       VITEST v1.0.0
 
 ✖ src/index.test.js > math tests > should add numbers
   Error: expected 3 to be 4
     at src/index.test.js:5:10

   Some informational lines about Vitest
`
		const extracted = model.extractErrors(vitestOutput)
		assert.match(extracted, /✖ src\/index.test.js/)
		assert.match(extracted, /expected 3 to be 4/)
		assert.match(extracted, /at src\/index.test.js:5:10/)
		assert.doesNotMatch(extracted, /Some informational lines/)
	})

	it('should detect test runner from package.json dependencies', async () => {
		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'package.json',
					{
						devDependencies: {
							vitest: '^1.0.0'
						}
					}
				]
			]
		})
		db.mount('', localDb)
		await db.connect()
		await localDb.connect()

		const model = new ChatSessionModel({}, { db, t: (k) => k })
		const runner = await model.detectTestRunner()
		assert.strictEqual(runner, 'vitest')
	})

	it('should get corresponding test files', async () => {
		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'src/domain/app/ChatSessionModel.test.js',
					'test file content'
				]
			]
		})
		db.mount('', localDb)
		await db.connect()
		await localDb.connect()

		const model = new ChatSessionModel({}, { db, t: (k) => k })
		const testFiles = await model.getCorrespondingTestFiles(['src/domain/app/ChatSessionModel.js'])
		assert.deepEqual(testFiles, ['src/domain/app/ChatSessionModel.test.js'])
	})

	it('should log traces to session_trace.jsonl', async () => {
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir} && mkdir -p ${tempStatsDir}`, resolve))
		const currentDb = new DB({ cwd: tempStatsDir })
		await currentDb.connect()

		const model = new ChatSessionModel({}, { t: (k) => k })
		model._currentDb = currentDb
		await model.logTrace({ type: 'test_event', status: 'ok' })

		const traceContent = await currentDb.loadDocument('session_trace.jsonl')
		const parsed = JSON.parse(traceContent.trim())
		assert.strictEqual(parsed.type, 'test_event')
		assert.strictEqual(parsed.status, 'ok')
		assert.ok(parsed.ts)

		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir}`, resolve))
	})

	it('should fallback to estimating tokens when usage statistics are undefined or NaN', async () => {
		const tempStatsDir = path.resolve(process.cwd(), '.test-stats-metrics-fallback')
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir} && mkdir -p ${tempStatsDir}`, resolve))

		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'.agent/strategy.json',
					{
						cascadeQueue: ['test-model'],
						budgetLimitUsd: 1.5,
						timeoutMs: 5000,
						failoverLimit: 2,
						retryCount: 0,
						fallbackCodes: ['500'],
						concurrencyLimit: 1,
						cachingMode: 'none',
					},
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		const mockOs = {
			cwd: process.cwd(),
			async exists() { return false },
			async readFile() { return '' },
			async writeFile() {},
			async executeCommand() {
				return { code: 0, stdout: 'tests passed', stderr: '' }
			},
		}

		const mockAi = {
			async streamText() {
				return {
					textStream: (async function* () {
						yield '---boundary:src/output.txt---\nhello from agent\n---boundary---\n'
					})(),
					usage: Promise.resolve({ promptTokens: undefined, completionTokens: undefined }),
				}
			},
		}

		const model = new ChatSessionModel(
			{ input: 'build me a web app', autoVerify: true },
			{
				db,
				os: mockOs,
				ai: mockAi,
				statsBaseDir: tempStatsDir,
				t: (key, vars) => {
					if (typeof key === 'function') return key
					return key.replace(/\{(\w+)\}/g, (_, k) => vars ? vars[k] : '')
				},
			}
		)

		model.model = 'test-model'

		await runGenerator(model.run())

		const { StatsLogger } = await import('../../utils/StatsLogger.js')
		const stats = await StatsLogger.readAll(tempStatsDir)
		assert.strictEqual(stats.length, 1)
		assert.ok(stats[0].inputTokens > 0)
		assert.ok(stats[0].outputTokens > 0)

		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir}`, resolve))
	})

	it('should maintain chat history across agent command iterations and respect max agent iterations guard', async () => {
		const tempStatsDir = path.resolve(__dirname, 'temp_stats_dir_guard')
		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir} && mkdir -p ${tempStatsDir}`, resolve))

		const db = new DB()
		const localDb = new DB({
			predefined: [
				[
					'.agent/strategy.json',
					{ cascadeQueue: ['guard-model'] },
				],
			],
		})
		const chatDb = new DB({ cwd: tempStatsDir })
		db.mount('', localDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await localDb.connect()
		await chatDb.connect()

		const mockOs = {
			async exists() { return false },
			async readFile() { return '' },
			async writeFile() {},
		}

		const streamCalls = []

		const mockAi = {
			async streamText(modelInfo, messages) {
				streamCalls.push(JSON.parse(JSON.stringify(messages)))
				return {
					textStream: (async function* () {
						yield '---boundary:@ls---\n.\n---boundary---'
					})(),
					usage: Promise.resolve({ promptTokens: 10, completionTokens: 10 }),
				}
			},
		}

		const model = new ChatSessionModel(
			{ input: 'build me a web app' },
			{
				db,
				os: /** @type {any} */ (mockOs),
				ai: mockAi,
				statsBaseDir: tempStatsDir,
				t: (key) => key,
			}
		)

		const events = await runGenerator(model.run())

		// Verify streamText was called 6 times (1 original + 5 retries / agent loops)
		assert.strictEqual(streamCalls.length, 6)

		// Verify first call only had system and user prompt
		assert.strictEqual(streamCalls[0].length, 2)
		assert.strictEqual(streamCalls[0][1].role, 'user')
		assert.ok(streamCalls[0][1].content.includes('build me a web app'))

		// Verify second call had system, user prompt, assistant response, and command output
		assert.strictEqual(streamCalls[1].length, 4)
		assert.strictEqual(streamCalls[1][1].role, 'user')
		assert.ok(streamCalls[1][1].content.includes('build me a web app'))
		assert.strictEqual(streamCalls[1][2].role, 'assistant')
		assert.ok(streamCalls[1][2].content.includes('---boundary:@ls---'))
		assert.strictEqual(streamCalls[1][3].role, 'user')
		assert.ok(streamCalls[1][3].content.includes('### Command: ls'))

		// Verify loop was terminated with warning/error
		const hasTerminated = events.some(e => e.type === 'show' && e.level === 'error' && e.message.includes('Max agent command iterations reached'))
		assert.ok(hasTerminated)

		await new Promise((resolve) => exec(`rm -rf ${tempStatsDir}`, resolve))
	})
})


