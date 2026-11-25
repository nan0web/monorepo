import { ModelError } from '@nan0web/types'
import { ModelAsApp } from '@nan0web/ui'
import Markdown from '@nan0web/markdown'

/**
 * Formats an author identifier into a filename-safe slug.
 * @param {string} author
 * @returns {string}
 */
function slugifyAuthor(author) {
	return String(author || 'anon')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/**
 * Computes deterministic 2-level prefix shard URI: chats/<xx>/<yy>/<chatId>.
 * @param {string} chatId
 * @param {string} [base='chats']
 * @returns {string}
 */
export function resolveChatShardUri(chatId, base = 'chats') {
	const slug = slugifyAuthor(chatId)
	let hash = 2166136261
	for (let i = 0; i < slug.length; i += 1) {
		hash ^= slug.charCodeAt(i)
		hash = Math.imul(hash, 16777619)
	}
	const hex = (hash >>> 0).toString(16).padStart(8, '0')
	return `${base}/${hex.slice(0, 2)}/${hex.slice(2, 4)}/${slug}`
}

/**
 * Serializes a chat message into Markdown with metadata header.
 * @param {{ author: string, timestamp: string, text: string }} msg
 * @returns {string}
 */
function formatMessageMarkdown(msg) {
	return [
		'---',
		`author: ${msg.author}`,
		`timestamp: ${msg.timestamp}`,
		'---',
		'',
		msg.text,
		'',
	].join('\n')
}

/**
 * Parses a serialized chat message Markdown document using @nan0web/markdown.
 * @param {string} raw
 * @returns {{ author: string, timestamp: string, text: string }}
 */
export function parseMessageMarkdown(raw) {
	const md = new Markdown()
	const { content, metadata } = md.parseFrontmatter(String(raw || ''))
	return {
		author: String(metadata.author || ''),
		timestamp: String(metadata.timestamp || ''),
		text: String(content || '').trim(),
	}
}

/**
 * 2D Git-native chat repository with time-sharded Markdown messages.
 */
export class ChatRepoModel extends ModelAsApp {
	static UI = {
		errorAuthorTextRequired: 'Author and text are required',
	}

	static repo = {
		help: 'Repository base URI (e.g. chats/<xx>/<yy>/<chatId> or we/<circle>/<name>)',
		default: '',
	}

	/**
	 * @param {Partial<ChatRepoModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Repository base URI */ this.repo
	}

	/**
	 * Sends and persists a message in chat/YYYY/MM/DD/<ts>-<peer>.md and updates README.md.
	 * @param {{ author: string, text: string, timestamp?: string }} input
	 * @returns {Promise<{ uri: string, filename: string, author: string, timestamp: string, text: string }>}
	 */
	async sendMessage(input) {
		const { author, text, timestamp = new Date().toISOString() } = input || {}
		if (!author || !text) {
			throw new ModelError({ message: this._.t(ChatRepoModel.UI.errorAuthorTextRequired) })
		}
		const [datePart, timePart = '00:00:00.000Z'] = String(timestamp).split('T')
		const [year, month, day] = datePart.split('-')
		const tsSlug = timePart.replace(/[:.]/g, '').replace(/Z$/, '')
		const filename = `${tsSlug}-${slugifyAuthor(author)}.md`
		const dayDir = this.$db.normalize(this.repo, 'chat', year, month, day)
		const uri = this.$db.normalize(dayDir, filename)

		await this.$db.saveDocument(uri, formatMessageMarkdown({ author, timestamp, text }))
		await this.#appendDayIndex(dayDir, { filename, author, timestamp })

		return { uri, filename, author, timestamp, text }
	}

	/**
	 * Lists all messages for a given YYYY-MM-DD date in chronological order.
	 * @param {string} dateStr
	 * @returns {Promise<Array<{ uri: string, filename: string, author: string, timestamp: string, text: string }>>}
	 */
	async listDay(dateStr) {
		const [year, month, day] = String(dateStr || '').split('-')
		const dayDir = this.$db.normalize(this.repo, 'chat', year, month, day)
		const entries = await this.$db.listDir(dayDir)
		const files = entries
			.filter((e) => e.isFile && e.name.endsWith('.md') && e.name !== 'README.md')
			.sort((a, b) => a.name.localeCompare(b.name))

		const messages = []
		for (const entry of files) {
			const uri = this.$db.normalize(dayDir, entry.name)
			const raw = await this.$db.loadDocument(uri, '')
			const parsed = parseMessageMarkdown(String(raw))
			messages.push({ uri, filename: entry.name, ...parsed })
		}
		return messages
	}

	/**
	 * Appends a deterministic index line to chat/YYYY/MM/DD/README.md.
	 * @param {string} dayDir
	 * @param {{ filename: string, author: string, timestamp: string }} item
	 */
	async #appendDayIndex(dayDir, item) {
		const indexUri = this.$db.normalize(dayDir, 'README.md')
		const existing = await this.$db.loadDocument(indexUri, '')
		const header = existing ? String(existing).trimEnd() : `# Chat Index (${dayDir})`
		const line = `- [${item.timestamp}] **${item.author}** -> [${item.filename}](./${item.filename})`
		await this.$db.saveDocument(indexUri, `${header}\n${line}\n`)
	}
}
