import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import DB from '@nan0web/db'
import DBFS from '../../../../../DBFS.js'

describe('DBFS v3.6.4 — DBFSDoc.saveFile() error handling & cache invalidation', () => {
	let root
	let db

	beforeEach(async () => {
		root = mkdtempSync(join(tmpdir(), 'nan0web-dbfs-v364-'))
		db = new DBFS({ root })
		await db.connect()
	})

	afterEach(() => {
		rmSync(root, { recursive: true, force: true })
	})

	it('returns true after successful binary write even if post-save cache invalidation or listener throws', async () => {
		const buf = Buffer.from('PDF-binary-payload-12345')
		db._invalidateDataCache = () => {
			throw new TypeError("Cannot read properties of undefined (reading 'clear')")
		}
		db.on('change', () => {
			throw new Error('Listener error')
		})

		const saved = await db.saveFile('media/Statut.pdf', buf)
		assert.equal(saved, true, 'saveFile() має повернути true після успішного запису на диск')
		const diskPath = join(root, 'media/Statut.pdf')
		assert.equal(existsSync(diskPath), true)
		assert.deepEqual(readFileSync(diskPath), buf)
	})

	it('logs error and returns false when FS.writeFile fails', async () => {
		const origFS = db.constructor.FS
		const errors = []
		const mockConsole = {
			debug: () => {},
			info: () => {},
			warn: () => {},
			error: (...args) => errors.push(args),
		}
		class FailingFS extends origFS {
			static async writeFile() {
				throw new Error('EACCES: permission denied')
			}
		}
		class FailingDBFS extends DBFS {
			static FS = FailingFS
		}
		const failingDb = new FailingDBFS({ root, console: mockConsole })
		await failingDb.connect()

		const saved = await failingDb.saveFile('media/fail.pdf', Buffer.from('abc'))
		assert.equal(saved, false)
		assert.ok(errors.length > 0, 'Помилка запису має логуватися через this.console.error')
	})

	it('handles missing _fetchCache / _inheritanceCache in _invalidateDataCache safely', () => {
		db._fetchCache = undefined
		db._inheritanceCache = undefined
		assert.doesNotThrow(() => {
			db._invalidateDataCache('media/test.pdf')
		})
	})

	it('saves binary Buffer through DB.mount to mounted DBFS and returns true', async () => {
		const parentDb = new DB()
		await parentDb.connect()
		parentDb.mount('media', db)

		const payload = Buffer.alloc(1024, 0x42)
		const saved = await parentDb.saveFile('media/doc.bin', payload)
		assert.equal(saved, true)

		const diskPath = join(root, 'doc.bin')
		assert.equal(existsSync(diskPath), true)
		assert.deepEqual(readFileSync(diskPath), payload)
	})
})
