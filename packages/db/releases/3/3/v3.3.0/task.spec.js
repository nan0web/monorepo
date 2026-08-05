import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '../../../../src/index.js'

describe('Release v3.3.0: @nan0web/db Public Uploads & Metadata Contract', () => {
	it('DB isolates binary upload paths into public/uploads and retains textual metadata', async () => {
		const db = new DB({ memory: true })
		await db.connect()

		const metadata = {
			title: 'User Manual',
			url: '/uploads/manual.pdf',
			filename: 'manual.pdf',
			mimeType: 'application/pdf',
			filesize: 102456,
		}

		await db.set('attachments/manual', metadata)
		const saved = await db.get('attachments/manual')

		assert.equal(saved.url, '/uploads/manual.pdf')
		assert.equal(saved.mimeType, 'application/pdf')
		assert.equal(saved.filename, 'manual.pdf')
	})
})
