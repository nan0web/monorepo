import { ModelError } from '@nan0web/types'
import { ModelAsApp } from '@nan0web/ui'
import { parseMessageMarkdown } from './ChatRepoModel.js'

/**
 * Formats a crystallized entry for todo.md or docs/*.md with $ref and authorship.
 * @param {{ text: string, author: string, msgUri: string, kind: string }} data
 * @returns {string}
 */
function formatCrystallizedEntry({ text, author, msgUri, kind }) {
	if (kind === 'todo') {
		return `- [ ] ${text} [author:${author}] [$ref:${msgUri}]`
	}
	return `> ${text}\n>\n> — **${author}** ([$ref](${msgUri}))`
}

/**
 * Crystallizes ephemeral chat messages into structured project documents or todo.md.
 */
export class CrystallizeModel extends ModelAsApp {
	static UI = {
		errorNoDb: 'Database instance ($db) is required',
		errorMsgNotFound: 'Source message not found',
	}

	/**
	 * Moves/projects a chat message into targetDocUri preserving authorship and $ref.
	 * @param {{ msgUri: string, targetDocUri: string, kind?: 'todo' | 'note' }} input
	 * @returns {Promise<{ author: string, $ref: string, targetDocUri: string, kind: string, text: string }>}
	 */
	async crystallize(input) {
		const { msgUri, targetDocUri, kind = 'note' } = input || {}
		const stat = await this.$db.stat(msgUri)
		if (!stat || !stat.exists) {
			throw new ModelError({ msgUri: `${CrystallizeModel.UI.errorMsgNotFound}: ${msgUri}` })
		}
		const rawMsg = await this.$db.loadDocument(msgUri, '')
		const parsed = parseMessageMarkdown(String(rawMsg))
		const entryText = formatCrystallizedEntry({
			text: parsed.text,
			author: parsed.author,
			msgUri,
			kind,
		})

		const existingDoc = await this.$db.loadDocument(targetDocUri, '')
		const prefix = existingDoc ? `${String(existingDoc).trimEnd()}\n` : ''
		await this.$db.saveDocument(targetDocUri, `${prefix}${entryText}\n`)

		return {
			author: parsed.author,
			$ref: msgUri,
			targetDocUri,
			kind,
			text: parsed.text,
		}
	}
}
