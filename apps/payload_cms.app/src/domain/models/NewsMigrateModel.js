import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, result } from '@nan0web/ui/core'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * NewsMigrateModel - Subcommand to import articles & news into Payload CMS
 */
export class NewsMigrateModel extends ModelAsApp {
	static alias = 'news:import'

	static UI = {
		title: 'Batch Import News & Content into Payload CMS',
		start: 'Starting Payload CMS news import...',
		scanning: 'Scanning news files in {target}...',
		importing: 'Importing: {title}...',
		done: 'News import completed! Created: {created}, Updated: {updated}, Skipped: {skipped}.',
	}

	static dir = {
		help: 'Source directory containing news JSON/MD files',
		default: 'data/news',
		positional: true,
	}

	static collection = {
		help: 'Payload CMS target collection slug',
		default: 'news',
	}

	static locale = {
		help: 'Default locale for imported content',
		default: 'uk',
	}

	/**
	 * @param {Partial<NewsMigrateModel>} [data = {}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options = {}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dir
		/** @type {string} */ this.collection
		/** @type {string} */ this.locale
	}

	/**
	 * Converts plain text / markdown to Lexical AST.
	 * @param {string} content
	 * @returns {object}
	 */
	toLexicalState(content) {
		if (!content) {
			return {
				root: {
					type: 'root',
					children: [],
					direction: 'ltr',
					format: '',
					indent: 0,
					version: 1,
				},
			}
		}

		if (typeof content === 'object' && content.root) {
			return content
		}

		const paragraphs = String(content)
			.split(/\n\s*\n/)
			.map((p) => p.trim())
			.filter(Boolean)

		return {
			root: {
				type: 'root',
				format: '',
				indent: 0,
				version: 1,
				direction: 'ltr',
				children: paragraphs.map((text) => ({
					type: 'paragraph',
					format: '',
					indent: 0,
					version: 1,
					children: [
						{
							type: 'text',
							text,
							detail: 0,
							format: 0,
							mode: 'normal',
							style: '',
							version: 1,
						},
					],
				})),
			},
		}
	}

	/**
	 * Imports a single news item
	 * @param {any} payload
	 * @param {object} item
	 * @param {string} locale
	 */
	async importItem(payload, item, locale = 'uk') {
		const slug =
			item.slug ||
			item.title?.toLowerCase().replace(/[^a-z0-9а-яіїєґ]/gi, '-').replace(/-+/g, '-')
		const content = this.toLexicalState(item.content)

		const existing = await payload.find({
			collection: this.collection || 'news',
			limit: 1,
			locale,
			where: slug ? { slug: { equals: slug } } : { title: { equals: item.title } },
		})

		const data = {
			title: item.title,
			slug: slug || undefined,
			category: item.category || 'General',
			publishDate: item.publishDate || new Date().toISOString().split('T')[0],
			summary: item.summary || '',
			content,
			image: item.image || undefined,
			...item.extraData,
		}

		if (existing.docs[0]) {
			const updated = await payload.update({
				collection: this.collection || 'news',
				id: existing.docs[0].id,
				locale,
				data,
			})
			return { status: 'updated', doc: updated }
		}

		const created = await payload.create({
			collection: this.collection || 'news',
			locale,
			data,
		})
		return { status: 'created', doc: created }
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, payload } = this._
		const targetDir = path.resolve(process.cwd(), this.dir || 'data/news')
		const locale = this.locale || 'uk'

		yield progress(t(NewsMigrateModel.UI.start))
		yield progress(t(NewsMigrateModel.UI.scanning, { target: targetDir }))

		const items = []
		try {
			const entries = await fs.readdir(targetDir, { withFileTypes: true })
			for (const entry of entries) {
				const fullPath = path.join(targetDir, entry.name)
				if (entry.isFile() && entry.name.endsWith('.json')) {
					const content = JSON.parse(await fs.readFile(fullPath, 'utf8'))
					if (Array.isArray(content)) items.push(...content)
					else if (typeof content === 'object') items.push(content)
				}
			}
		} catch (e) {
			// directory missing or empty
		}

		let created = 0
		let updated = 0
		let skipped = 0
		let i = 0

		for (const item of items) {
			yield progress(t(NewsMigrateModel.UI.importing, { title: item.title }), i++, items.length)
			if (payload) {
				try {
					const res = await this.importItem(payload, item, locale)
					if (res.status === 'created') created++
					if (res.status === 'updated') updated++
				} catch (err) {
					skipped++
				}
			} else {
				created++
			}
		}

		yield show(t(NewsMigrateModel.UI.done, { created, updated, skipped }), 'success')
		return result({ status: 'ok', created, updated, skipped, total: items.length })
	}
}
