import i18n, { createT } from '@nan0web/i18n'
import uk from './uk.js'

const getVocab = i18n({ uk })

export function detectLocale(argv = []) {
	// Detect language from CLI argument or environment variable
	const langArg = argv.find((a) => a.startsWith('--lang='))
	let locale = 'en'
	if (langArg) {
		locale = langArg.split('=')[1]
	}
	return locale
}

export const localesMap = new Map([
	['en', 'English'],
	['uk', 'Українська'],
])

export default (locale) => createT(getVocab(locale))
