import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const BUT_REGEX = /(?<=^|[\s.,!?;])(але|проте|а\s+проте|but|however)(?=[\s.,!?;]|$)/i
const NOT_REGEX = /(?<=^|[\s.,!?;])(не|ніколи|жоден|ні|ніякий|not|never|no|none)(?=[\s.,!?;]|$)/gi

/**
 * Performs Subconscious filter logic using simple Regex.
 * Faster but less accurate than the LLM flow.
 */
export class LanguageIntentRegexAgent {
	/**
	 * @param {import('../domain/LanguageIntentModel.js').LanguageIntentModel} params
	 */
	static async execute(params) {
		let text = params.input

		if (!text) {
			throw new Error('Input text is empty.')
		}

		const statements = text.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0)
		let total = statements.length
		let cleanCount = 0
		let errors = []

		for (let s of statements) {
			let isClean = true
			let intention = s.trim()
			let reasons = []

			const butMatch = intention.match(BUT_REGEX)
			if (butMatch) {
				// Strip everything before BUT
				intention = intention.slice((butMatch.index ?? 0) + butMatch[0].length).trim()
				isClean = false
				reasons.push("Знайдено ментальний вірус (виправдання або маскування через 'але')")
			}

			const notMatches = intention.match(NOT_REGEX)
			if (notMatches) {
				isClean = false
				reasons.push('Знайдено ментальний вірус (заперечення)')
				intention = intention.replace(NOT_REGEX, '').replace(/\s+/g, ' ').trim()
			}

			if (isClean) {
				cleanCount++
			} else {
				errors.push({
					chunk: s,
					intent: intention,
					reason: reasons.join(', '),
				})
			}
		}

		const score = total > 0 ? (cleanCount / total) * 100 : 100

		return { score, errors }
	}
}
