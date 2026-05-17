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

// Automatically builds virtual directory metadata from file paths
function buildVirtualDirectories(predefined) {
	const dirs = new Set()
	for (const [key] of predefined) {
		const parts = key.split('/')
		parts.pop() // remove filename
		let current = ''
		for (const part of parts) {
			current += part + '/'
			dirs.add(current)
		}
	}
	for (const dir of dirs) {
		if (!predefined.some(([k]) => k === dir)) {
			predefined.push([dir, {}])
		}
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

		// 1. Define the files as pure JS objects exactly in the format the USER specified
		const predefined = [
			['packages/pkg-a/package.json', { name: '@nan0web/pkg-a' }],
			['packages/pkg-a/docs/en/project.md', '# Project A documentation\nThis is a mock project.'],
			['packages/pkg-b/package.json', { name: '@nan0web/pkg-b' }],
			[
				'packages/pkg-b/nan0web.nan0',
				{
					agents: [
						{ id: 'test-agent', description: 'Test agent config', workflows: ['workflow-a'] },
					],
				},
			],
			['apps/app-c/package.json', { name: '@nan0web/app-c' }],
			['apps/app-c/docs/en/project.md', '# App C documentation\nThis is a mock app.'],
			// Empty store at first to trigger fallback logic
			['store/nan0web_store.csv', []],
			['store/nan0web_store.local.csv', []],
		]

		// Automatically construct virtual parent directories for MemoryDB
		buildVirtualDirectories(predefined)

		const mockFs = new DB({ predefined })
		await mockFs.connect()

		// Decorate mockFs to serialize JS objects on the fly when read as files
		mockFs.loadDocumentAs = async (ext, uri, defaultValue) => {
			const raw = mockFs.data.get(uri) ?? defaultValue
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
			return raw
		}

		const workspaceRoot = '/'

		// Extract storeDb and decorate it with a simple CSV parser since base DB has no built-in CSV parser
		const storeDb = mockFs.extract('store')
		storeDb.loadDocumentAs = async (ext, uri, defaultValue) => {
			const raw = storeDb.data.get(uri) ?? defaultValue
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
			return raw
		}

		// Instantiate app with silent: false to capture show and success events
		const app = new IndexWorkspaceApp(
			{ silent: false, concurrency: 1, scopes: ['docs'] },
			{
				db: mockFs.extract('packages/ai/data'), // Local app db mock
				storeDb,                                // Decorated store db mock
				workspaceDb: mockFs,                    // Workspace DB mock
				workspaceRoot,
			},
		)

		// Overwrite workspaceRoot resolution to return '/' for test
		app.getWorkspaceRoot = () => '/'

		// Let's test the _getProjectsToIndex fallback logic first
		const discoveredFallback = await app._getProjectsToIndex(storeDb, workspaceRoot)

		assert.ok(discoveredFallback.length > 0, 'Should fall back to scanning workspace directories')
		const names = discoveredFallback.map((p) => p.name)
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
			Embedder: function () {
				return mockEmbedder
			},
		})) {
			events.push(ev)
		}

		// Verify success events
		const successEvents = events.filter((e) => e.type === 'success')
		assert.ok(successEvents.length > 0, 'Indexing should complete successfully')

		// 3. Test loaded store mode
		await storeDb.saveDocument('nan0web_store.csv', 'name,path\npkg-a,/packages/pkg-a\n')
		const discoveredLoaded = await app._getProjectsToIndex(storeDb, workspaceRoot)
		assert.strictEqual(
			discoveredLoaded.length,
			1,
			`Should load exactly 1 project from store, got: ${JSON.stringify(discoveredLoaded)}`,
		)
		assert.strictEqual(discoveredLoaded[0].name, 'pkg-a')

		// 4. Test indexAgents
		const agentEvents = []
		for await (const ev of app.indexAgents({
			show: (msg, type) => ({ type, message: msg }),
			progress: (msg, percent, opts) => ({ type: 'progress', message: msg, percent, opts }),
		})) {
			agentEvents.push(ev)
		}

		const agentSuccess = agentEvents.filter((e) => e.type === 'success')
		assert.ok(agentSuccess.length > 0, 'Agent indexing should complete successfully')

		// Check that nan0web_agents.index.nan0 is created in app local db
		const localDb = app._.db
		const indexExists = await localDb.statDocument('nan0web_agents.index.nan0')
		assert.ok(
			indexExists.exists,
			'nan0web_agents.index.nan0 should be successfully saved to app database',
		)

		// Restore original methods
		MarkdownIndexer.prototype.getWorkspaceRoot = originalGetWorkspaceRoot
		VectorDB.prototype.save = originalSave
		VectorDB.prototype.load = originalLoad
		await mockFs.disconnect()
	})
})
