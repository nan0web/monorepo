import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { DB, Data } from '../../../../../index.js'
import { DBFS } from '../../../../../../../db-fs/src/index.js'
import { NoConsole } from '@nan0web/log'

describe('Release v1.3.1: Contract Tests', () => {
	describe('1. Driver Integration (DB + DBFS)', () => {
		it('should allow mounting DBFS and successfully read data', async () => {
			const db = new DB({ console: new NoConsole() })
			const fsDb = new DBFS({
				cwd: '.',
				root: 'test/fixtures', // Assume fixtures directory exists or we create it
				console: new NoConsole(),
			})

			db.mount('/fs', fsDb)

			// This test should fail if mounting or routing is broken
			// or if fixtures directory is empty
			const res = await db.stat('/fs')
			assert.ok(res, 'Stat of mounted database must succeed')
		})

		it('should perform pass-through get via mounted driver', async () => {
			const db = new DB({ console: new NoConsole() })
			const fsDb = new DBFS({
				cwd: '.',
				root: '.',
				console: new NoConsole(),
			})
			db.mount('/local', fsDb)

			// Read package.json via virtual path
			const pkg = await db.get('/local/package.json')
			assert.equal(pkg.name, '@nan0web/db', 'Data must be read via DBFS')
		})
	})

	describe('2. Circular References (Data stability)', () => {
		it('Data.merge should not crash when circular references are present', () => {
			const a = { name: 'A' }
			const b = { name: 'B', parent: a }
			a.child = b

			const target = { data: {} }
			const source = { data: a }

			// Test circular reference safety in Data.merge
			assert.doesNotThrow(() => {
				Data.merge(target, source)
			}, 'Data.merge must safely handle circular references')
		})

		it('Data.flatten should not crash when circular references are present', () => {
			const a = { name: 'A' }
			a.self = a

			assert.doesNotThrow(() => {
				Data.flatten(a)
			}, 'Data.flatten must safely handle circular references')
		})
	})

	describe('3. Deep Model Inheritance', () => {
		it('should correctly hydrate data across model inheritance chain', async () => {
			class Base {
				static type = { default: 'base' }
				constructor(data) {
					Object.assign(this, data)
				}
			}
			class Level1 extends Base {
				static level = { default: 1 }
			}
			class Level2 extends Level1 {
				static sub = { default: true }
			}

			const db = new DB({ console: new NoConsole() })
			db.model('/deep', Level2)

			// Create data via official API
			await db.set('deep/item.json', { name: 'test' })

			const item = await db.fetch('deep/item')

			assert.ok(item, 'Fetch must return data')
			assert.ok(item instanceof Level2, 'Must be instance of Level2')
			assert.ok(item instanceof Base, 'Must be instance of Base')

			// Deep validation check
			const validation = await db.validate('deep/item', { name: 'test', level: 'wrong' })
			assert.equal(validation.valid, false, 'Validation must detect invalid field in inherited model')
		})
	})
})
