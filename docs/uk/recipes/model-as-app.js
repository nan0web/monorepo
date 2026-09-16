#!/usr/bin/env node
/**
 * @file Живий виконуваний рецепт OLMUI Model-as-App з використанням $db та TDD First.
 * Можна запускати прямо через node: node docs/uk/recipes/model-as-app.js
 */
import assert from 'node:assert/strict'
import { ModelAsApp, result, show, progress } from '@nan0web/ui'
import DB from '@nan0web/db'

/**
 * Приклад консольної підкоманди: Резервне копіювання / обробка каталогу.
 */
export class BackupCatalogCommand extends ModelAsApp {
	static alias = 'backup'

	static UI = {
		title: 'Каталог резервного копіювання',
		starting: 'Початок створення бекапу для {$dir}...',
		completed: 'Бекап успішно збережено у {$out}',
		errorNoDb: 'База даних ($db) є обовʼязковою для команди {alias}',
	}

	static dir = {
		help: 'Каталог для обробки',
		default: 'releases',
		positional: true,
	}

	static out = {
		help: 'Файл виводу',
		default: 'backup.json',
		alias: 'o',
	}

	/**
	 * @param {Partial<BackupCatalogCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dir = String(data.dir || 'releases')
		/** @type {string} */ this.out = String(data.out || 'backup.json')
	}

	async *run() {
		const { t } = this._

		// 1. Повідомлення про прогрес
		yield progress(t(BackupCatalogCommand.UI.starting, { dir: this.dir }))

		// 2. Безпечна робота зі шляхами та файлами через this.$db (без node:fs та node:path!)
		const targetPath = this.$db.resolveSync(this.dir, 'README.md')
		const readmeContent = (await this.$db.loadDocument(targetPath, null)) || ''

		// 3. Збереження результату через this.$db
		const backupData = {
			sourceDir: this.dir,
			readme: readmeContent,
			createdAt: new Date().toISOString(),
		}
		await this.$db.saveDocument(this.out, backupData)

		// 4. Повідомлення про успіх
		yield show(t(BackupCatalogCommand.UI.completed, { out: this.out }), 'success')

		return result({
			ok: true,
			out: this.out,
			data: backupData,
		})
	}
}

// ─── Демонстраційний запуск (Self-Executable Validation) ───
async function runDemo() {
	// 1. Створюємо In-Memory базу даних
	const db = new DB({
		predefined: [
			['releases/README.md', '# Каталог релізів платформи'],
		],
	})
	await db.connect()

	// 2. Ініціалізуємо команду з передачею db та t
	const cmd = new BackupCatalogCommand(
		{ dir: 'releases', out: 'releases-backup.json' },
		{ db }
	)

	// 3. Виконуємо генератор і збираємо інтенції
	const gen = cmd.run()
	let step = await gen.next()
	const intents = []
	while (!step.done) {
		intents.push(step.value)
		step = await gen.next()
	}

	const finalResult = step.value?.data || step.value
	assert.equal(finalResult.ok, true, 'Рецепт має успішно виконуватися')
	assert.equal(finalResult.out, 'releases-backup.json')

	// Перевіряємо що документ з'явився в DB
	const savedDoc = await db.loadDocument('releases-backup.json')
	assert.equal(savedDoc.sourceDir, 'releases')
	assert.ok(savedDoc.readme.includes('Каталог релізів'))

	console.log('✅ Рецепт успішно перевірено та запущено! Результат:', finalResult)
}

// Якщо запущено безпосередньо через node
if (process.argv[1]?.endsWith('model-as-app.js')) {
	runDemo().catch((err) => {
		console.error('❌ Помилка виконання рецепта:', err)
		process.exit(1)
	})
}
