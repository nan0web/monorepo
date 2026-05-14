import { Auth, Scope } from '../src/index.js'
import { runFlow } from '../../ui/src/core/Flow.js'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

// 1. Створюємо простий CLI Адаптер для демо
const simpleCliAdapter = {
	async executePrompt(component) {
		const rl = readline.createInterface({ input, output })

		try {
			// Рендер компонента
			console.log('\n🔐  PRIVATE KEY ACCESS REQUEST')
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
			console.log(`📡  ${component.props.message}`)
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

			const answer = await rl.question('👉 [Y/n]: ')
			return { value: answer.toLowerCase() !== 'n' }
		} finally {
			rl.close()
		}
	},
}

// 2. Сценарій: Суверенна Авторизація
async function main() {
	console.clear()
	console.log('🌀 nan•web Matrix | Sovereign Identity Demo\n')

	// Емуляція запиту від зовнішнього додатку
	const advocatesRequest = {
		clientId: 'Advocates NYC',
		scopes: [Scope.IDENTITY_EMAIL, Scope.PAYMENT_CHARGE],
	}

	console.log(`📥 Incoming connection from: ${advocatesRequest.clientId}...`)

	try {
		// ЗАПУСК ПОТОКУ
		// Auth.askConsent — це генератор.
		// runFlow — це рушій, який крутить генератор і передає yield'и адаптеру.

		const result = await runFlow(
			Auth.askConsent(advocatesRequest),
			simpleCliAdapter
		)

		console.log('\n✅ ACCESS GRANTED')
		console.log('🎟️  Token issued:', result.token)
		console.log('⏳ Expires in:', result.expiresIn, 'seconds')

	} catch (error) {
		console.log('\n❌ ACCESS DENIED')
		console.log('🛡️  Sovereign Identity protected.')
	}
}

main()
