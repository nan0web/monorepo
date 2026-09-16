import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import DB from '@nan0web/db'
import DBFS, {
	DBFSBase,
	DBFSPath,
	DBFSDoc,
	DBFSDir,
	DBFSStream,
} from '../../../../../DBFS/index.js'

describe('Release v3.4.0 Contract: DBFS Layered Parts Chain (@nan0web/db-fs)', () => {
	const tmpDir = path.resolve('.', '.tmp-test-3.4.0')

	before(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
		fs.mkdirSync(tmpDir, { recursive: true })
	})

	after(() => {
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		}
	})

	describe('1. Inheritance & Layer Chain Verification', () => {
		it('1.1 verifies complete prototype inheritance hierarchy', () => {
			const db = new DBFS({ root: tmpDir })

			assert.ok(db instanceof DBFS, 'Must be instance of DBFS')
			assert.ok(db instanceof DBFSStream, 'Must be instance of DBFSStream')
			assert.ok(db instanceof DBFSDir, 'Must be instance of DBFSDir')
			assert.ok(db instanceof DBFSDoc, 'Must be instance of DBFSDoc')
			assert.ok(db instanceof DBFSPath, 'Must be instance of DBFSPath')
			assert.ok(db instanceof DBFSBase, 'Must be instance of DBFSBase')
			assert.ok(db instanceof DB, 'Must be instance of DB (@nan0web/db)')
		})

		it('1.2 verifies static bindings and factory methods', () => {
			assert.ok(DBFS.FS, 'DBFS.FS must be defined')
			assert.ok(DBFS.Driver, 'DBFS.Driver must be defined')
			assert.equal(typeof DBFS.from, 'function', 'DBFS.from must be a function')
			assert.equal(typeof DBFS.winFix, 'function', 'DBFS.winFix must be a function')

			const instance1 = new DBFS({ root: tmpDir })
			const instance2 = DBFS.from(instance1)
			assert.strictEqual(instance1, instance2, 'DBFS.from must return existing DBFS instance')

			const instance3 = DBFS.from({ root: tmpDir })
			assert.ok(instance3 instanceof DBFS, 'DBFS.from must construct DBFS from options')
		})
	})

	describe('2. Layer Functional Verification', () => {
		it('2.1 DBFSBase format registration (.jsonl, .md, .yaml, .csv, .nan0)', async () => {
			const db = new DBFS({ root: tmpDir })

			// Save and load Markdown
			await db.saveDocument('test.md', '# Hello DBFS')
			const mdDoc = await db.loadDocument('test.md')
			assert.equal(String(mdDoc).trim(), '# Hello DBFS')

			// Save and load YAML
			await db.saveDocument('test.yaml', { title: 'Layered DBFS', version: '3.4.0' })
			const yamlDoc = await db.loadDocument('test.yaml')
			assert.deepEqual(yamlDoc, { title: 'Layered DBFS', version: '3.4.0' })

			// Save and load JSONL
			await db.saveDocument('items.jsonl', [{ id: 1 }, { id: 2 }])
			const jsonlDoc = await db.loadDocument('items.jsonl')
			assert.deepEqual(jsonlDoc, [{ id: 1 }, { id: 2 }])
		})

		it('2.2 DBFSPath resolution and location', () => {
			const db = new DBFS({ root: tmpDir })

			const loc = db.location('sub/file.txt')
			assert.equal(loc, path.resolve(tmpDir, 'sub/file.txt'))

			const rel = db.relative(path.resolve(tmpDir, 'sub/file.txt'))
			assert.equal(rel.replaceAll('\\', '/'), 'sub/file.txt')
		})

		it('2.3 DBFSDoc save, load, stat, and drop', async () => {
			const db = new DBFS({ root: tmpDir })

			await db.saveFile('raw.txt', 'Raw text content')
			const stat = await db.statDocument('raw.txt')
			assert.ok(stat.exists)
			assert.ok(stat.isFile)

			const content = await db.loadDocumentAs('.txt', 'raw.txt')
			assert.equal(content, 'Raw text content')

			const dropped = await db.dropDocument('raw.txt')
			assert.ok(dropped)
			const afterStat = await db.statDocument('raw.txt')
			assert.equal(afterStat.exists, false)
		})

		it('2.4 DBFSDir listing and locale detection', async () => {
			const db = new DBFS({ root: tmpDir })

			// Create locale directories
			await db.saveDocument('en/index.md', '# English')
			await db.saveDocument('uk/index.md', '# Ukrainian')

			const locales = await db.detectLocales()
			assert.ok(locales.some((l) => l.locale === 'en'))
			assert.ok(locales.some((l) => l.locale === 'uk'))

			const entries = await db.listDir('')
			assert.ok(entries.length >= 2)
		})
	})
})
