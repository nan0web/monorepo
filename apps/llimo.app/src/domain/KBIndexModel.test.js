import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { KBIndexModel } from './KBIndexModel.js'

describe('KBIndexModel Contract', () => {
	it('resolves default static properties', () => {
		const model = new KBIndexModel()
		assert.equal(model.source, '')
		assert.equal(model.cwd, '')
		assert.equal(model.registry, '')
		assert.equal(model.isLocal, true)
	})

	it('parses source string correctly', () => {
		assert.deepEqual(KBIndexModel.parseSource('npm:lodash'), { prefix: 'npm', name: 'lodash' })
		assert.deepEqual(KBIndexModel.parseSource('lodash'), { prefix: '', name: 'lodash' })
		assert.deepEqual(KBIndexModel.parseSource('crates:serde'), { prefix: 'crates', name: 'serde' })
	})

	it('returns correct env and workDir', () => {
		const env = { HOME: '/mock-home' }
		const model = new KBIndexModel({ cwd: '/test-dir' }, { env })
		assert.equal(model.workDir, '/test-dir')
		assert.equal(model.env.HOME, '/mock-home')
	})

	it('runs local CWD indexing successfully (fresh hash)', async () => {
		const model = new KBIndexModel({ cwd: '/test-dir' })

		const deps = {
			scanner: { scan: async () => ['file1.md'] },
			indexer: { build: async () => ({ filesIndexed: 1, chunksCreated: 5 }) },
			hashStore: { compute: () => 'hash123', read: async () => 'hash123', write: async () => {} },
		}

		const generator = model.run(deps)
		
		const p1 = await generator.next()
		assert.equal(p1.value.type, 'progress')
		assert.equal(p1.value.message, KBIndexModel.UI.scanning_files)

		const p2 = await generator.next()
		assert.equal(p2.value.type, 'log')
		assert.equal(p2.value.message, KBIndexModel.UI.already_fresh)

		const result = await generator.next()
		assert.equal(result.done, true)
		assert.equal(result.value.type, 'result')
		assert.equal(result.value.data.mode, 'local')
		assert.equal(result.value.data.skipped, true)
	})

	it('runs local CWD indexing successfully (stale hash)', async () => {
		const model = new KBIndexModel({ cwd: '/test-dir' })

		const deps = {
			scanner: { scan: async () => ['file1.md'] },
			indexer: { build: async () => ({ filesIndexed: 1, chunksCreated: 5 }) },
			hashStore: { compute: () => 'hash999', read: async () => 'hash123', write: async () => {} },
		}

		const generator = model.run(deps)
		
		await generator.next() // scan
		const logStale = await generator.next() // stale log
		assert.equal(logStale.value.type, 'log')
		assert.equal(logStale.value.message, KBIndexModel.UI.reindexing_stale)

		const pBuild = await generator.next()
		assert.equal(pBuild.value.message, KBIndexModel.UI.building_index)

		const pHash = await generator.next()
		assert.equal(pHash.value.message, KBIndexModel.UI.generating_hash)

		const logSuccess = await generator.next()
		assert.equal(logSuccess.value.level, 'success')

		const result = await generator.next()
		assert.equal(result.done, true)
		assert.equal(result.value.data.filesIndexed, 1)
	})

	it('runs external package indexing successfully', async () => {
		const model = new KBIndexModel({ source: 'npm:lodash', registry: 'npm' }, { env: { HOME: '/home' } })

		let downloaded = false
		const deps = {
			scanner: { scan: async () => ['lodash.js'] },
			indexer: { 
				build: async () => ({ filesIndexed: 1, chunksCreated: 10 }),
				downloadPackage: async (db, reg, name, dir) => {
					downloaded = true
					assert.equal(reg, 'npm')
					assert.equal(name, 'lodash')
					assert.equal(dir, '/home/.llimo/kb/@/npmjs.com/lodash')
				}
			},
			hashStore: { compute: () => 'hashExt', write: async () => {} },
		}

		const generator = model.run(deps)
		
		const askConfirm = await generator.next()
		assert.equal(askConfirm.value.type, 'ask')
		assert.equal(askConfirm.value.field, 'confirm')

		const progDownload = await generator.next({ value: true }) // User confirms Yes!
		assert.equal(progDownload.value.type, 'progress')
		assert.ok(progDownload.value.message.includes('lodash'))
		
		await generator.next() // scan
		await generator.next() // build
		await generator.next() // hash
		await generator.next() // complete

		const result = await generator.next()
		assert.equal(result.done, true)
		assert.equal(result.value.data.mode, 'external')
		assert.equal(result.value.data.registry, 'npm')
		assert.equal(downloaded, true)
	})

	it('detects registry automatically and handles ambiguity', async () => {
		const model = new KBIndexModel({ source: 'lodash', cwd: '/test' }, { env: { HOME: '/home' } })
		
		const deps = {
			scanner: { 
				detectRegistries: async () => ['npm', 'pip'],
				scan: async () => []
			},
			indexer: { build: async () => ({}), downloadPackage: async () => {} },
			hashStore: { compute: () => '', write: async () => {} },
		}

		const generator = model.run(deps)
		
		const progDetect = await generator.next()
		assert.equal(progDetect.value.message, KBIndexModel.UI.detecting_registry)

		const askReg = await generator.next()
		assert.equal(askReg.value.type, 'ask')
		assert.equal(askReg.value.field, 'registry')
		assert.deepEqual(askReg.value.schema.options, ['npm', 'pip'])

		const askConfirm = await generator.next({ value: 'npm' }) // Select 'npm'
		assert.equal(askConfirm.value.field, 'confirm')
		assert.ok(askConfirm.value.schema.help.includes('lodash'))
	})
})
