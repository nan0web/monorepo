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

// Clean MemoryDB subclass to natively support CSV, JSON and nano files without ad-hoc method mocking
class MemoryDB extends DB {
	async loadDocumentAs(ext, uri, defaultValue) {
		const normUri = this.normalize(uri)
		const raw = this.data.get(normUri) ?? defaultValue
		if (typeof raw === 'string' && ext === '.csv') {
			const lines = raw.trim().split('\n')
			if (lines.length <= 1) return []
			const headers = lines[0].split(',')
			return lines.slice(1).map((line) => {
				const values = line.split(',')
				const obj = {}
				headers.forEach((h, i) => {
					obj[h.trim()] = values[i]?.trim()
				})
				return obj
			})
		}
		if (ext === '.txt' && typeof raw === 'object' && raw !== null) {
			if (raw.agents) {
				const lines = []
				for (const agent of raw.agents) {
					lines.push(`- id: "${agent.id}"`)
					if (agent.description) {
						lines.push(`  description: "${agent.description}"`)
					}
					if (agent.workflows) {
						lines.push('  workflows:')
						for (const w of agent.workflows) {
							lines.push(`    - "${w}"`)
						}
					}
					if (agent.inspectors) {
						lines.push('  inspectors:')
						for (const i of agent.inspectors) {
							lines.push(`    - "${i}"`)
						}
					}
				}
				return lines.join('\n')
			}
			return JSON.stringify(raw)
		}
		if (ext === '.json' && typeof raw === 'string') {
			try {
				return JSON.parse(raw)
			} catch (e) {
				return defaultValue
			}
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
