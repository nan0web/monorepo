import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs'
import DBFS from '../../../../src/index.js'

describe('Release v3.5.1 Contract: Auto-determining File Extensions & NaN0 Frontmatter (@nan0web/db-fs)', () => {
	const tmpDir = path.resolve('.', '.tmp-test-3.5.1')

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

	it('auto-determines extension as .nan0 when saving structured data with fields', async () => {
		const db = new DBFS({ root: tmpDir })
		await db.connect()

		const doc = {
			id: 'assess-sess-101',
			score: 100,
			recommendations: ['Keep practicing'],
			_: { t: () => {}, db: null },
		}

		const saved = await db.saveDocument('assessments/assess-sess-101', doc)
		assert.ok(saved)

		const filePath = path.resolve(tmpDir, 'assessments/assess-sess-101.nan0')
		assert.ok(fs.existsSync(filePath), 'File must be written with .nan0 extension')

		const rawContent = fs.readFileSync(filePath, 'utf-8')
		assert.ok(!rawContent.includes('_:'), 'Internal _ field must not be serialized')
		assert.ok(rawContent.includes('id: assess-sess-101'))

		const loaded = await db.loadDocument('assessments/assess-sess-101')
		assert.equal(loaded.id, 'assess-sess-101')
		assert.equal(loaded.score, 100)

		await db.disconnect()
	})

	it('auto-determines extension as .md with NaN0 frontmatter when content exceeds metadata', async () => {
		const db = new DBFS({ root: tmpDir })
		await db.connect()

		const doc = {
			title: 'Lecture Note',
			content: '# Full Lecture Content\nThis is a long text body that clearly exceeds the length of metadata fields.',
		}

		const saved = await db.saveDocument('notes/note-101', doc)
		assert.ok(saved)

		const filePath = path.resolve(tmpDir, 'notes/note-101.md')
		assert.ok(fs.existsSync(filePath), 'File must be written with .md extension')

		const rawContent = fs.readFileSync(filePath, 'utf-8')
		assert.ok(rawContent.startsWith('---\n'), 'Must start with frontmatter separator')
		assert.ok(rawContent.includes('title: Lecture Note'))
		assert.ok(rawContent.includes('# Full Lecture Content'))

		const loaded = await db.loadDocument('notes/note-101')
		assert.equal(loaded.title, 'Lecture Note')
		assert.ok(loaded.content.includes('Full Lecture Content'))

		await db.disconnect()
	})
})
