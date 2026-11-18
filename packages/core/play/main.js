import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import DB from '@nan0web/db'
import { NaN0WebConfig } from '../src/index.js'

const layersData = {
	'@system/nan0web': {
		port: 3000,
		locale: 'en',
		theme: 'auto',
		steps: {
			intent: { maxCriteria: 5 },
			build: { types: true },
			inspect: { strict: false },
		},
	},
	'@root/nan0web': {
		locale: 'uk',
		theme: 'dark',
		steps: {
			inspect: { strict: true },
		},
	},
	'@app/nan0web': {
		appName: 'my-nan0-app',
		port: 8080,
		steps: {
			intent: { maxCriteria: 3 },
		},
	},
}

async function runTour() {
	const db = new DB()
	db.mount('@system', new DB())
	db.mount('@root', new DB())
	db.mount('@app', new DB())
	for (const [uri, data] of Object.entries(layersData)) {
		await db.saveDocument(uri, data)
	}

	console.log('\n=== @nan0web/core v3.5.0 — NaN0WebConfig Release Tour ===\n')

	const config = await NaN0WebConfig.load(db)
	console.log('1. Каскадне злиття (@system -> @root -> @app):')
	console.log({
		appName: config.appName,
		port: config.port,
		locale: config.locale,
		theme: config.theme,
		intentMaxCriteria: config.steps.intent.maxCriteria,
		inspectStrict: config.steps.inspect.strict,
	})

	if (!process.stdin.isTTY) {
		console.log('\n(Non-TTY режим: пропускаємо інтерактивний ввід)')
		return
	}

	const rl = readline.createInterface({ input, output })
	try {
		const raw = await rl.question('\nВведіть нове значення intent.maxCriteria (1..7, напр. 10 для перевірки помилки): ')
		const num = Number(raw)
		const testConfig = new NaN0WebConfig({
			...config,
			steps: { ...config.steps, intent: { maxCriteria: num } },
		})
		console.log('Результат валідації: OK ->', testConfig.steps.intent.maxCriteria)
	} catch (err) {
		console.error('Помилка валідації:', err.message)
	} finally {
		rl.close()
	}
}

runTour().catch((err) => {
	console.error(err)
	process.exit(1)
})
