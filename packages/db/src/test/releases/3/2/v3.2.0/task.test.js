import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '../../../../../DB/DB.js'

describe('DB Core Expansion (v3.2.0)', () => {
	it('db.getMounts() returns array of mounted instances', () => {
		const root = new DB({ root: '/' })
		const mount1 = new DB({ root: '/mount1' })
		const mount2 = new DB({ root: '/mount2' })

		root.mount('@app', mount1)
		root.mount('~', mount2)

		const mounts = root.getMounts()
		
		assert.equal(Array.isArray(mounts), true)
		assert.equal(mounts.length, 2)
		
		const appMount = mounts.find(m => m.prefix === '@app')
		assert.ok(appMount)
		assert.strictEqual(appMount.db, mount1)

		const homeMount = mounts.find(m => m.prefix === '~')
		assert.ok(homeMount)
		assert.strictEqual(homeMount.db, mount2)
	})

	it('db.getVolumes() returns default array with root', async () => {
		const db = new DB()
		const volumes = await db.getVolumes()
		assert.deepEqual(volumes, ['/'])
	})

	it('db.realpath() returns normalized uri in abstract DB', () => {
		const db = new DB()
		assert.strictEqual(db.realpath('/a/b/../c'), 'a/c')
	})
})
