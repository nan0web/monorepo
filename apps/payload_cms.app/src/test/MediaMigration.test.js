import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createT } from '@nan0web/i18n'
import {
	getMimeType,
	sanitizeFilename,
	isThumbnail,
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

		it('should only skip real thumbnails and preserve _small/_medium/_large/_WxH originals', () => {
			assert.strictEqual(isThumbnail('Zachekaj-ne-znimaj_Visa_Site_small.webp'), false)
			assert.strictEqual(isThumbnail('_BILSHE_Priceless_WineTasting_Site_600x600.webp'), false)
			assert.strictEqual(isThumbnail('Game_banner_1920x1080.gif'), false)
			assert.strictEqual(isThumbnail('thumbs/photo.jpg'), true)
			assert.strictEqual(isThumbnail('photo@2x.jpg'), true)
			assert.strictEqual(isThumbnail('photo_thumb.jpg'), true)
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

		it('should generate Ukrainian markdown report via i18n t() when provided', () => {
			const t = createT({
				'1. Executive Summary': '1. Зведена статистика',
				'Total Media in Database': 'Усього медіа в базі даних',
			}, 'uk')
			const model = new MediaVerifyModel({}, { t })
			const md = model.generateMarkdownReport(
				{
					dbMediaCount: 5,
					dbFolderCount: 2,
					diskFilesCount: 5,
					missingInDb: [],
					missingOnDisk: [],
					nonImageFilesCorrupted: [],
					mimeAnomalies: [],
					folderMisalignments: [],
					unassignedFolders: [],
					extCount: { '.webp': 5 },
				},
				{ locale: 'uk', t }
			)
			assert.ok(md.includes('1. Зведена статистика'))
			assert.ok(md.includes('**Усього медіа в базі даних**'))
		})
	})
})
