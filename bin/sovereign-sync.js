import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Sovereign Sync Wizard
 * Backs up the entire ecosystem to an external drive.
 */

async function backup() {
	const source = process.cwd()
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

	// Пошук зовнішнього диску (приклади шляхів)
	const backupBase = process.env.BACKUP_PATH || '/Volumes/SOVEREIGN_DRIVE/backups/nan.web'

	if (!fs.existsSync(path.dirname(backupBase))) {
		console.error(`❌ Зовнішній диск не знайдено за шляхом: ${backupBase}`)
		console.log('💡 Підключіть диск або вкажіть шлях через BACKUP_PATH=.env')
		return
	}

	if (!fs.existsSync(backupBase)) fs.mkdirSync(backupBase, { recursive: true })

	console.log(`📡 Починаю синхронізацію: ${source} -> ${backupBase}`)

	try {
		// Використовуємо rsync для ефективного бекапу (тільки зміни)
		// --exclude node_modules - щоб не копіювати гігабайти сміття
		// --delete - щоб видаляти те, чого більше немає в джерелі
		execSync(
			`rsync -av --progress --delete \
			--exclude 'node_modules' \
			--exclude '.git' \
			--exclude '.next' \
			--exclude 'dist' \
			"${source}/" "${backupBase}/latest/"`,
			{ stdio: 'inherit' },
		)

		console.log(`\n✅ Бекап завершено успішно!`)
		console.log(`📂 Копія знаходиться тут: ${backupBase}/latest/`)
	} catch (error) {
		console.error('❌ Помилка під час синхронізації:', error.message)
	}
}

backup()
