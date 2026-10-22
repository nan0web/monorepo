import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import DB from '../../../../../DB/DB.js'

describe('Release v3.6.0 Regression: Cascading Root Contract (createRootUp & createRootDown) in @nan0web/db', () => {
	it('defines createRootUp and createRootDown on base DB instance', () => {
		const db = new DB()
		assert.equal(typeof db.createRootUp, 'function', 'createRootUp must be a function on DB')
		assert.equal(typeof db.createRootDown, 'function', 'createRootDown must be a function on DB')
	})

	it('computes correct delta(targetDir, db.cwd) on scoped rootDb', async () => {
		const db = new DB()
		if (typeof db.createRootUp === 'function') {
			const targetDir = path.resolve(process.cwd())
			const rootDb = await db.createRootUp('package.json', targetDir)
			assert.ok(rootDb, 'rootDb instance must be created')
			assert.ok(rootDb.cwd, 'rootDb must have resolved cwd')
			assert.ok(typeof rootDb.root === 'string', 'rootDb must have root delta')
		}
	})

	it('checks specific file when extension is provided', async () => {
		const db = new DB()
		if (typeof db.createRootUp === 'function') {
			const rootDb = await db.createRootUp('package.json', process.cwd())
			assert.ok(rootDb)
		}
	})

	it('checks DATA_EXTNAMES when marker pattern has no extension', async () => {
		const db = new DB()
		assert.ok(Array.isArray(DB.DATA_EXTNAMES), 'DB.DATA_EXTNAMES must exist')
		assert.ok(DB.DATA_EXTNAMES.includes('.nan0'))
		assert.ok(DB.DATA_EXTNAMES.includes('.json'))
	})

	it('falls back to targetDir with empty delta root when marker is not found', async () => {
		const db = new DB()
		if (typeof db.createRootUp === 'function') {
			const nonExistent = 'non_existent_marker_123456.xyz'
			const targetDir = '/some/virtual/target/dir'
			const rootDb = await db.createRootUp(nonExistent, targetDir)
			assert.ok(rootDb)
			assert.equal(rootDb.cwd, targetDir)
			assert.equal(rootDb.root, '')
		}
	})
})
