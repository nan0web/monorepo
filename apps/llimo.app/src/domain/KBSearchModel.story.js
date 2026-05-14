import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import { KBSearchModel } from './KBSearchModel.js'

describe('User Story: Cascading Search with Smart Stop', () => {
	it('should stop at CWD if results are sufficient', async () => {
		const model = new KBSearchModel({ query: 'Model', limit: 2 })
		
		const deps = {
			hashStore: { isStale: async () => false, read: async () => 'h' },
			searcher: {
				search: async (q, d) => {
					// Simulating high relevance results in CWD
					if (d.includes('.datasets')) return [{ file: 'A.js', line: 1, score: 0.95 }, { file: 'B.js', line: 5, score: 0.92 }]
					return []
				}
			}
		}

		const result = await runGenerator(/** @type {any} */ (model.run(/** @type {any} */ (deps))), {
			ask: async () => ({ value: true, cancelled: false }),
			progress: () => {},
			log: () => {}
		})

		assert.equal(result.total, 2)
		assert.equal(result.smartStop, true)
		assert.deepEqual(result.sources, ['cwd'])
	})
})

describe('User Story: Deep Dependency Indexing on Demand', () => {
	it('should suggest indexing missing dependency when found during search', async () => {
		const model = new KBSearchModel({ query: 'lodash render' })
		
		const deps = {
			hashStore: { isStale: async () => false, read: async () => 'h', write: async () => {} },
			searcher: {
				search: async (q, d) => {
					if (d.includes('lodash')) return [{ file: 'lodash.js', line: 10, score: 0.99 }]
					return []
				},
				listLocalProjects: async () => [],
				listExternalPackages: async () => [],
				findUnindexedDependencies: async () => [
					{ name: 'lodash', registry: 'npm', targetDir: '/ext/lodash' }
				]
			},
			indexer: {
				downloadPackage: async () => {},
				reindex: async () => {}
			}
		}

		let askConfirmationSeen = false
		const result = await runGenerator(/** @type {any} */ (model.run(/** @type {any} */ (deps))), {
			ask: /** @type {any} */(async (intent) => {
				if (intent.field === 'confirm') {
					askConfirmationSeen = true
					return { value: true, cancelled: false }
				}
			}),
			progress: () => {},
			log: () => {}
		})

		assert.equal(askConfirmationSeen, true)
		assert.equal(result.total, 1)
		assert.deepEqual(result.sources, ['external:lodash'])
	})
})
