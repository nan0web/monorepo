import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { KBIndexModel } from './KBIndexModel.js'
import { KBScanner } from '../utils/kb/KBScanner.js'
import { KBIndexer } from '../utils/kb/KBIndexer.js'
import { KBHashStore } from '../utils/kb/KBHashStore.js'

describe('KB Index: Local Story', () => {
	it('should index local project using DB state', async () => {
		const db = new DB({
			predefined: [['/my-project/README.md', '# Hi']],
		})
		await db.connect()

		const model = new KBIndexModel({ cwd: '/my-project' }, { db })
		const deps = { scanner: new KBScanner(), indexer: new KBIndexer(), hashStore: new KBHashStore() }

		const result = await runGenerator(/** @type {any} */ (model.run(/** @type {any} */ (deps))), {
			ask: async () => ({ value: true, cancelled: false }),
			progress: () => {},
			log: () => {},
		})

		// runGenerator unwraps the result if it was { type: 'result', data: ... }
		// or just returns what was returned. Based on debug_kb, it matches the wrapped 'data' or the return.
		// Let's use result.data if it exists, else direct result
		const data = result.data || result
		assert.equal(data.mode, 'local')
		assert.equal(data.filesIndexed, 1)
	})
})

describe('KB Index: Registry Story', () => {
	it('should ask for registry when ambiguous', async () => {
		const db = new DB({
			predefined: [
				['/my-project/package.json', '{}'],
				['/my-project/requirements.txt', 'reqs'],
			],
		})
		await db.connect()

		const model = new KBIndexModel({ source: 'my-pkg', cwd: '/my-project' }, { db })
		const deps = {
			scanner: new KBScanner(),
			indexer: { downloadPackage: async () => {}, build: async () => ({ filesIndexed: 1 }) },
			hashStore: new KBHashStore()
		}

		let registryAsked = false
		const result = await runGenerator(/** @type {any} */ (model.run(/** @type {any} */ (deps))), {
			ask: /** @type {any} */(async (intent) => {
				if (intent.field === 'registry') {
					registryAsked = true
					return { value: 'npm' }
				}
				if (intent.field === 'confirm') return { value: true, cancelled: false }
			}),
			progress: () => {},
			log: () => {},
		})

		assert.ok(registryAsked, 'Should HAVE asked for registry')
		const data = result.data || result
		assert.equal(data.mode, 'external')
		assert.equal(data.registry, 'npm')
	})
})
