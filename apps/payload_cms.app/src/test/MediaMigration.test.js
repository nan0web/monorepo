import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
	getMimeType,
	sanitizeFilename,
	resolveFolderPath,
	MediaMigrateModel,
	NewsMigrateModel,
	MediaVerifyModel,
} from '../index.js'

describe('PayloadCmsApp Media & Content Models', () => {
	describe('mediaUtils', () => {
		it('should accurately identify file formats', () => {
			assert.strictEqual(getMimeType('image.webp'), 'image/webp')
			assert.strictEqual(getMimeType('doc.pdf'), 'application/pdf')
			assert.strictEqual(getMimeType('table.xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
			assert.strictEqual(getMimeType('archive.zip'), 'application/zip')
		})

		it('should sanitize unsafe filenames', () => {
			assert.strictEqual(sanitizeFilename('my image 2026.png'), 'my_image_2026.png')
			assert.strictEqual(sanitizeFilename('file%20name@test!.pdf'), 'file_name_test_.pdf')
		})

		it('should resolve folder path hierarchy', () => {
			const folderMap = new Map([
				[1, { id: 1, name: 'public', folder: null }],
				[2, { id: 2, name: 'news', folder: 1 }],
				[3, { id: 3, name: '2026', folder: 2 }],
			])

			assert.strictEqual(resolveFolderPath(1, folderMap), 'public')
			assert.strictEqual(resolveFolderPath(2, folderMap), 'public/news')
			assert.strictEqual(resolveFolderPath(3, folderMap), 'public/news/2026')
		})
	})

	describe('NewsMigrateModel', () => {
		it('should transform text to valid Lexical AST format', () => {
			const model = new NewsMigrateModel()
			const lexical = model.toLexicalState('Intro line.\n\nBody content.')

			assert.strictEqual(lexical.root.type, 'root')
			assert.strictEqual(lexical.root.children.length, 2)
			assert.strictEqual(lexical.root.children[0].children[0].text, 'Intro line.')
		})
	})

	describe('MediaVerifyModel', () => {
		it('should report corrupted non-image mimetypes in audit', async () => {
			const mockPayload = {
				find: async ({ collection }) => {
					if (collection === 'media') {
						return {
							docs: [
								{ id: 1, filename: 'corrupted.pdf', mimeType: 'image/webp', sourcePath: 'public/corrupted.pdf' },
								{ id: 2, filename: 'clean.pdf', mimeType: 'application/pdf', sourcePath: 'public/clean.pdf' },
							],
						}
					}
					return { docs: [] }
				},
			}

			const model = new MediaVerifyModel()
			const audit = await model.runAudit(mockPayload, [])

			assert.strictEqual(audit.dbMediaCount, 2)
			assert.strictEqual(audit.nonImageFilesCorrupted.length, 1)
			assert.strictEqual(audit.nonImageFilesCorrupted[0].filename, 'corrupted.pdf')
		})
	})
})
