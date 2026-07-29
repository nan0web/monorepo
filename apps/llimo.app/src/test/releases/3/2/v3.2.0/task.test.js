/**
 * @fileoverview Release v3.2.0 — Agent Tools (Sovereign Antigravity Foundation)
 *
 * Contract tests for 5 Agent Tools + tsc build stability.
 * Each tool is a ModelAsApp generator tested via runGenerator().
 *
 * Pattern:
 *   const tool = new XxxTool(data, { db })
 *   const result = await runGenerator(tool.run(), { show, ask, progress, log })
 *   assert(result matches expected)
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'

// ─── US-1: View File Tool ─────────────────────────────────────────────────────

describe('US-1: ViewFileTool', () => {
	it('should show file content with line numbers', async () => {
		const { ViewFileTool } = await import('../../../../../domain/tools/ViewFileTool.js')
		const db = new DB({
			predefined: [['src/app.js', 'const a = 1\nconst b = 2\nconst c = 3']],
		})
		await db.connect()

		const tool = new ViewFileTool({ path: 'src/app.js' }, { db })
		const events = []

		const res = await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
		})

		// Should display with line numbers
		assert.ok(events.some(e => e.includes('1:')), 'Should have line 1')
		assert.ok(events.some(e => e.includes('const a = 1')), 'Should contain file content')
		assert.equal(res.lines, 3, 'Should report 3 lines')
	})

	it('should show partial file with startLine/endLine', async () => {
		const { ViewFileTool } = await import('../../../../../domain/tools/ViewFileTool.js')
		const db = new DB({
			predefined: [['big.js', 'line1\nline2\nline3\nline4\nline5']],
		})
		await db.connect()

		const tool = new ViewFileTool({ path: 'big.js', startLine: 2, endLine: 4 }, { db })
		const events = []

		await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
		})

		// Should show only lines 2-4
		const output = events.join('\n')
		assert.ok(output.includes('line2'), 'Should include line2')
		assert.ok(output.includes('line4'), 'Should include line4')
		assert.ok(!output.includes('line1'), 'Should NOT include line1')
		assert.ok(!output.includes('line5'), 'Should NOT include line5')
	})

	it('should yield error result for missing file', async () => {
		const { ViewFileTool } = await import('../../../../../domain/tools/ViewFileTool.js')
		const db = new DB()
		await db.connect()

		const tool = new ViewFileTool({ path: 'nonexistent.js' }, { db })
		const events = []

		const res = await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
		})

		assert.equal(res.error, true, 'Should return error flag')
	})
})

// ─── US-2: Edit File Tool ─────────────────────────────────────────────────────

describe('US-2: EditFileTool', () => {
	it('should replace lines using boundary protocol (startLine + lineCount)', async () => {
		const { EditFileTool } = await import('../../../../../domain/tools/EditFileTool.js')
		const db = new DB({
			predefined: [['file.js', 'aaa\nbbb\nccc\nddd\neee']],
		})
		await db.connect()

		const tool = new EditFileTool({
			path: 'file.js',
			startLine: 2,
			lineCount: 2,
			content: 'XXX\nYYY',
		}, { db })

		const res = await runGenerator(tool.run(), {
			show: () => {},
			ask: async () => ({ value: {}, cancelled: false }),
		})

		assert.equal(res.edited, true)
		const updated = await db.get('file.js')
		assert.equal(updated, 'aaa\nXXX\nYYY\nddd\neee')
	})

	it('should create new file when path does not exist (full boundary)', async () => {
		const { EditFileTool } = await import('../../../../../domain/tools/EditFileTool.js')
		const db = new DB()
		await db.connect()

		const tool = new EditFileTool({
			path: 'new-file.js',
			content: 'hello world',
		}, { db })

		const res = await runGenerator(tool.run(), {
			show: () => {},
			ask: async () => ({ value: {}, cancelled: false }),
		})

		assert.equal(res.edited, true)
		const content = await db.get('new-file.js')
		assert.equal(content, 'hello world')
	})

	it('should handle multi-boundary edits in single response', async () => {
		const { EditFileTool } = await import('../../../../../domain/tools/EditFileTool.js')
		const { parseBoundaries, applyBoundaries } = await import('@nan0web/ai')

		const rawResponse = [
			'---boundary:a.js:1:1---',
			'REPLACED_A',
			'---boundary---',
			'---boundary:b.js---',
			'NEW_B',
			'---boundary---',
		].join('\n')

		const parsed = parseBoundaries(rawResponse)
		const originals = { 'a.js': 'original_a\nline2', 'b.js': '' }
		const result = applyBoundaries(originals, parsed)

		assert.equal(result['a.js'], 'REPLACED_A\nline2')
		assert.equal(result['b.js'], 'NEW_B')
	})
})

// ─── US-3: Run Command Tool ──────────────────────────────────────────────────

describe('US-3: RunCommandTool', () => {
	it('should execute command and capture stdout', async () => {
		const { RunCommandTool } = await import('../../../../../domain/tools/RunCommandTool.js')

		const tool = new RunCommandTool({
			command: 'echo "hello world"',
			cwd: process.cwd(),
		})

		const events = []

		const res = await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
			progress: () => {},
		})

		assert.equal(res.exitCode, 0, 'Should exit with 0')
		assert.ok(res.stdout.includes('hello world'), 'Should capture stdout')
	})

	it('should respect timeout and return error', async () => {
		const { RunCommandTool } = await import('../../../../../domain/tools/RunCommandTool.js')

		const tool = new RunCommandTool({
			command: 'sleep 60',
			timeout: 500,
		})

		const res = await runGenerator(tool.run(), {
			show: () => {},
			ask: async () => ({ value: {}, cancelled: false }),
			progress: () => {},
		})

		assert.ok(res.exitCode !== 0 || res.error, 'Should fail due to timeout')
	})

	it('should capture stderr on failure', async () => {
		const { RunCommandTool } = await import('../../../../../domain/tools/RunCommandTool.js')

		const tool = new RunCommandTool({
			command: 'node -e "process.exit(1)"',
		})

		const res = await runGenerator(tool.run(), {
			show: () => {},
			ask: async () => ({ value: {}, cancelled: false }),
		})

		assert.equal(res.exitCode, 1, 'Should capture exit code 1')
	})
})

// ─── US-4: List Directory Tool ────────────────────────────────────────────────

describe('US-4: ListDirTool', () => {
	it('should list directory contents with file info', async () => {
		const { ListDirTool } = await import('../../../../../domain/tools/ListDirTool.js')
		const db = new DB({
			predefined: [
				['src/a.js', 'aaa'],
				['src/b.js', 'bbb'],
				['src/sub/c.js', 'ccc'],
			],
		})
		await db.connect()

		const tool = new ListDirTool({ path: 'src' }, { db })
		const events = []

		const res = await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
		})

		assert.ok(res.entries.length >= 2, 'Should list at least 2 entries')
		assert.ok(res.entries.some(e => e.name === 'a.js'), 'Should include a.js')
		assert.ok(res.entries.some(e => e.name === 'b.js'), 'Should include b.js')
	})

	it('should support depth parameter', async () => {
		const { ListDirTool } = await import('../../../../../domain/tools/ListDirTool.js')
		const db = new DB({
			predefined: [
				['a.js', 'a'],
				['sub/b.js', 'b'],
				['sub/deep/c.js', 'c'],
			],
		})
		await db.connect()

		const tool = new ListDirTool({ path: '.', depth: 1 }, { db })

		const res = await runGenerator(tool.run(), {
			show: () => {},
			ask: async () => ({ value: {}, cancelled: false }),
		})

		// With depth=1, should see 'a.js' and 'sub/' but not 'sub/deep/'
		assert.ok(res.entries.some(e => e.name === 'a.js'))
		assert.ok(res.entries.some(e => e.isDir))
	})
})

// ─── US-5: Search Code Tool ──────────────────────────────────────────────────

describe('US-5: SearchCodeTool', () => {
	it('should search code using semantic search and return results', async () => {
		const { SearchCodeTool } = await import('../../../../../domain/tools/SearchCodeTool.js')

		// Mock searcher that simulates nan0ai search results
		const mockSearcher = {
			search: async (query) => [
				{ file: 'src/Model.js', line: 10, score: 0.95, snippet: 'class Model extends Base' },
				{ file: 'src/View.js', line: 5, score: 0.82, snippet: 'render(model)' },
			]
		}

		const tool = new SearchCodeTool(
			{ query: 'Model class definition' },
			{ searcher: mockSearcher }
		)

		const events = []

		const res = await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
		})

		assert.ok(res.results.length >= 1, 'Should return search results')
		assert.ok(res.results[0].file.includes('Model'), 'First result should be relevant')
	})

	it('should yield show intent with formatted search results', async () => {
		const { SearchCodeTool } = await import('../../../../../domain/tools/SearchCodeTool.js')

		const mockSearcher = {
			search: async () => [
				{ file: 'src/utils.js', line: 42, score: 0.9, snippet: 'export function merge()' },
			]
		}

		const tool = new SearchCodeTool(
			{ query: 'merge function' },
			{ searcher: mockSearcher }
		)

		const events = []

		await runGenerator(tool.run(), {
			show: (i) => events.push(i.message ?? String(i)),
			ask: async () => ({ value: {}, cancelled: false }),
		})

		// Should show file path and snippet
		const output = events.join('\n')
		assert.ok(output.includes('src/utils.js'), 'Should show file path in output')
	})
})

// ─── US-6: tsc Build Stability ───────────────────────────────────────────────

describe('US-6: tsc Build Stability', () => {
	it('should build @nan0web/llimo.app without tsc errors', async () => {
		const { execSync } = await import('node:child_process')
		const { join } = await import('node:path')

		const cwd = join(import.meta.dirname, '..', '..', '..', '..', '..')
		let buildOutput = ''
		let exitCode = 0

		try {
			buildOutput = execSync('pnpm build 2>&1', {
				cwd,
				encoding: 'utf-8',
				timeout: 30000,
			})
		} catch (/** @type {any} */ err) {
			buildOutput = err.stdout || err.message
			exitCode = err.status || 1
		}

		assert.equal(exitCode, 0, `Build should pass. Output:\n${buildOutput.slice(-500)}`)
	})
})
