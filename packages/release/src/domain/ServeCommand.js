import { ModelAsApp, result, show } from '@nan0web/ui'
import Markdown from '@nan0web/markdown'
import DEFAULT_TEMPLATE from './templates/release.html.template.js'

/**
 * ServeCommand - Universal ModelAsApp for data or release catalogs.
 *
 * Generates HTML content from README.md and release templates using $db and Markdown.
 * Pure OLMUI model: does not start HTTP server, does not call node:fs or child_process.
 *
 * Usage:
 *   pnpm exec serve releases/  # Runs via CLI bootstrap
 */
export default class ServeCommand extends ModelAsApp {
	static alias = 'serve'

	static UI = {
		title: 'serve',
		help: 'Serve data or releases catalog over HTTP',
		serving: '🌐 Serving {$dir} on http://localhost:{$port} (Press Ctrl+C to stop)',
		dirNotFound: 'Directory {$dir} does not exist.',
	}

	static dir = {
		help: 'Directory to serve (e.g. releases/ or data/)',
		positional: true,
		type: 'string',
		default: 'releases',
	}

	static port = {
		help: 'HTTP server port',
		default: 3131,
		type: 'number',
		alias: 'p',
	}

	static open = {
		help: 'Automatically open in browser',
		default: true,
		type: 'boolean',
	}

	/**
	 * @param {Partial<ServeCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */
		this.dir = String(data.dir || (options && 'dir' in options ? /** @type {any} */ (options).dir : 'releases'))
		/** @type {number} */
		this.port = Number(data.port ?? (options && 'port' in options ? /** @type {any} */ (options).port : 3131))
		/** @type {boolean} */
		this.open = Boolean(data.open ?? (options && 'open' in options ? /** @type {any} */ (options).open : true))
	}

	/**
	 * Convert markdown string to HTML using @nan0web/markdown
	 * @param {string} mdRaw
	 * @returns {string}
	 */
	renderMarkdownToHtml(mdRaw) {
		if (!mdRaw || typeof mdRaw !== 'string') return ''
		const md = new Markdown(mdRaw)
		return md.stringify()
	}

	/**
	 * Render HTML content for the target directory
	 * @returns {Promise<string>}
	 */
	async renderHtml() {
		const db = this.$db
		let readmeContent = ''
		const readmePath = db.resolveSync ? db.resolveSync(this.dir, 'README.md') : `${this.dir}/README.md`

		try {
			const mdRaw = await db.loadDocument(readmePath, null)
			if (mdRaw) {
				readmeContent = this.renderMarkdownToHtml(typeof mdRaw === 'string' ? mdRaw : mdRaw.content || String(mdRaw))
			}
		} catch {}

		if (!readmeContent) {
			// If no README.md in directory, scan directory entries and list them nicely
			let listItems = []
			try {
				if (typeof db.listDir === 'function') {
					const entries = await db.listDir(this.dir)
					if (entries && Array.isArray(entries)) {
						listItems = entries
							.map((e) => e?.name || e?.path || String(e))
							.filter((name) => !name.startsWith('.'))
					}
				}
			} catch {}

			const title = this.dir === 'releases' ? 'Releases Catalog' : `Index of ${this.dir}`
			let md = `# ${title}\n\n`
			if (listItems.length > 0) {
				md += `Found **${listItems.length}** item(s) in \`${this.dir}\`:\n\n`
				for (const item of listItems) {
					md += `- **\`${item}\`**\n`
				}
			} else {
				md += `Directory \`${this.dir}\` is currently empty or contains no catalog entries.\n`
			}
			readmeContent = this.renderMarkdownToHtml(md)
		}

		// Load template via DB or fallback to bundled template
		let templateRaw = null
		try {
			templateRaw = await db.loadDocument('packages/release/src/domain/templates/release.html', null)
		} catch {}

		if (!templateRaw) {
			templateRaw = DEFAULT_TEMPLATE
		}

		return String(templateRaw).replace('{{CONTENT}}', readmeContent)
	}

	async *run() {
		const db = this.$db

		// Check if directory exists via db.listDir or db.stat
		let dirExists = false
		try {
			if (typeof db.listDir === 'function') {
				const entries = await db.listDir(this.dir)
				dirExists = entries && entries.length > 0
			}
			if (!dirExists && typeof db.stat === 'function') {
				const stat = await db.stat(this.dir)
				dirExists = Boolean(stat && (stat.exists || stat.isDirectory || stat.isFile))
			}
		} catch {
			dirExists = false
		}

		if (!dirExists) {
			yield show(ServeCommand.UI.dirNotFound.replace('{$dir}', this.dir), 'error')
			return result({ success: false })
		}

		const html = await this.renderHtml()

		yield show(
			ServeCommand.UI.serving.replace('{$dir}', this.dir).replace('{$port}', String(this.port)),
			'success'
		)

		return result({
			success: true,
			dir: this.dir,
			port: this.port,
			open: this.open,
			html,
		})
	}
}

export { ServeCommand }
