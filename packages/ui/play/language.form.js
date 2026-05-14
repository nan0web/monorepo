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
import { localesMap } from './i18n/index.js'
import { select } from '@nan0web/ui-cli'

/** Main exchange flow */
export async function runLanguage(t, ask, console, prompt, invalidPrompt) {
	const lang = await select({
		title: '\n=== ' + t('Language Selector') + ' ===',
		prompt,
		invalidPrompt,
		console,
		options: Array.from(localesMap.keys()),
	})
	console.success(`\n${lang.value}\n`)
	return lang.value
}
