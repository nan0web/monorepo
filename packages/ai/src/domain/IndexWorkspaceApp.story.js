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

describe('IndexWorkspaceApp Story Test: MemoryDB & Fallback Scenarios', () => {
	it('should successfully discover and index projects using fallback and loaded store modes', async () => {
		// Mock MarkdownIndexer.prototype.getWorkspaceRoot to return '/'
		const originalGetWorkspaceRoot = MarkdownIndexer.prototype.getWorkspaceRoot
		MarkdownIndexer.prototype.getWorkspaceRoot = () => '/'

		// Prevent VectorDB from hitting the physical disk during in-memory tests
		const originalSave = VectorDB.prototype.save
		const originalLoad = VectorDB.prototype.load
		VectorDB.prototype.save = async () => {}
		VectorDB.prototype.load = async () => true

		// 1. Create a pure in-memory DB (MemoryDB) with predefined directory structure
		const mockFs = new DB({
			predefined: [
				// Explicit directory markers so MemoryDB builds directory metadata automatically
				['packages/', {}],
				['packages/pkg-a/', {}],
				['packages/pkg-a/docs/', {}],
				['packages/pkg-a/docs/en/', {}],
				['packages/pkg-b/', {}],
				['apps/', {}],
				['apps/app-c/', {}],
				['apps/app-c/docs/', {}],
				['apps/app-c/docs/en/', {}],
				['store/', {}],

				// File entries
				['packages/pkg-a/package.json', JSON.stringify({ name: '@nan0web/pkg-a' })],
				['packages/pkg-a/docs/en/project.md', '# Project A documentation\nThis is a mock project.'],
				['packages/pkg-b/package.json', JSON.stringify({ name: '@nan0web/pkg-b' })],
				['packages/pkg-b/nan0web.nan0', '- id: "test-agent"\n  description: "Test agent config"\n  workflows:\n    - workflow-a'],
				['apps/app-c/package.json', JSON.stringify({ name: '@nan0web/app-c' })],
				['apps/app-c/docs/en/project.md', '# App C documentation\nThis is a mock app.'],
				// Empty store at first
				['store/nan0web_store.csv', 'name,path\n'],
				['store/nan0web_store.local.csv', 'name,path\n']
			]
		})
		await mockFs.connect()

		const workspaceRoot = '/'

		// Extract storeDb and decorate it with a simple CSV parser since base DB has no built-in CSV parser
		const storeDb = mockFs.extract('store')
		storeDb.loadDocumentAs = async (ext, uri, defaultValue) => {
			const raw = storeDb.data.get(uri) ?? defaultValue
			if (typeof raw === 'string' && ext === '.csv') {
				const lines = raw.trim().split('\n')
				if (lines.length <= 1) return []
				const headers = lines[0].split(',')
				return lines.slice(1).map(line => {
					const values = line.split(',')
					const obj = {}
					headers.forEach((h, i) => {
						obj[h.trim()] = values[i]?.trim()
					})
					return obj
				})
			}
			return raw
		}

		// Instantiate app with silent: false to capture show and success events
		const app = new IndexWorkspaceApp(
			{ silent: false, concurrency: 1, scopes: ['docs'] },
			{
				db: mockFs.extract('packages/ai/data'), // Local app db mock
				storeDb,                                // Decorated store db mock
				workspaceDb: mockFs,                    // Workspace DB mock
				workspaceRoot
			}
		)

		// Overwrite workspaceRoot resolution to return '/' for test
		app.getWorkspaceRoot = () => '/'

		// Let's test the _getProjectsToIndex fallback logic first
		const discoveredFallback = await app._getProjectsToIndex(storeDb, workspaceRoot)

		assert.ok(discoveredFallback.length > 0, 'Should fall back to scanning workspace directories')
		const names = discoveredFallback.map(p => p.name)
		assert.ok(names.includes('pkg-a'), 'Should discover pkg-a')
		assert.ok(names.includes('pkg-b'), 'Should discover pkg-b')
		assert.ok(names.includes('app-c'), 'Should discover app-c')

		// 2. Mock Embedder and run full index with fallback (empty store)
		const mockEmbedder = new MockEmbedder()

		// Run indexFull generator
		const events = []
		for await (const ev of app.indexFull({
			show: (msg, type) => ({ type, message: msg }),
			progress: (msg, percent, opts) => ({ type: 'progress', message: msg, percent, opts }),
			MarkdownIndexer,
			Embedder: function() { return mockEmbedder }
		})) {
			events.push(ev)
		}

		// Verify success events
		const successEvents = events.filter(e => e.type === 'success')
		assert.ok(successEvents.length > 0, 'Indexing should complete successfully')

		// 3. Test loaded store mode
		await storeDb.saveDocument('nan0web_store.csv', 'name,path\npkg-a,/packages/pkg-a\n')
		const discoveredLoaded = await app._getProjectsToIndex(storeDb, workspaceRoot)
		assert.strictEqual(discoveredLoaded.length, 1, `Should load exactly 1 project from store, got: ${JSON.stringify(discoveredLoaded)}`)
		assert.strictEqual(discoveredLoaded[0].name, 'pkg-a')

		// 4. Test indexAgents
		const agentEvents = []
		for await (const ev of app.indexAgents({
			show: (msg, type) => ({ type, message: msg }),
			progress: (msg, percent, opts) => ({ type: 'progress', message: msg, percent, opts }),
		})) {
			agentEvents.push(ev)
		}

		const agentSuccess = agentEvents.filter(e => e.type === 'success')
		assert.ok(agentSuccess.length > 0, 'Agent indexing should complete successfully')

		// Check that nan0web_agents.index.nan0 is created in app local db
		const localDb = app._.db
		const indexExists = await localDb.statDocument('nan0web_agents.index.nan0')
		assert.ok(indexExists.exists, 'nan0web_agents.index.nan0 should be successfully saved to app database')

		// Restore original methods
		MarkdownIndexer.prototype.getWorkspaceRoot = originalGetWorkspaceRoot
		VectorDB.prototype.save = originalSave
		VectorDB.prototype.load = originalLoad
		await mockFs.disconnect()
	})
})
