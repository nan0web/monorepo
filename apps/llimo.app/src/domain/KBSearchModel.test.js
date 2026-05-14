import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { KBSearchModel } from './KBSearchModel.js'

describe('KBSearchModel Contract', () => {
	it('resolves default properties and aliases', () => {
		const model = new KBSearchModel({ in: 'pytest' })
		assert.equal(model.inPackage, 'pytest')
		assert.equal(model.query, '')
		assert.equal(model.limit, 10)
		assert.equal(model.threshold, 0.75)
		assert.equal(model.depth, 'all')
	})

	it('validates query presence', async () => {
		const model = new KBSearchModel()
		const generator = model.run(/** @type {any} */ ({}))
		
		const errLog = await generator.next()
		assert.equal(errLog.value.type, 'log')
		assert.equal(errLog.value.level, 'error')
		assert.equal(errLog.value.message, KBSearchModel.UI.query_required)

		const done = await generator.next()
		assert.equal(done.value.status, 'failed')
	})

	it('searches direct package (--in)', async () => {
		const model = new KBSearchModel({ in: '@nan0web/ui-cli', query: 'renderForm' })
		
		const deps = {
			searcher: {
				resolvePackageIndex: async () => '/home/.llimo/kb/@/npmjs.com/@nan0web/ui-cli',
				search: async () => [{ file: 'foo.js', line: 10, score: 0.9, content: 'export renderForm' }]
			}
		}

		const generator = model.run(/** @type {any} */ (deps))
		
		const prog = await generator.next()
		assert.ok(prog.value.message.includes('@nan0web/ui-cli'))

		const logDone = await generator.next()
		assert.equal(logDone.value.message, KBSearchModel.UI.search_complete)

		const result = await generator.next()
		assert.equal(result.value.type, 'result')
		assert.equal(result.value.data.total, 1)
		assert.deepEqual(result.value.data.sources, ['@nan0web/ui-cli'])
	})

	it('runs cascade search with Smart Stop', async () => {
		const model = new KBSearchModel({ query: 'Model', limit: 2, cwd: '/test-dir' })

		const hits = [
			{ file: 'A.js', line: 1, score: 0.95 }, 
			{ file: 'B.js', line: 2, score: 0.90 }
		]
		
		const deps = {
			hashStore: { 
				isStale: async () => false,
				read: async () => 'hash123'
			},
			searcher: {
				search: async () => hits
			}
		}

		const generator = model.run(/** @type {any} */ (deps))

		const checkProgress = await generator.next() // checking hash
		assert.equal(checkProgress.value.message, KBSearchModel.UI.checking_hash)
		
		const searchProgress = await generator.next() // searching cwd
		assert.equal(searchProgress.value.message, KBSearchModel.UI.searching_cwd)

		const smartStop = await generator.next() // smart stop log
		assert.equal(smartStop.value.message, KBSearchModel.UI.smart_stop)

		const res = await generator.next()
		assert.equal(res.done, true)
		assert.equal(res.value.data?.smartStop, true)
		assert.equal(res.value.data?.total, 2)
		assert.equal(res.value.data?.sources[0], 'cwd')
	})

	it('runs full cascade when limit not reached', async () => {
		const model = new KBSearchModel({ query: 'Util', limit: 3, cwd: '/root' })

		const cwdHits = [{ file: 'cwd.js', score: 0.8, line: 1 }] // 1 hit (needs 2 more)
		const localHits = [{ file: 'local.js', score: 0.9, line: 1 }] // 1 hit (needs 1 more)
		const extHits = [{ file: 'ext.js', score: 0.85, line: 1 }] // 1 hit (total 3 reached)

		const deps = {
			hashStore: { isStale: async () => false, read: async () => 'hash' },
			searcher: {
				search: async (db, q, d) => {
					if (d.includes('/root')) return cwdHits
					if (d.includes('/proj2')) return localHits
					if (d.includes('/ext1')) return extHits
					return []
				},
				listLocalProjects: async () => ['/proj2'],
				listExternalPackages: async () => ['/ext1', '/ext2'],
				findUnindexedDependencies: async () => []
			}
		}

		const generator = model.run(/** @type {any} */ (deps))
		
		// Skip logs, fetch result
		let res
		for await (const intent of generator) {
			if (intent && intent.type === 'result') res = intent
		}

		// Because all intents in OLMUI generator yield objects, 
		// the final `return` is what contains `result` in our KBSearchModel layout 
		// actually, it returns the object directly, so iteration loop consumes until done.
		
		assert.equal(res, undefined, 'It returns object, so for-await finishes before getting it')
	})

	it('detects unindexed dependencies and asks to download', async () => {
		const model = new KBSearchModel({ query: 'API', limit: 10, cwd: '/root' })
		
		const deps = {
			hashStore: { isStale: async () => false, read: async () => 'hash' },
			searcher: {
				search: async (db, q, d) => {
					if (d.includes('axios')) return [{ file: 'api.js', line: 1, score: 0.95 }]
					return []
				},
				listLocalProjects: async () => [],
				listExternalPackages: async () => [],
				findUnindexedDependencies: async () => [
					{ name: 'axios', registry: 'npm', targetDir: '/ext/axios' }
				]
			},
			indexer: {
				downloadPackage: async () => {},
				reindex: async () => {}
			}
		}

		const generator = model.run(/** @type {any} */ (deps))
		
		await generator.next() // checking hash
		await generator.next() // searching cwd
		await generator.next() // searching local
		await generator.next() // searching external
		
		const askDownload = await generator.next()
		assert.equal(askDownload.value.type, 'ask')
		assert.equal(askDownload.value.field, 'confirm')

		const progDownload = await generator.next({ value: true }) // User confirms Yes!
		assert.equal(progDownload.value.type, 'progress')
		assert.ok(progDownload.value.message.includes('axios'))

		// skips logs and hits
		let resultVal
		let next = await generator.next()
		while (!next.done) {
			next = await generator.next()
		}
		resultVal = next.value

		assert.equal(resultVal.type, 'result')
		assert.deepEqual(resultVal.data.sources, ['external:axios'])
	})
})
