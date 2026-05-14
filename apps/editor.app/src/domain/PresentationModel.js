import { Model } from '@nan0web/ui'
import { Document } from './Document.js'

/**
 * PresentationModel — Orchestrates a collection of Documents as a presentation.
 */
export class PresentationModel extends Model {
	static title = {
		help: 'Presentation title',
		default: 'NaN•Web Editor — Presentation'
	}
	static items = {
		help: 'List of documents in the presentation',
		model: Document,
		type: 'Document[]',
		default: []
	}

	/**
	 * @param {Partial<PresentationModel>} [data]
	 * @param {import('@nan0web/ui').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.title
		/** @type {Document[]} */ this.items = (this.items || []).map(
			(s, i) => new Document(s, { ...options, parent: this, index: i })
		)
	}

	async loadFromDir(db, path = 'presentation') {
		const items = []
		for await (const entry of db.findStream(path, { limit: -1 })) {
			if (entry.file.path.endsWith('.nan0') || entry.file.path.endsWith('.yaml')) {
				const data = await db.loadDocument(entry.file.path)
				items.push(new Document(data, { db }))
			}
		}
		this.items = items.sort((a, b) => a.order - b.order)
	}
}
