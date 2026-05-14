/**
 * Simple currency exchange console tool.
 *
 * Prompts for:
 *   - From currency (options)
 *   - To currency (options)
 *   - Amount (number)
 *
 * Controls:
 *   - Input "0" on any prompt to cancel.
 *   - Empty input on final confirmation submits.
 */

import { CancelError, select } from '@nan0web/ui-cli'

const rates = {
	USD: 1,
	EUR: 0.9,
	UAH: 27,
	GBP: 0.8,
}

/** Main exchange flow */
export async function runExchange(t, ask, console, prompt, invalidPrompt) {
	/** Choose a currency from available list */
	async function chooseCurrency(title, selected = []) {
		const input = await select({
			title,
			prompt,
			invalidPrompt,
			console,
			options: Object.keys(rates).filter((c) => !selected.includes(c)),
		})
		return input.value
	}

	console.info('\n=== ' + t('Currency Exchange') + ' ===')
	const from = await chooseCurrency(t('From Currency'))
	if (!from) throw new CancelError()
	const to = await chooseCurrency(t('To Currency'), [from])
	if (!to) throw new CancelError()
	const input = await ask(
		t('Amount') + ': ',
		(input) => isNaN(input) || Number(input) <= 0,
		t('Invalid amount.') + ': ',
	)
	const amount = Number(input)
	const result = (amount / rates[from]) * rates[to]
	console.success(`\n${amount} ${from} = ${result.toFixed(2)} ${to}\n`)
}
