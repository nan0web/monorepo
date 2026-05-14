/**
 * Playground entry point.
 *
 * Choose which demo to run:
 *   1) Select a language
 *   2) Registration Form
 *   3) Currency Exchange
 *   4) Top‑up Telephone
 *   5) ← Exit
 *
 * Type 0 to exit.
 */
import { argv } from 'node:process'
import Logger from '@nan0web/log'
import { CancelError, createInput, select } from '@nan0web/ui-cli'
import { runLanguage } from './language.form.js'
import { runRegistration } from './registration.form.js'
import { runExchange } from './currency.exchange.js'
import { runTopup } from './topup.telephone.js'
import createT, { detectLocale } from './i18n/index.js'

const console = new Logger(Logger.detectLevel(argv))
let t = createT(detectLocale(argv))
const ask = createInput(['0'])

async function main() {
	console.info(Logger.style(Logger.LOGO, { color: 'magenta' }))

	while (true) {
		// Оновлюємо пункти меню через поточну t()
		const menuOptions = [
			t('Select a language'),
			t('Registration Form'),
			t('Currency Exchange'),
			t('Top‑up Telephone'),
			t('← Exit'),
		]

		try {
			const prompt = t('[me]') + ': '
			const invalidPrompt = Logger.style(t('[me invalid]'), { bgColor: 'yellow' }) + ': '
			const choice = await select({
				title: t('Select demo:'),
				prompt,
				invalidPrompt,
				options: menuOptions,
				console,
			})

			switch (choice.index) {
				case 0: {
					const lang = await runLanguage(t, ask, console)
					t = createT(lang)
					break
				}
				case 1:
					await runRegistration(t, ask, console)
					break
				case 2:
					await runExchange(t, ask, console)
					break
				case 3:
					await runTopup(t, ask, console)
					break
				case 4:
					console.success(t('Good‑bye.'))
					process.exit(0)
				default:
					console.warn(t('! Invalid choice.'))
			}
		} catch (err) {
			if (err instanceof CancelError) {
				console.warn('\n' + t('⨉ Cancelled.'))
				continue
			}
			throw err
		}
	}
}

main()
