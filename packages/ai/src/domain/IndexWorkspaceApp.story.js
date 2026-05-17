import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { IndexWorkspaceApp } from './IndexWorkspaceApp.js'
import { MarkdownIndexer } from './MarkdownIndexer.js'
import { VectorDB } from './VectorDB.js'
import DB from '@nan0web/db'

class MockEmbedder {
	async embed(text) {
		return new Float32Array(384).fill(0.1)
	}
	async embedBatch(texts) {
		return texts.map(() => new Float32Array(384).fill(0.1))
	}
}

// Generic recursive YAML serializer to dynamically format JS objects for .txt reads
function toYAML(obj, indent = '') {
	if (typeof obj !== 'object' || obj === null) return String(obj)
	if (Array.isArray(obj)) {
		return obj
			.map((item) => {
				if (typeof item === 'object' && item !== null) {
					const entries = Object.entries(item)
					if (entries.length === 0) return `${indent}- {}`
					const [firstKey, firstVal] = entries[0]
					const rest = entries.slice(1)
					const head = `${indent}- ${firstKey}: ${
						typeof firstVal === 'object' ? '\n' + toYAML(firstVal, indent + '  ') : String(firstVal)
					}`
					if (rest.length === 0) return head
					const restObj = Object.fromEntries(rest)
					return head + '\n' + toYAML(restObj, indent + '  ')
				}
				return `${indent}- ${String(item)}`
			})
			.join('\n')
	}
	return Object.entries(obj)
		.map(([k, v]) => {
			if (typeof v === 'object' && v !== null) {
				return `${indent}${k}:\n${toYAML(v, indent + '  ')}`
			}
			return `${indent}${k}: ${String(v)}`
		})
		.join('\n')
}

// Clean MemoryDB subclass to natively support clean predefined format without ad-hoc method mocking
class MemoryDB extends DB {
	async loadDocumentAs(ext, uri, defaultValue) {
		const normUri = this.normalize(uri)
		const raw = this.data.get(normUri) ?? defaultValue
		if (ext === '.txt' && typeof raw === 'object' && raw !== null) {
			return toYAML(raw)
		}
		return super.loadDocumentAs(ext, uri, defaultValue)
	}
}

describe('IndexWorkspaceApp Story Test Suite', () => {
	const workspaceRoot = '/'

	it('should fall back to scanning workspace directories when the store is empty', async () => {
		const predefined = [
			['packages/pkg-a/package.json', { name: '@nan0web/pkg-a' }],
			['packages/pkg-a/docs/en/project.md', '# Project A documentation\nThis is a mock project.'],
			['packages/pkg-b/package.json', { name: '@nan0web/pkg-b' }],
			['apps/app-c/package.json', { name: '@nan0web/app-c' }],
			['apps/app-c/docs/en/project.md', '# App C documentation\nThis is a mock app.'],
			['store/nan0web_store.csv', []],
			['store/nan0web_store.local.csv', []],
		]
		const mockFs = new MemoryDB({ predefined })
		await mockFs.connect()

		const storeDb = mockFs.extract('store')
		const app = new IndexWorkspaceApp(
			{ silent: true, scopes: ['docs'] },
			{
				db: mockFs.extract('packages/ai/data'),
				storeDb,
				workspaceDb: mockFs,
				workspaceRoot,
			},
		)
		app.getWorkspaceRoot = () => '/'

		const discovered = await app._getProjectsToIndex(storeDb, workspaceRoot)
		assert.strictEqual(discovered.length, 3, 'Should discover exactly 3 projects')
		const names = discovered.map((p) => p.name)
		assert.ok(names.includes('pkg-a'), 'Should discover pkg-a')
		assert.ok(names.includes('pkg-b'), 'Should discover pkg-b')
		assert.ok(names.includes('app-c'), 'Should discover app-c')

		await mockFs.disconnect()
	})

	it('should load projects directly from global store when entries are present', async () => {
		const predefined = [
			['packages/pkg-a/package.json', { name: '@nan0web/pkg-a' }],
			['packages/pkg-b/package.json', { name: '@nan0web/pkg-b' }],
			['store/nan0web_store.csv', [{ name: 'pkg-a', path: '/packages/pkg-a' }]],
			['store/nan0web_store.local.csv', []],
		]
		const mockFs = new MemoryDB({ predefined })
		await mockFs.connect()

		const storeDb = mockFs.extract('store')
		const app = new IndexWorkspaceApp(
			{ silent: true, scopes: ['docs'] },
			{
				db: mockFs.extract('packages/ai/data'),
				storeDb,
				workspaceDb: mockFs,
				workspaceRoot,
			},
		)
		app.getWorkspaceRoot = () => '/'

		const discovered = await app._getProjectsToIndex(storeDb, workspaceRoot)
		assert.strictEqual(discovered.length, 1, 'Should load exactly 1 project from store')
		assert.strictEqual(discovered[0].name, 'pkg-a', 'Should be pkg-a')
		assert.strictEqual(discovered[0].dir, 'packages/pkg-a', 'Should resolve directory relative to root')

		await mockFs.disconnect()
	})

	it('should successfully perform full document indexing', async () => {
		const originalGetWorkspaceRoot = MarkdownIndexer.prototype.getWorkspaceRoot
		MarkdownIndexer.prototype.getWorkspaceRoot = () => '/'

		const originalSave = VectorDB.prototype.save
		const originalLoad = VectorDB.prototype.load
		VectorDB.prototype.save = async () => {}
		VectorDB.prototype.load = async () => true

		const predefined = [
			['packages/pkg-a/package.json', { name: '@nan0web/pkg-a' }],
			['packages/pkg-a/docs/en/project.md', '# Project A documentation\nThis is a mock project.'],
			['store/nan0web_store.csv', []],
			['store/nan0web_store.local.csv', []],
		]
		const mockFs = new MemoryDB({ predefined })
		await mockFs.connect()

		const storeDb = mockFs.extract('store')
		const app = new IndexWorkspaceApp(
			{ silent: false, scopes: ['docs'] },
			{
				db: mockFs.extract('packages/ai/data'),
				storeDb,
				workspaceDb: mockFs,
				workspaceRoot,
			},
		)
		app.getWorkspaceRoot = () => '/'

		const mockEmbedder = new MockEmbedder()
		const events = []
		for await (const ev of app.indexFull({
			show: (msg, type) => ({ type, message: msg }),
			progress: (msg, percent, opts) => ({ type: 'progress', message: msg, percent, opts }),
			MarkdownIndexer,
			Embedder: function () {
				return mockEmbedder
			},
		})) {
			events.push(ev)
		}

		const successEvents = events.filter((e) => e.type === 'success')
		assert.ok(successEvents.length > 0, 'Indexing should complete successfully')

		MarkdownIndexer.prototype.getWorkspaceRoot = originalGetWorkspaceRoot
		VectorDB.prototype.save = originalSave
		VectorDB.prototype.load = originalLoad
		await mockFs.disconnect()
	})

	it('should successfully scan packages and build agents index', async () => {
		const predefined = [
			['packages/pkg-a/package.json', { name: '@nan0web/pkg-a' }],
			[
				'packages/pkg-a/nan0web.nan0',
				{
					agents: [
						{ id: 'test-agent', description: 'Test agent config', workflows: ['workflow-a'] },
					],
				},
			],
			['store/nan0web_store.csv', [{ name: 'pkg-a', path: '/packages/pkg-a' }]],
			['store/nan0web_store.local.csv', []],
		]
		const mockFs = new MemoryDB({ predefined })
		await mockFs.connect()

		const storeDb = mockFs.extract('store')
		const app = new IndexWorkspaceApp(
			{ silent: false },
			{
				db: mockFs.extract('packages/ai/data'),
				storeDb,
				workspaceDb: mockFs,
				workspaceRoot,
			},
		)
		app.getWorkspaceRoot = () => '/'

		const agentEvents = []
		for await (const ev of app.indexAgents({
			show: (msg, type) => ({ type, message: msg }),
			progress: (msg, percent, opts) => ({ type: 'progress', message: msg, percent, opts }),
		})) {
			agentEvents.push(ev)
		}

		const agentSuccess = agentEvents.filter((e) => e.type === 'success')
		assert.ok(agentSuccess.length > 0, 'Agent indexing should complete successfully')

		const indexExists = await app._.db.statDocument('nan0web_agents.index.nan0')
		assert.ok(indexExists.exists, 'nan0web_agents.index.nan0 should exist')

		await mockFs.disconnect()
	})
})
