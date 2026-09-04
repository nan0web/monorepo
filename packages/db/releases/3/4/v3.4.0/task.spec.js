import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB, { DBDriverProtocol, HydratedModel } from '../../../../src/index.js'

describe('Release v3.4.0 Contract: HydratedModel & Caching in @nan0web/db', () => {
	describe('1. HydratedModel Integration', () => {
		it('1.1 HydratedModel applies defaults and plain input', () => {
			const model = new HydratedModel({ title: 'Standard' })
			assert.equal(model.title, 'Standard')
		})

		it('1.2 HydratedModel resolves explicit $ references from parent document', () => {
			const parentDoc = {
				$files: ['/docs/rules.pdf'],
				currencies: ['UAH', 'EUR'],
			}

			const model = new HydratedModel(
				{
					title: 'Card Item',
					files: '$files',
					currencies: '$currencies',
				},
				{ parent: parentDoc }
			)

			assert.deepEqual(model.files, ['/docs/rules.pdf'])
			assert.deepEqual(model.currencies, ['UAH', 'EUR'])
		})

		it('1.3 HydratedModel auto-hydrates unprovided fields from parent context', () => {
			const parentDoc = {
				locale: 'uk',
				category: 'premium',
			}

			const model = new HydratedModel(
				{
					title: 'VIP Account',
				},
				{ parent: parentDoc }
			)

			assert.equal(model.title, 'VIP Account')
			assert.equal(model.category, 'premium')
		})
	})

	describe('2. In-Memory Document Read Cache', () => {
		it('2.1 stores driver read result in this.data and avoids subsequent driver.read calls', async () => {
			let readCalls = 0
			class MockDriver extends DBDriverProtocol {
				async read(abs) {
					readCalls++
					return { title: 'Cached Document', abs }
				}
				async stat(abs) {
					return { exists: true, isFile: true, isDirectory: false }
				}
			}

			const db = new DB({ driver: new MockDriver() })

			// First read: should invoke driver.read
			const doc1 = await db.loadDocument('articles/first.json')
			assert.equal(readCalls, 1)
			assert.deepEqual(doc1, { title: 'Cached Document', abs: db.absolute('articles/first.json') })

			// Second read: should hit in-memory cache and not call driver.read again
			const doc2 = await db.loadDocument('articles/first.json')
			assert.equal(readCalls, 1, 'Expected driver.read not to be called again on cache hit')
			assert.deepEqual(doc2, doc1)
		})

		it('2.2 Cache Invalidation: saveDocument and dropDocument correctly update and clear this.data', async () => {
			let readCalls = 0
			class MockDriver extends DBDriverProtocol {
				async read(abs) {
					readCalls++
					return { count: 1 }
				}
				async write(abs, doc) {
					return true
				}
				async delete(abs) {
					return true
				}
				async stat(abs) {
					return { exists: true, isFile: true, isDirectory: false }
				}
			}

			const db = new DB({ driver: new MockDriver() })

			const doc = await db.loadDocument('settings.json')
			assert.equal(readCalls, 1)
			assert.deepEqual(doc, { count: 1 })

			// Mutate via saveDocument: should update cache immediately
			await db.saveDocument('settings.json', { count: 2 })
			const cachedAfterSave = await db.loadDocument('settings.json')
			assert.equal(readCalls, 1, 'Cache should provide updated document without driver.read')
			assert.deepEqual(cachedAfterSave, { count: 2 })

			// Delete via dropDocument: cache should be invalidated
			await db.dropDocument('settings.json')
			const loadedAfterDrop = await db.loadDocument('settings.json')
			assert.equal(readCalls, 2, 'After dropDocument, driver.read should be called again')
			assert.deepEqual(loadedAfterDrop, { count: 1 })
		})
	})

	describe('3. Directory & Negative Caching', () => {
		it('3.1 caches readDir/getGlobals results and caches missing paths', async () => {
			let listDirCalls = 0
			class MockDriver extends DBDriverProtocol {
				async listDir(abs) {
					listDirCalls++
					return []
				}
				async read(abs) {
					return undefined
				}
				async stat(abs) {
					return { exists: false, isFile: false, isDirectory: false }
				}
			}

			const db = new DB({ driver: new MockDriver() })

			// Call getGlobals multiple times for subpaths
			const g1 = await db.getGlobals('deep/nested/path/item.json')
			const firstCallCount = listDirCalls

			const g2 = await db.getGlobals('deep/nested/path/item.json')
			assert.equal(listDirCalls, firstCallCount, 'Expected negative / directory cache to prevent subsequent listDir calls')
			assert.deepEqual(g1, g2)
		})
	})

	describe('4. Performance Benchmark', () => {
		it('4.1 1000 documents with globals, inherit and refs execute in < 500ms', async () => {
			class FastMockDriver extends DBDriverProtocol {
				async read(abs) {
					return { id: abs, type: 'test' }
				}
				async stat(abs) {
					return { exists: true, isFile: true, isDirectory: false }
				}
				async listDir(abs) {
					return []
				}
			}

			const db = new DB({ driver: new FastMockDriver() })

			const uris = Array.from({ length: 1000 }, (_, i) => `posts/post-${i}.json`)

			const start = Date.now()
			const results = await Promise.all(uris.map((uri) => db.fetch(uri)))
			const durationMs = Date.now() - start

			assert.equal(results.length, 1000)
			assert.ok(
				durationMs < 500,
				`Expected 1000 documents to fetch in < 500ms, but took ${durationMs}ms`
			)
		})
	})

	describe('5. Multi-Index Directory Support', () => {
		it('5.1 routes README.md and docs/README.md to root and /docs/', () => {
			const db = new DB()
			assert.equal(db.route('README.md'), '/')
			assert.equal(db.route('docs/README.md'), '/docs/')
			assert.equal(db.route('index.md'), '/')
			assert.equal(db.route('docs/index.md'), '/docs/')
		})

		it('5.2 db.fetch("dir/") returns README when index is missing', async () => {
			class ReadmeDriver extends DBDriverProtocol {
				async stat(abs) {
					if (abs.endsWith('README.md')) {
						return { exists: true, isFile: true, isDirectory: false }
					}
					return { exists: false, isFile: false, isDirectory: false }
				}
				async read(abs) {
					if (abs.endsWith('README.md')) {
						return { title: 'Readme Doc' }
					}
					return undefined
				}
				async listDir(abs) {
					return ['README.md']
				}
			}

			const db = new DB({ driver: new ReadmeDriver() })
			const result = await db.fetch('guide/', { allowDirs: true })
			assert.deepEqual(result, { title: 'Readme Doc' })
		})
	})
})
