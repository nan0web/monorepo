import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import DBFS from '../../../../src/DBFS.js'

describe('DBFS v3.6.3 — DBFSDoc read cache contract', () => {
	let root
	let db

	beforeEach(async () => {
		root = mkdtempSync(join(tmpdir(), 'nan0web-dbfs-v363-'))
		mkdirSync(join(root, '_'), { recursive: true })
		writeFileSync(join(root, '_.yaml'), 'site: Bank\n')
		writeFileSync(join(root, '_/offices.yaml'), '- id: 1\n  city: Kyiv\n')
		db = new DBFS({ root })
		await db.connect()
	})

	afterEach(() => {
		rmSync(root, { recursive: true, force: true })
	})

	it('caches parsed data documents in this.data on loadDocumentAs and invalidates on save/drop', async () => {
		let loadTxtCalls = 0
		const origLoadTxt = db.FS.loadTXT.bind(db.FS)
		db.FS.loadTXT = (...args) => {
			loadTxtCalls++
			return origLoadTxt(...args)
		}

		const first = await db.loadDocumentAs('.yaml', '/_/offices.yaml')
		assert.equal(loadTxtCalls, 1)
		assert.deepEqual(first, [{ id: 1, city: 'Kyiv' }])

		const second = await db.loadDocumentAs('.yaml', '/_/offices.yaml')
		assert.equal(loadTxtCalls, 1, 'Повторне читання має брати дані з this.data без FS.loadTXT')
		assert.deepEqual(second, first)

		await db.saveDocument('/_/offices.yaml', [{ id: 2, city: 'Lviv' }])
		const afterSave = await db.loadDocumentAs('.yaml', '/_/offices.yaml')
		assert.equal(loadTxtCalls, 2, 'Після saveDocument кеш має бути інвалідований')
		assert.deepEqual(afterSave, [{ id: 2, city: 'Lviv' }])

		await db.dropDocument('/_/offices.yaml')
		const afterDrop = await db.loadDocumentAs('.yaml', '/_/offices.yaml', null)
		assert.equal(afterDrop, null)
	})
})
