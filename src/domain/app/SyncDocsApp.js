import { ModelAsApp, result, progress, show } from '@nan0web/ui'
import { Data } from '@nan0web/db'

export default class SyncDocsApp extends ModelAsApp {
	static UI = {
		syncing: 'Syncing: {file}',
		done: '✨ Heritage preserved in {count} documents',
		error: 'Heritage source not found',
	}

	static path = {
		help: 'Path to the target folder, default is @app/docs',
		default: '@app/docs',
	}

	static separator = {
		help: 'Separator for nested variables, default is /',
		default: '/',
	}

	static tag = {
		help: 'Tag name for variables, default is v',
		default: 'v',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to the target folder, default is @app/docs */
		this.path
		/** @type {string} Separator for nested variables, default is '/' */
		this.separator
		/** @type {string} Tag name for variables, default is 'v' */
		this.tag
	}

	async *run() {
		const { db, t } = this._

		// 1. Load Heritage via Platform DB (using loadDocument for extension fallback)
		let heritage = await db.loadDocument(`${this.path}/index`)
		if (!heritage) heritage = await db.loadDocument(`${this.path}/_`)

		if (!heritage) {
			yield show(t(SyncDocsApp.UI.error), 'error')
			return result({ ok: false })
		}

		// Flatten variables with platform standard separator
		const { content: _, ...vars } = heritage
		Data.setObjectDivider(this.separator)
		const flatVars = Data.flatten(vars)

		// 2. Discover files via Platform DB browse (restricted to path)
		const files = []
		try {
			const browseGenerator = await db.browse(this.path, {
				recursive: true,
				exclude: ['node_modules', '.git', 'dist', '_*'],
			})

			for await (const file of browseGenerator) {
				files.push(file)
			}
		} catch (e) {
			// Silent fallback if no docs
		}

		let count = 0

		// 3. Document Interpolation
		for (const file of files) {
			const uri = file.uri || file.path
			if (!uri) continue

			const doc = await db.loadDocument(uri)
			if (!doc || !doc.content) continue

			let content = doc.content
			const original = content

			// Platform-native V-Tag interpolation (supports custom Web Components)
			for (const [key, value] of Object.entries(flatVars)) {
				const regex = new RegExp('<' + this.tag + ' name="' + key + '">([\\s\\S]*?)<\\/' + this.tag + '>', 'g')
				content = content.replace(regex, `<${this.tag} name="${key}">${value}</${this.tag}>`)
			}

			if (content !== original) {
				doc.content = content
				await db.saveDocument(uri, doc)
				yield progress(t(SyncDocsApp.UI.syncing, { file: file.path || uri }))
				count++
			}
		}

		yield show(t(SyncDocsApp.UI.done, { count }))
		return result({ ok: true, count })
	}
}
