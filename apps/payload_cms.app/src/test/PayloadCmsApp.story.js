import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { Model } from '@nan0web/types'
import { runGenerator } from '@nan0web/ui-cli'
import { PayloadCmsApp } from '../domain/app/PayloadCmsApp.js'
import { TransformModel } from '../domain/models/TransformModel.js'

// ─── Mock Model for Testing ───
/**
 * Test Article model
 * @alias CMS:News
 * @alias Plural:News
 */
class TestArticle extends Model {
	static UI = {
		$singular: 'News Article',
		$plural: 'News Articles',
	}

	static title = {
		help: 'Article title',
		default: '',
		localized: true,
	}

	static score = {
		help: 'Score',
		default: 0,
	}
}

describe('PayloadCmsApp User Stories', () => {
	it('Story: PayloadCmsApp generates help output correctly', async () => {
		const db = new DB({ memory: true })
		const app = new PayloadCmsApp({}, { db })
		const help = app.generateHelp()

		assert.ok(help.includes('Payload CMS Bridge & Generator'))
		assert.ok(help.includes('transform'))
	})

	it('Story: TransformModel converts Model-as-Schema to Payload Collection', async () => {
		class TestArticleModel extends Model {
			static $collection = 'news'
			static UI = {
				$singular: 'News Article',
				$plural: 'News Articles',
			}

			static title = {
				help: 'Article title',
				default: '',
				localized: true,
			}

			static score = {
				help: 'Score',
				default: 0,
			}
		}

		const db = new DB({ predefined: [] })
		const appDb = new DB({
			predefined: [
				[
					'package.json',
					{
						exports: {
							'./domain': { TestArticle: TestArticleModel },
						},
					},
				],
			],
		})
		await appDb.connect()
		db.mount('@app', appDb)
		await db.connect()

		const transform = new TransformModel(
			{
				target: 'src/domain',
				output: 'src/collections',
				force: true,
			},
			{ db }
		)

		// Collect generated intents
		const intents = []
		for await (const intent of transform.run()) {
			intents.push(intent)
		}

		assert.ok(intents.some((i) => i.type === 'show' || i.type === 'progress'))

		// Verify transformed output stored in DB
		const generatedFile = await db.get('@app/src/collections/collections/TestArticle.js') || await db.get('@app/src/collections/TestArticle.js')
		assert.ok(generatedFile, 'Collection file should be generated in DB')
		assert.ok(generatedFile.includes("const collectionSlug = 'news'"), `Expected collectionSlug = 'news' in:\n${generatedFile}`)
		assert.ok(generatedFile.includes('News Article'), `Expected 'News Article' in:\n${generatedFile}`)
		assert.ok(generatedFile.includes('"localized": true'))

		const indexFile = await db.get('@app/src/collections/collections/index.js') || await db.get('@app/src/collections/index.js')
		assert.ok(indexFile, 'Index file should be generated in DB')
		assert.ok(indexFile.includes("export * from './TestArticle.js'"))
	})

	it('Story: TransformModel converts Global Model to Payload GlobalConfig', async () => {
		class SiteConfigModel extends Model {
			static $single = true
			static $collection = 'site_config'
			static UI = {
				$singular: 'Site Settings',
			}

			static siteName = {
				help: 'Site Name',
				default: 'My Site',
				localized: true,
			}
		}

		const db = new DB({ predefined: [] })
		const appDb = new DB({
			predefined: [
				[
					'package.json',
					{
						exports: {
							'./domain': { SiteConfig: SiteConfigModel },
						},
					},
				],
			],
		})
		await appDb.connect()
		db.mount('@app', appDb)
		await db.connect()

		const transform = new TransformModel(
			{
				target: 'src/domain',
				output: 'src/collections',
				force: true,
			},
			{ db }
		)

		for await (const intent of transform.run()) {
			// consume generator
		}

		const generatedGlobal = await db.get('@app/src/collections/globals/SiteConfig.js') || await db.get('@app/src/globals/SiteConfig.js')
		assert.ok(generatedGlobal, 'Global file should be generated in DB')
		assert.ok(generatedGlobal.includes("slug: 'site_config'"))
		assert.ok(generatedGlobal.includes('Site Settings'))

	})

})

