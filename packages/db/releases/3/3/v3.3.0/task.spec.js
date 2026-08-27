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

	describe('db.route(uri, ext) Contract', () => {
		it('resolves root index to / with default Directory.INDEX = index', () => {
			const db = new DB()
			assert.equal(db.route('index.md'), '/')
			assert.equal(db.route('index.yaml'), '/')
			assert.equal(db.route('index.json'), '/')
			assert.equal(db.route('/index.md'), '/')
			assert.equal(db.route('index'), '/')
		})

		it('resolves README.md depending on Directory.INDEX', () => {
			const db = new DB()
			assert.equal(db.route('README.md'), '/README')

			class ReadmeDB extends DB {
				static Directory = class extends DB.Directory {
					static INDEX = 'README'
				}
			}
			const readmeDb = new ReadmeDB()
			assert.equal(readmeDb.route('README.md'), '/')
			assert.equal(readmeDb.route('index.md'), '/index')
		})

		it('resolves nested documents without extensions', () => {
			const db = new DB()
			assert.equal(db.route('en/docs/architecture.yaml'), '/en/docs/architecture')
			assert.equal(db.route('/en/docs/architecture.yaml'), '/en/docs/architecture')
			assert.equal(db.route('en/docs/index.md'), '/en/docs/')
			assert.equal(db.route('en/docs/'), '/en/docs/')
		})

		it('applies custom extension with or without leading dot', () => {
			const db = new DB()
			assert.equal(db.route('en/docs/architecture.yaml', 'html'), '/en/docs/architecture.html')
			assert.equal(db.route('en/docs/architecture.yaml', '.html'), '/en/docs/architecture.html')
			assert.equal(db.route('en/docs/architecture.yaml', 'json'), '/en/docs/architecture.json')
			assert.equal(db.route('en/docs/architecture.yaml', '.json'), '/en/docs/architecture.json')
		})

		it('applies custom extension to index files', () => {
			const db = new DB()
			assert.equal(db.route('index.md', 'html'), '/index.html')
			assert.equal(db.route('index.md', '.html'), '/index.html')
			assert.equal(db.route('en/docs/index.md', 'html'), '/en/docs/index.html')
			assert.equal(db.route('en/docs/index.md', '.html'), '/en/docs/index.html')
		})

		it('returns false for directory configs, globals, or unsupported file extensions', () => {
			const db = new DB()
			assert.strictEqual(db.route('_.nan0'), false)
			assert.strictEqual(db.route('/_.nan0'), false)
			assert.strictEqual(db.route('_.json'), false)
			assert.strictEqual(db.route('en/_.yaml'), false)
			assert.strictEqual(db.route('_/analytics.yaml'), false)
			assert.strictEqual(db.route('/_/analytics.yaml'), false)
			assert.strictEqual(db.route('_/t.yaml'), false)
			assert.strictEqual(db.route('/_/t.yaml'), false)
			assert.strictEqual(db.route('en/_/langs.json'), false)
			assert.strictEqual(db.route('image.png'), false)
			assert.strictEqual(db.route('archive.zip'), false)
		})
	})
})
