#!/usr/bin/env node
/**
 * @file Тест та верифікація рецепту Zero-FS & $db Standard (docs/uk/recipes/db-zero-fs.md).
 * Запуск: pnpm --filter @nan0web/db-fs test (або node docs/uk/recipes/db-zero-fs.test.js)
 */
import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { ModelAsApp, progress, show, result } from '@nan0web/ui'
import DB from '@nan0web/db'
import { createT } from '@nan0web/i18n'

/**
 * Еталонна консольна підкоманда відповідно до OLMUI та Model-as-App
 */
export class SeedOfficesCommand extends ModelAsApp {
	static $alias = 'seed'

	static UI = {
		title: 'Bank offices synchronization',
		starting: 'Checking and loading {path}...',
		completed: 'Successfully processed {count} offices',
		errorNotFound: 'Document {path} not found in database',
		errorNoDb: 'Database instance ($db) is required',
	}

	static path = {
		help: 'Path to the offices database document',
		default: 'offices',
		positional: true,
	}

	/**
	 * @param {Partial<SeedOfficesCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to the offices database document */ this.path
	}

	/**
	 * Run the offices seeding command logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, void>}
	 */
	async *run() {
		const { t } = this._
		const db = this.$db

		// 1. Сповіщення про початок операції
		yield progress(t(SeedOfficesCommand.UI.starting, { path: this.path }))

		// 2. Безпечне читання БЕЗ обов'язкового розширення (auto fallback: .yaml, .nan0, .json, та інші DATA_EXTNAMES)
		const doc = (await db.fetch(this.path)) ?? {}
		if (!doc.offices) {
			yield show(t(SeedOfficesCommand.UI.errorNotFound, { path: this.path }), 'error')
			return result({
				ok: false,
				count: 0,
				error: SeedOfficesCommand.UI.errorNotFound,
			})
		}

		// 3. Модифікація та збереження
		const list = Array.isArray(doc.offices) ? doc.offices : [doc.offices]
		const targetUri = db.extname(this.path) ? this.path : `${this.path}.yaml`
		await db.saveDocument(targetUri, list)

		// 4. Сповіщення про успіх
		yield show(t(SeedOfficesCommand.UI.completed, { count: list.length }), 'success')

		return result({
			ok: true,
			count: list.length,
			path: targetUri,
		})
	}
}

describe('Рецепт db-zero-fs: OLMUI Model-as-App та In-Memory DB', () => {
	it('працює без розширення файлу (extension-less) через loadDocument', async () => {
		const sampleData = [
			{ id: '001', name: 'Головний офіс', city: 'Київ' },
			{ id: '002', name: 'Відділення №2', city: 'Львів' },
		]

		// Створюємо In-Memory базу з розширенням .yaml та словником перекладів у _/t.yaml
		const db = new DB({
			predefined: [
				[
					'_/t.yaml',
					{
						'Bank offices synchronization': 'Синхронізація банківських відділень',
						'Checking and loading {path}...': 'Перевірка та завантаження {path}...',
						'Successfully processed {count} offices': 'Успішно оброблено {count} відділень',
						'Document {path} not found in database': 'Документ {path} не знайдено в базі',
					},
				],
				['offices.yaml', { offices: sampleData, title: 'Offices' }],
			],
		})
		await db.connect()

		// Отримуємо глобальний словник перекладів для шляху 'offices' в документі
		const doc = await db.fetch('offices')
		const t = createT(doc.t)

		// Передаємо команду з базою та функцією перекладу
		const cmd = new SeedOfficesCommand({}, { db, t })

		/** @type {Array<import('@nan0web/ui').ProgressIntent | import('@nan0web/ui').ShowIntent>} */
		const intents = []
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			intents.push(/** @type {any} */ (step.value))
			step = await gen.next()
		}

		// Перевіряємо згенеровані Intent об'єкти (progress -> show)
		assert.equal(doc.title, 'Offices')
		assert.equal(intents.length, 2)
		assert.equal(intents[0].type, 'progress')
		assert.equal(intents[0].message, 'Перевірка та завантаження offices...')
		assert.equal(intents[1].type, 'show')
		assert.equal(/** @type {import('@nan0web/ui').ShowIntent} */ (intents[1]).level, 'success')
		assert.equal(intents[1].message, 'Успішно оброблено 2 відділень')

		// Перевіряємо фінальний результат через result(...)
		const res = step.value?.data || step.value
		assert.equal(res.ok, true)
		assert.equal(res.count, 2)
		assert.equal(res.path, 'offices.yaml')

		// Перевіряємо що документ збережено в БД
		const loaded = await db.loadDocument('offices.yaml')
		assert.equal(loaded.length, 2)
		assert.equal(loaded[0].name, 'Головний офіс')
	})

	it('коректно повертає show(error) та result(ok: false) коли документ відсутній', async () => {
		const db = new DB({
			predefined: [
				[
					'_/t.yaml',
					{
						'Checking and loading {path}...': 'Перевірка та завантаження {path}...',
						'Document {path} not found in database': 'Документ {path} не знайдено в базі',
					},
				],
			],
		})
		await db.connect()

		const globals = await db.getGlobals('missing/path')
		const t = createT(globals.t)

		const cmd = new SeedOfficesCommand({ path: 'missing/path' }, { db, t })

		/** @type {Array<import('@nan0web/ui').ProgressIntent | import('@nan0web/ui').ShowIntent>} */
		const intents = []
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			intents.push(/** @type {any} */ (step.value))
			step = await gen.next()
		}

		assert.equal(intents.length, 2)
		assert.equal(intents[0].message, 'Перевірка та завантаження missing/path...')
		assert.equal(intents[1].type, 'show')
		assert.equal(/** @type {import('@nan0web/ui').ShowIntent} */ (intents[1]).level, 'error')
		assert.equal(intents[1].message, 'Документ missing/path не знайдено в базі')

		const res = step.value?.data || step.value
		assert.equal(res.ok, false)
		assert.equal(res.count, 0)
		assert.equal(res.error, SeedOfficesCommand.UI.errorNotFound)
	})
})
