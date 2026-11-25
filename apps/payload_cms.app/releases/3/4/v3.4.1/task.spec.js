import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createT } from '@nan0web/i18n'
import DB from '@nan0web/db'
import { isThumbnail } from '../../../../src/domain/utils/mediaUtils.js'
import { MediaVerifyModel } from '../../../../src/domain/models/MediaVerifyModel.js'

describe('Release v3.4.1: isThumbnail & MediaVerifyModel uk report', () => {
	describe('isThumbnail', () => {
		it('does not filter out real files with _small, _medium, _large or _WxH suffixes', () => {
			assert.equal(isThumbnail('public/news/Zachekaj-ne-znimaj_Visa_Site_small.webp'), false)
			assert.equal(isThumbnail('public/promo/_BILSHE_Priceless_WineTasting_Site_600x600.webp'), false)
			assert.equal(isThumbnail('public/banners/Game_banner_1920x1080.gif'), false)
			assert.equal(isThumbnail('hero_medium.jpg'), false)
			assert.equal(isThumbnail('card-large.png'), false)
		})

		it('filters out thumbnail directories, @-prefixes and thumb/mini/preview suffixes', () => {
			assert.equal(isThumbnail('public/thumbs/photo.jpg'), true)
			assert.equal(isThumbnail('public/cache/banner.webp'), true)
			assert.equal(isThumbnail('public/thumbnails/a.png'), true)
			assert.equal(isThumbnail('photo@2x.jpg'), true)
			assert.equal(isThumbnail('photo@thumb.webp'), true)
			assert.equal(isThumbnail('photo_thumb.jpg'), true)
			assert.equal(isThumbnail('photo-thumbnail.webp'), true)
			assert.equal(isThumbnail('photo_mini.png'), true)
			assert.equal(isThumbnail('photo-preview.jpg'), true)
		})
	})

	describe('MediaVerifyModel.generateMarkdownReport locale: uk', () => {
		const sampleAudit = {
			dbMediaCount: 10,
			dbFolderCount: 3,
			diskFilesCount: 10,
			missingInDb: [],
			missingOnDisk: [],
			nonImageFilesCorrupted: [],
			mimeAnomalies: [],
			folderMisalignments: [],
			unassignedFolders: [],
			extCount: { '.webp': 8, '.pdf': 2 },
		}

		it('generates report in Ukrainian when t from db/i18n is provided', async () => {
			const db = new DB()
			await db.connect()
			await db.set('uk/_/t', {
				'Payload CMS Media & Asset Integrity Audit Report': 'Звіт аудиту цілісності медіа та активів Payload CMS',
				'1. Executive Summary': '1. Зведена статистика',
				'Metric': 'Метрика',
				'Count': 'Кількість',
				'Status': 'Статус',
				'Total Media in Database': 'Усього медіа в базі даних',
				'2. File Extension Distribution in Database': '2. Розподіл розширень файлів у базі даних',
				'3. Deep Verification Details': '3. Деталі глибокої перевірки',
				'3.1 Mimetype Integrity Check': '3.1 Перевірка цілісності MIME-типів',
				'3.2 Missing Files Audit': '3.2 Аудит відсутніх файлів',
				'3.3 Folder Hierarchy Alignment Check': '3.3 Перевірка відповідності ієрархії тек',
			})
			const vocab = await db.get('uk/_/t')
			const t = createT(vocab, 'uk')
			const model = new MediaVerifyModel({}, { db, t })
			const md = model.generateMarkdownReport(sampleAudit, { locale: 'uk', t })

			assert.ok(md.includes('Звіт аудиту цілісності медіа та активів Payload CMS'), 'Should translate default title')
			assert.ok(md.includes('1. Зведена статистика'), 'Should translate Executive Summary')
			assert.ok(md.includes('| Метрика | Кількість | Статус |'), 'Should translate summary table headers')
			assert.ok(md.includes('**Усього медіа в базі даних**'), 'Should translate metric labels')
			assert.ok(md.includes('2. Розподіл розширень файлів у базі даних'), 'Should translate extension distribution section')
			assert.ok(md.includes('3. Деталі глибокої перевірки'), 'Should translate deep verification details')
			assert.ok(md.includes('3.1 Перевірка цілісності MIME-типів'), 'Should translate subsection 3.1')
			assert.ok(md.includes('3.2 Аудит відсутніх файлів'), 'Should translate subsection 3.2')
			assert.ok(md.includes('3.3 Перевірка відповідності ієрархії тек'), 'Should translate subsection 3.3')
		})

		it('keeps English report by default when locale is omitted', () => {
			const model = new MediaVerifyModel()
			const md = model.generateMarkdownReport(sampleAudit)

			assert.ok(md.includes('Payload CMS Media & Asset Integrity Audit Report'))
			assert.ok(md.includes('1. Executive Summary'))
			assert.ok(md.includes('| Metric | Count | Status |'))
		})
	})
})
