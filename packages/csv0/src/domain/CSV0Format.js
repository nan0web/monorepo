import { Format } from './Format.js'
import { NaN0 } from '@nan0web/types'
import { defaultResolver, FormatResolver } from './FormatResolver.js'

/**
 * CSV0Format - Format model for CSV0 documents (FrontMatter + CSV tabular body).
 */
export class CSV0Format extends Format {
	/**
	 * @param {object} [data]
	 * @param {object} [options]
	 * @param {any} [options.db]
	 * @param {FormatResolver} [options.resolver]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.resolver = options.resolver || (options.db ? new FormatResolver({ db: options.db }) : defaultResolver)
	}

	/**
	 * Parses a raw CSV0 string into an object containing frontMatter, csvBody, meta, and typed rows.
	 * @param {string} source
	 * @param {object} [options]
	 * @param {boolean} [options.typed]
	 * @returns {{ frontMatter: string, csvBody: string, meta?: any, columns?: Record<string, any>, rows?: Array<Record<string, any>> }}
	 */
	parse(source, options = {}) {
		if (!source) return { frontMatter: '', csvBody: '', rows: [] }

		const lines = source.split(/\r?\n/)
		let frontMatter = ''
		let csvBody = source

		if (lines[0] === '---') {
			const endOfFrontMatter = lines.indexOf('---', 1)
			if (endOfFrontMatter !== -1) {
				frontMatter = lines.slice(1, endOfFrontMatter).join('\n')
				csvBody = lines.slice(endOfFrontMatter + 1).join('\n')
			}
		}

		const result = { frontMatter, csvBody }

		let meta = null
		if (frontMatter.trim()) {
			meta = NaN0.parse(frontMatter)
			result.meta = meta
		}

		const isTyped = options.typed ?? Boolean(meta && meta.columns)
		if (isTyped) {
			const columnsConfig = meta?.columns || options.columns || {}
			result.columns = columnsConfig

			const bodyLines = csvBody.trim().split(/\r?\n/).filter((l) => l.trim().length > 0)
			if (bodyLines.length > 0) {
				const headers = bodyLines[0].split(',').map((h) => h.trim())
				const formatInstances = headers.map((h) => {
					const colDef = columnsConfig[h] || 'string'
					return this.resolver.resolveSync(colDef)
				})

				const rows = []
				for (let i = 1; i < bodyLines.length; i++) {
					const cells = bodyLines[i].split(',').map((c) => c.trim())
					const row = {}
					for (let j = 0; j < headers.length; j++) {
						const val = cells[j] ?? ''
						const fmt = formatInstances[j]
						row[headers[j]] = fmt ? fmt.parse(val) : val
					}
					rows.push(row)
				}
				result.rows = rows
			} else {
				result.rows = []
			}
		}

		return result
	}

	/**
	 * Stringifies an array of objects or tabular structure into CSV0 format.
	 * @param {Array<Record<string, any>>} rows
	 * @param {object} [options]
	 * @param {Record<string, any>} [options.columns]
	 * @param {string} [options.title]
	 * @param {Record<string, any>} [options.meta]
	 * @returns {string}
	 */
	stringify(rows, options = {}) {
		const metaObj = { ...(options.meta || {}) }

		if (options.title && !metaObj.title) {
			metaObj.title = options.title
		}

		const columns = options.columns || metaObj.columns || {}
		if (Object.keys(columns).length > 0) {
			metaObj.columns = columns
		}

		const headers = Object.keys(columns).length > 0 ? Object.keys(columns) : Object.keys(rows?.[0] || {})
		const formatInstances = headers.map((h) => {
			const colDef = columns[h] || 'string'
			return this.resolver.resolveSync(colDef)
		})

		const frontMatter = NaN0.stringify(metaObj).trim()
		const fmLines = ['---', frontMatter, '---']

		const csvLines = [headers.join(',')]
		if (Array.isArray(rows)) {
			for (const row of rows) {
				const line = headers.map((h, idx) => {
					const val = row[h]
					const fmt = formatInstances[idx]
					return fmt ? fmt.stringify(val) : String(val ?? '')
				}).join(',')
				csvLines.push(line)
			}
		}

		return `${fmLines.join('\n')}\n${csvLines.join('\n')}`
	}
}
