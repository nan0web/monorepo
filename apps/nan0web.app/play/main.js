#!/usr/bin/env node

import { AppRunner, NaN0WebConfig } from '../src/runner.js'
import { SSRServer } from '../src/server/index.js'
import { ShellModel } from '@nan0web/ui'
import { runGenerator, CLiInputAdapter } from '@nan0web/ui-cli'
import { DBwithFSDriver } from '@nan0web/db-fs'
import spawn from '../src/utils/exec.js'
import readline from 'node:readline'
import { DomeModel } from './DomeModel.js'

async function main() {
	const args = process.argv.slice(2)

	if (args.includes('--cli')) {
		console.log('\n🖥️ Launching NaN•Web Sandbox CLI Mode...\n')
		const adapter = new CLiInputAdapter()
		const infra = {
			AppRunner,
			SSRServer,
			NaN0WebConfig,
			DBwithFSDriver,
			spawn,
			dsn: 'play/',
			locale: 'uk',
		}
		const app = new ShellModel({ command: null }, infra)

		while (true) {
			const res = await runGenerator(app, adapter, infra)
			if (res.cancelled) break
			// Interactive menu loop
		}
		console.log('\nCLI session finished.\n')
	} else if (args.includes('--chat')) {
		runChatMode()
	} else {
		// Default: Web mode
		console.log('🌐 Booting NaN•Web Sandbox Web Server...')
		const runner = new AppRunner({
			dsn: 'play/',
			port: 3000,
			locale: 'uk',
		})

		for await (const msg of runner.run()) {
			if (msg.type === 'show') {
				console.log(`[App] ${msg.message}`)
			} else if (msg.type === 'progress') {
				console.log(`[Progress] ${msg.title}`)
			} else if (typeof msg === 'string') {
				console.log(`[Runner] ${msg}`)
			}
		}

		const server = new SSRServer(runner)
		const port = 3000
		const { protocol } = await server.listen(port)
		console.log(`\n✅ Web Server running at ${protocol}://localhost:${port}`)
		console.log('Press Ctrl+C to terminate.')

		// Keep alive
		while (true) {
			await new Promise((resolve) => setTimeout(resolve, 60000))
		}
	}
}

function runChatMode() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	let state = 'AWAIT_RADIUS'
	let radius = 4.5
	let floors = 2
	let hasBasement = true

	console.log('\n\x1b[35m💬 [Чат-Бот] Вітаємо в інтерактивному чаті купольного будинку!\x1b[0m')
	console.log('\x1b[90mПриклади команд: "радіус 5", "діаметр 10", "поверхів 2", "підвал так"\x1b[0m\n')

	const askQuestion = () => {
		if (state === 'AWAIT_RADIUS') {
			rl.question('\x1b[32m👤 Ви:\x1b[0m Вкажіть радіус (або діаметр) купола: ', (answer) => {
				const radMatch = answer.match(/(?:радіус|radius)\s*[:=]?\s*([\d\.]+)/i)
				const diaMatch = answer.match(/(?:діаметр|diameter)\s*[:=]?\s*([\d\.]+)/i)
				const numMatch = answer.trim().match(/^[\d\.]+$/)

				if (radMatch) {
					radius = parseFloat(radMatch[1])
					state = 'AWAIT_FLOORS'
					console.log(`\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Зрозуміло. Встановлено радіус: \x1b[36m${radius}м\x1b[0m.`)
				} else if (diaMatch) {
					radius = parseFloat(diaMatch[1]) / 2
					state = 'AWAIT_FLOORS'
					console.log(
						`\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Зрозуміло. Встановлено діаметр: \x1b[36m${diaMatch[1]}м\x1b[0m (радіус: \x1b[36m${radius}м\x1b[0m).`,
					)
				} else if (numMatch) {
					radius = parseFloat(numMatch[0])
					state = 'AWAIT_FLOORS'
					console.log(`\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Встановлено радіус: \x1b[36m${radius}м\x1b[0m.`)
				} else {
					console.log(
						'\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Будь ласка, введіть числове значення радіусу або фразу на кшталт "радіус 5".',
					)
				}
				askQuestion()
			})
		} else if (state === 'AWAIT_FLOORS') {
			rl.question('\x1b[32m👤 Ви:\x1b[0m Скільки поверхів плануєте (від 1 до 3)? ', (answer) => {
				const num = parseInt(answer.trim().match(/\d+/)?.[0] || '2', 10)
				if (num >= 1 && num <= 3) {
					floors = num
					state = 'AWAIT_BASEMENT'
					console.log(`\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Кількість поверхів: \x1b[36m${floors}\x1b[0m.`)
				} else {
					console.log('\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Будь ласка, вкажіть число від 1 до 3.')
				}
				askQuestion()
			})
		} else if (state === 'AWAIT_BASEMENT') {
			rl.question('\x1b[32m👤 Ви:\x1b[0m Чи потрібен підвал (так/ні)? ', (answer) => {
				const ans = answer.trim().toLowerCase()
				if (ans.startsWith('т') || ans.startsWith('y') || ans.includes('так') || ans.includes('yes')) {
					hasBasement = true
				} else {
					hasBasement = false
				}
				console.log(`\n\x1b[35m💬 [Чат-Бот]:\x1b[0m Виконуємо розрахунок...`)

				// Calculate and output
				const model = new DomeModel({ radius, floors, hasBasement })
				const res = model.calculate()

				console.log('\n\x1b[1m\x1b[35m📡 РЕЗУЛЬТАТИ РОЗРАХУНКУ КУПОЛА:\x1b[22m')
				console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
				console.log(`📏 Радіус: \x1b[36m${radius.toFixed(2)} м\x1b[0m | Діаметр: \x1b[36m${res.diameter.toFixed(2)} м\x1b[0m`)
				console.log(`🏠 Висота купола (півсфера): \x1b[36m${res.height.toFixed(2)} м\x1b[0m`)
				console.log(`🏢 Кількість поверхів: \x1b[36m${floors}\x1b[0m`)
				console.log(`🕳️ Підвал: \x1b[36m${hasBasement ? 'Так (-3.0м)' : 'Ні'}\x1b[0m`)
				console.log('────────────────────────────────────────────────────')

				res.floorsList.forEach((f) => {
					console.log(
						`• \x1b[34mПоверх ${f.index}:\x1b[0m Площа \x1b[33m${f.area.toFixed(2)} м²\x1b[0m (радіус поверху: ${f.radius.toFixed(2)} м)`,
					)
				})

				if (hasBasement) {
					console.log(
						`• \x1b[34mПідвал:\x1b[0m Площа \x1b[33m${res.basementArea.toFixed(2)} м²\x1b[0m | Об'єм \x1b[33m${res.basementVolume.toFixed(2)} м³\x1b[0m`,
					)
				}

				console.log('────────────────────────────────────────────────────')
				console.log(`📐 \x1b[1mЗагальна площа поверхів:\x1b[22m \x1b[32m${res.totalArea.toFixed(2)} м²\x1b[0m`)
				console.log(`📦 \x1b[1mЗагальний об'єм конструкції:\x1b[22m \x1b[32m${res.totalVolume.toFixed(2)} м³\x1b[0m`)
				console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

				state = 'ASK_RESET'
				askQuestion()
			})
		} else if (state === 'ASK_RESET') {
			rl.question('\x1b[35m💬 [Чат-Бот]:\x1b[0m Бажаєте зробити новий розрахунок (так/ні)? ', (answer) => {
				const ans = answer.trim().toLowerCase()
				if (ans.startsWith('т') || ans.startsWith('y') || ans.includes('так') || ans.includes('yes')) {
					state = 'AWAIT_RADIUS'
					askQuestion()
				} else {
					console.log('\n\x1b[35m💬 [Чат-Бот] Дякую за спілкування! До зустрічі! 👋\x1b[0m\n')
					rl.close()
				}
			})
		}
	}

	askQuestion()
}

main().catch(console.error)
