import process from 'node:process'
import DB from '@nan0web/db-fs'
import { Theme, NightTheme, getUserTheme } from '@nan0web/ui'
import ThemeSwitcherApp from '../App.js'
import Logger from '@nan0web/log'

async function main(argv = []) {
	const console = new Logger(Logger.detectLevel(argv))
	const db = new DB()
	await db.connect()

	let theme = Theme
	const setTheme = (newTheme) => {
		theme = newTheme
	}

	const app = new ThemeSwitcherApp({
		// @ts-ignore find out the issue with the #private in DB.
		db,
		theme,
		setTheme,
		locale: 'uk',
	})

	const result = await app.run()
	console.info(`Theme switcher UI: ${JSON.stringify(result, null, 2)}`)

	// Симулюємо клік
	await app.actions.themeToggle()
	console.info(`Theme switched to: ${theme === NightTheme ? 'Night' : 'Light'}`)
}

main(process.argv.slice(2)).catch((err) => {
	console.error(err)
	process.exit(1)
})
