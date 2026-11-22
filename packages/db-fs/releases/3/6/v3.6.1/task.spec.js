import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import DBFS, { DBFSDoc } from '../../../../src/index.js'

describe('Release v3.6.1 Contract: Binary Safe Reading & loadBinary (@nan0web/db-fs)', () => {
	const tmpDir = path.resolve('.', '.tmp-test-3.6.1')
	const mountDir = path.resolve(tmpDir, 'mounted')

	const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0x00, 0xfe])
	const jpgBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46])
	const webpBytes = Buffer.from([0x52, 0x49, 0x46, 0x46, 0xff, 0xfe, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
	const pdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3])
	const xlsxBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00, 0xff, 0xfe])

	before(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
		fs.mkdirSync(tmpDir, { recursive: true })
		fs.mkdirSync(mountDir, { recursive: true })
	})

	after(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
	})

	describe('§1 DBFSDoc.BINARY_EXTNAMES & loadDocumentAs', () => {
		it('1.1 exposes static BINARY_EXTNAMES with common binary formats', () => {
			assert.ok(Array.isArray(DBFSDoc.BINARY_EXTNAMES))
			for (const ext of ['.png', '.jpg', '.webp', '.pdf', '.xlsx']) {
				assert.ok(DBFSDoc.BINARY_EXTNAMES.includes(ext), `Missing ${ext} in BINARY_EXTNAMES`)
			}
			assert.ok(!DBFSDoc.BINARY_EXTNAMES.includes('.svg'), '.svg must remain text/XML')
		})

		it('1.2 preserves exact magic bytes when loading .png, .jpg, .webp, .pdf, .xlsx via loadDocument', async () => {
			const db = new DBFS({ root: tmpDir })
			const samples = [
				['assets/logo.png', pngBytes],
				['assets/photo.jpg', jpgBytes],
				['assets/banner.webp', webpBytes],
				['docs/report.pdf', pdfBytes],
				['docs/sheet.xlsx', xlsxBytes],
			]

			for (const [uri, expected] of samples) {
				await db.saveDocument(uri, expected)
				const loaded = await db.loadDocument(uri)
				assert.ok(Buffer.isBuffer(loaded), `${uri} must return a Buffer`)
				assert.equal(Buffer.compare(loaded, expected), 0, `${uri} magic bytes must match exactly`)
			}
		})

		it('1.3 handles uppercase binary extensions case-insensitively (.PNG, .PDF)', async () => {
			const db = new DBFS({ root: tmpDir })
			await db.saveDocument('assets/UPPER.PNG', pngBytes)
			const loaded = await db.loadDocument('assets/UPPER.PNG')
			assert.ok(Buffer.isBuffer(loaded))
			assert.equal(Buffer.compare(loaded, pngBytes), 0)
		})

		it('1.4 continues loading text documents (.txt, .json, .svg) as strings/objects', async () => {
			const db = new DBFS({ root: tmpDir })
			await db.saveDocument('notes/hello.txt', 'Привіт, мІр!')
			await db.saveDocument('notes/icon.svg', '<svg><circle r="1"/></svg>')
			await db.saveDocument('notes/data.json', { ok: true })

			assert.equal(await db.loadDocument('notes/hello.txt'), 'Привіт, мІр!')
			assert.equal(await db.loadDocument('notes/icon.svg'), '<svg><circle r="1"/></svg>')
			assert.deepEqual(await db.loadDocument('notes/data.json'), { ok: true })
		})
	})

	describe('§2 DBFSDoc.prototype.loadBinary', () => {
		it('2.1 loads any file as Buffer including custom/unknown extensions', async () => {
			const db = new DBFS({ root: tmpDir })
			const rawBytes = Buffer.from([0x00, 0xff, 0x80, 0xfe, 0x01])
			await db.saveFile('raw/blob.custombin', rawBytes)

			const loaded = await db.loadBinary('raw/blob.custombin')
			assert.ok(Buffer.isBuffer(loaded))
			assert.equal(Buffer.compare(loaded, rawBytes), 0)
		})

		it('2.2 returns defaultValue when binary file does not exist', async () => {
			const db = new DBFS({ root: tmpDir })
			assert.equal(await db.loadBinary('missing/file.png'), undefined)
			assert.equal(await db.loadBinary('missing/file.png', null), null)
		})

		it('2.3 enforces access checks via ensureAccess(uri, "r")', async () => {
			const db = new DBFS({ root: tmpDir })
			let checked = null
			db.ensureAccess = async (uri, level) => {
				checked = { uri, level }
				throw new Error('Access denied')
			}
			await assert.rejects(() => db.loadBinary('secret/file.png'), /Access denied/)
			assert.deepEqual(checked, { uri: 'secret/file.png', level: 'r' })
		})

		it('2.4 delegates loadBinary through mounted databases', async () => {
			const parentDb = new DBFS({ root: tmpDir })
			const childDb = new DBFS({ root: mountDir })
			parentDb.mount('ext', childDb)

			await childDb.saveFile('sample.png', pngBytes)
			const loaded = await parentDb.loadBinary('ext/sample.png')
			assert.ok(Buffer.isBuffer(loaded))
			assert.equal(Buffer.compare(loaded, pngBytes), 0)
		})
	})
})
