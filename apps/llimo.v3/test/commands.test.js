import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'

import { GetCommand } from '../src/domain/app/commands/GetCommand.js'
import { LsCommand } from '../src/domain/app/commands/LsCommand.js'
import { SearchCommand } from '../src/domain/app/commands/SearchCommand.js'
import { WorkflowCommand } from '../src/domain/app/commands/WorkflowCommand.js'

/**
 * Helper: run an AsyncGenerator command and return the final ResultIntent.
 * @param {import('../src/domain/app/commands/Command.js').Command} cmd
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

/**
 * Create a mock chat object with controllable dependencies.
 * @param {Object} [overrides]
 * @param {Object} [overrides.db]
 * @param {Object} [overrides.os]
 * @param {Function} [overrides.resolvePaths]
 * @returns {{ _: Object, resolvePaths: Function }}
 */
function createMockChat(overrides = {}) {
	return {
		_: {
			db: overrides.db || null,
			os: overrides.os || null,
			workspaceRoot: '/tmp/test-workspace',
			t: (msg) => msg,
		},
		constructor: {
			UI: {
				loading_workflow: 'Loading workflow: {name}',
				workflow_loaded: 'Workflow loaded: {name}',
				workflow_not_found: 'Workflow not found: {name}',
				executing_command: 'Executing command: {command}',
				command_succeeded: 'Command succeeded: {output}',
			},
		},
		resolvePaths: overrides.resolvePaths || (async () => []),
		loadWorkflow: overrides.loadWorkflow || (async () => ''),
	}
}

/**
 * Create a command instance with mock chat.
 * @param {typeof import('../src/domain/app/commands/Command.js').Command} CommandClass
 * @param {string} content
 * @param {Object} [chatOverrides]
 */
function createCommand(CommandClass, content, chatOverrides = {}) {
	const chat = createMockChat(chatOverrides)
	return new CommandClass(chat, { filename: `@${CommandClass.alias}`, content })
}

// ─────────────────────────────────────────────────────────────
// GetCommand
// ─────────────────────────────────────────────────────────────
describe('GetCommand', () => {
	it('reads a DB path via db.loadDocumentAs', async () => {
		const cmd = createCommand(GetCommand, '@data/uk/system.md', {
			db: {
				loadDocumentAs: async (_fmt, _path, _fallback) => 'Hello from DB',
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Hello from DB'))
		assert.ok(res.data.includes('```'))
	})

	it('returns "Not found" when db returns non-string', async () => {
		const cmd = createCommand(GetCommand, '@data/missing.md', {
			db: {
				loadDocumentAs: async () => null,
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Not found or not a text file'))
	})

	it('returns error message when db throws', async () => {
		const cmd = createCommand(GetCommand, '@data/broken.md', {
			db: {
				loadDocumentAs: async () => {
					throw new Error('DB connection lost')
				},
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Error reading DB file: DB connection lost'))
	})

	it('reads a local file via os.exists + os.readFile', async () => {
		const cmd = createCommand(GetCommand, 'src/index.js', {
			resolvePaths: async () => [{ path: '/project/src/index.js' }],
			os: {
				exists: async () => true,
				readFile: async () => 'console.log("hello")',
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('console.log("hello")'))
		assert.ok(res.data.includes('File: /project/src/index.js'))
	})

	it('returns "File not found" when os.exists is false', async () => {
		const cmd = createCommand(GetCommand, 'missing.js', {
			resolvePaths: async () => [{ path: '/project/missing.js' }],
			os: {
				exists: async () => false,
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('File not found: /project/missing.js'))
	})

	it('returns "No files matched" when resolvePaths returns empty', async () => {
		const cmd = createCommand(GetCommand, 'nothing-here/**', {
			resolvePaths: async () => [],
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('No files matched pattern: nothing-here/**'))
	})

	it('handles multiple lines of input', async () => {
		const cmd = createCommand(GetCommand, '@data/a.md\n@data/b.md', {
			db: {
				loadDocumentAs: async (_fmt, p) => (p.includes('a.md') ? 'File A' : 'File B'),
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('File A'))
		assert.ok(res.data.includes('File B'))
	})
})

// ─────────────────────────────────────────────────────────────
// LsCommand
// ─────────────────────────────────────────────────────────────
describe('LsCommand', () => {
	it('lists DB directory entries', async () => {
		const entries = [{ path: '@data/uk/t.yaml' }, { name: 'config.yaml' }]
		const cmd = createCommand(LsCommand, '@data/uk', {
			db: {
				readDir: async function* (dirPath) {
					for (const e of entries) yield e
				},
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('- @data/uk/t.yaml'))
		assert.ok(res.data.includes('- config.yaml'))
	})

	it('returns "Empty directory" for empty DB dir', async () => {
		const cmd = createCommand(LsCommand, '@data/empty', {
			db: {
				readDir: async function* () {},
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Empty directory'))
	})

	it('returns error when DB readDir throws', async () => {
		const cmd = createCommand(LsCommand, '@data/broken', {
			db: {
				readDir: async function* () {
					throw new Error('Permission denied')
				},
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Error listing DB directory: Permission denied'))
	})

	it('lists a real local directory', async () => {
		const tmpDir = await mkdtemp(path.join(tmpdir(), 'ls-test-'))
		try {
			await writeFile(path.join(tmpDir, 'file1.txt'), 'hello')
			await mkdir(path.join(tmpDir, 'subdir'))

			const cmd = createCommand(LsCommand, tmpDir)
			const res = await runCommand(cmd)
			assert.ok(res.data.includes('- file1.txt'))
			assert.ok(res.data.includes('- subdir/'))
		} finally {
			await rm(tmpDir, { recursive: true })
		}
	})

	it('returns error for non-existent local directory', async () => {
		const cmd = createCommand(LsCommand, '/tmp/definitely-not-existing-dir-xyz-123')
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Error listing directory:'))
	})

	it('handles multiple directory lines', async () => {
		const cmd = createCommand(LsCommand, '@data/a\n@data/b', {
			db: {
				readDir: async function* (dirPath) {
					if (dirPath === '@data/a') yield { name: 'alpha.md' }
					if (dirPath === '@data/b') yield { name: 'beta.md' }
				},
			},
		})
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('- alpha.md'))
		assert.ok(res.data.includes('- beta.md'))
	})
})

// ─────────────────────────────────────────────────────────────
// SearchCommand
// ─────────────────────────────────────────────────────────────
describe('SearchCommand', () => {
	it('returns error for empty query', async () => {
		const cmd = createCommand(SearchCommand, '')
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Error: Empty search query'))
	})

	it('finds matches via fallback text search', async () => {
		const tmpDir = await mkdtemp(path.join(tmpdir(), 'search-test-'))
		try {
			await writeFile(path.join(tmpDir, 'hello.js'), 'function greet() { return "hello world" }')
			await writeFile(path.join(tmpDir, 'bye.js'), 'function farewell() { return "goodbye" }')

			const cmd = createCommand(SearchCommand, `hello world\n${tmpDir}`)
			const res = await runCommand(cmd)
			assert.ok(res.data.includes('Fallback Text Search'))
			assert.ok(res.data.includes('hello.js'))
			assert.ok(res.data.includes('hello world'))
			// bye.js should NOT be in results
			assert.ok(!res.data.includes('bye.js'))
		} finally {
			await rm(tmpDir, { recursive: true })
		}
	})

	it('returns "No matches found" when nothing matches', async () => {
		const tmpDir = await mkdtemp(path.join(tmpdir(), 'search-empty-'))
		try {
			await writeFile(path.join(tmpDir, 'data.txt'), 'some unrelated content')

			const cmd = createCommand(SearchCommand, `ZZZYYYXXX_UNIQUE_QUERY\n${tmpDir}`)
			const res = await runCommand(cmd)
			assert.ok(res.data.includes('No matches found'))
		} finally {
			await rm(tmpDir, { recursive: true })
		}
	})

	it('searches in nested directories', async () => {
		const tmpDir = await mkdtemp(path.join(tmpdir(), 'search-nested-'))
		try {
			const subDir = path.join(tmpDir, 'sub')
			await mkdir(subDir)
			await writeFile(path.join(subDir, 'deep.txt'), 'needle in haystack')

			const cmd = createCommand(SearchCommand, `needle\n${tmpDir}`)
			const res = await runCommand(cmd)
			assert.ok(res.data.includes('deep.txt'))
			assert.ok(res.data.includes('needle'))
		} finally {
			await rm(tmpDir, { recursive: true })
		}
	})

	it('reports line numbers in search results', async () => {
		const tmpDir = await mkdtemp(path.join(tmpdir(), 'search-lines-'))
		try {
			await writeFile(path.join(tmpDir, 'multi.txt'), 'line one\nline two\ntarget line\nline four')

			const cmd = createCommand(SearchCommand, `target\n${tmpDir}`)
			const res = await runCommand(cmd)
			assert.ok(res.data.includes('Line 3:'))
			assert.ok(res.data.includes('target line'))
		} finally {
			await rm(tmpDir, { recursive: true })
		}
	})

	it('handles search error gracefully', async () => {
		const cmd = createCommand(SearchCommand, 'query\n/nonexistent/path/xyz')
		const res = await runCommand(cmd)
		assert.ok(res.data.includes('Error performing search:'))
	})
})

// ─────────────────────────────────────────────────────────────
// WorkflowCommand
// ─────────────────────────────────────────────────────────────
describe('WorkflowCommand', () => {
	it('loads a workflow and returns system messages', async () => {
		const cmd = createCommand(WorkflowCommand, 'nan0web.md', {
			loadWorkflow: async (name) => `# Workflow: ${name}\nContent here`,
		})
		const res = await runCommand(cmd)
		assert.ok(Array.isArray(res.data))
		assert.strictEqual(res.data.length, 1)
		assert.strictEqual(res.data[0].role, 'system')
		assert.ok(res.data[0].content.includes('nan0web.md'))
		assert.ok(res.data[0].content.includes('Content here'))
	})

	it('returns empty array for not-found workflow', async () => {
		const cmd = createCommand(WorkflowCommand, 'missing.md', {
			loadWorkflow: async () => '',
		})
		const res = await runCommand(cmd)
		assert.ok(Array.isArray(res.data))
		assert.strictEqual(res.data.length, 0)
	})

	it('loads multiple workflows', async () => {
		const cmd = createCommand(WorkflowCommand, 'a.md\nb.md\nc.md', {
			loadWorkflow: async (name) => (name === 'b.md' ? '' : `content of ${name}`),
		})
		const res = await runCommand(cmd)
		assert.ok(Array.isArray(res.data))
		assert.strictEqual(res.data.length, 2) // a.md and c.md loaded, b.md not found
		assert.ok(res.data[0].content.includes('a.md'))
		assert.ok(res.data[1].content.includes('c.md'))
	})
})
