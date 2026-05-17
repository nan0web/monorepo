import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { IndexWorkspaceApp } from './IndexWorkspaceApp.js'
import { MarkdownIndexer } from './MarkdownIndexer.js'
import { DBFS, DocumentEntry, DocumentStat } from '@nan0web/db-fs'

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

		// 1. Create in-memory mock file system (MemoryDB)
		const mockFs = new DBFS({
			predefined: [
				// Projects
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

		// Mock listDir to simulate directory structures fully in-memory
		mockFs.listDir = async (uri) => {
			const dir = uri.replace(/^\//, '').replace(/\/$/, '')
			if (dir === '') {
				return [
					new DocumentEntry({ name: 'packages', path: 'packages', stat: new DocumentStat({ isDirectory: true }) }),
					new DocumentEntry({ name: 'apps', path: 'apps', stat: new DocumentStat({ isDirectory: true }) }),
					new DocumentEntry({ name: 'store', path: 'store', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'packages') {
				return [
					new DocumentEntry({ name: 'pkg-a', path: 'packages/pkg-a', stat: new DocumentStat({ isDirectory: true }) }),
					new DocumentEntry({ name: 'pkg-b', path: 'packages/pkg-b', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'apps') {
				return [
					new DocumentEntry({ name: 'app-c', path: 'apps/app-c', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'packages/pkg-a') {
				return [
					new DocumentEntry({ name: 'package.json', path: 'packages/pkg-a/package.json', stat: new DocumentStat({ isFile: true }) }),
					new DocumentEntry({ name: 'docs', path: 'packages/pkg-a/docs', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'packages/pkg-a/docs') {
				return [
					new DocumentEntry({ name: 'en', path: 'packages/pkg-a/docs/en', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'packages/pkg-a/docs/en') {
				return [
					new DocumentEntry({ name: 'project.md', path: 'packages/pkg-a/docs/en/project.md', stat: new DocumentStat({ isFile: true }) })
				]
			}
			if (dir === 'packages/pkg-b') {
				return [
					new DocumentEntry({ name: 'package.json', path: 'packages/pkg-b/package.json', stat: new DocumentStat({ isFile: true }) }),
					new DocumentEntry({ name: 'nan0web.nan0', path: 'packages/pkg-b/nan0web.nan0', stat: new DocumentStat({ isFile: true }) })
				]
			}
			if (dir === 'apps/app-c') {
				return [
					new DocumentEntry({ name: 'package.json', path: 'apps/app-c/package.json', stat: new DocumentStat({ isFile: true }) }),
					new DocumentEntry({ name: 'docs', path: 'apps/app-c/docs', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'apps/app-c/docs') {
				return [
					new DocumentEntry({ name: 'en', path: 'apps/app-c/docs/en', stat: new DocumentStat({ isDirectory: true }) })
				]
			}
			if (dir === 'apps/app-c/docs/en') {
				return [
					new DocumentEntry({ name: 'project.md', path: 'apps/app-c/docs/en/project.md', stat: new DocumentStat({ isFile: true }) })
				]
			}
			return []
		}

		const workspaceRoot = '/'

		// Instantiate app with silent: false to capture show and success events
		const app = new IndexWorkspaceApp(
			{ silent: false, concurrency: 1, scopes: ['docs'] },
			{
				db: mockFs.extract('packages/ai/data'), // Local app db mock
				storeDb: mockFs.extract('store'),      // Store db mock
				workspaceDb: mockFs,                    // Workspace DBFS mock
				workspaceRoot
			}
		)

		// Overwrite workspaceRoot resolution to return '/' for test
		app.getWorkspaceRoot = () => '/'

		// Let's test the _getProjectsToIndex fallback logic first
		const storeDb = mockFs.extract('store')
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
		assert.strictEqual(discoveredLoaded.length, 1, 'Should load exactly 1 project from store')
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

		// Restore original prototype method
		MarkdownIndexer.prototype.getWorkspaceRoot = originalGetWorkspaceRoot
		await mockFs.disconnect()
	})
})
