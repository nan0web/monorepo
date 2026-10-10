import { Format } from './Format.js'
import { NaN0 } from '@nan0web/types'
import { defaultResolver, FormatResolver } from './FormatResolver.js'
import { parseCSVObjects } from '../csv.js'

/**
 * CSV0Format - Format model for CSV0 documents (FrontMatter + CSV tabular body).
 */
export class CSV0Format extends Format {
	/**
	 * @param {object} [data]
	 * @param {object} [options]
	 * @param {import('@nan0web/db').default} [options.db] Database instance
	 * @param {FormatResolver} [options.resolver]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.resolver = options.resolver || (options.db ? new FormatResolver({ db: options.db }) : defaultResolver)
	}

	/**
	 * Evaluates a simple mathematical expression for a row or aggregate scope.
	 * @param {string} expr
	 * @param {Record<string, any>} scope
	 * @returns {any}
	 */
	_evalExpr(expr, scope) {
		const clean = expr.startsWith('=') ? expr.slice(1).trim() : expr.trim()
		try {
			const keys = Object.keys(scope)
			const values = Object.values(scope)
			const fn = new Function(...keys, `return (${clean})`)
			return fn(...values)
		} catch (err) {
			return 0
		}
	}

	/**
	 * Parses a raw CSV0 string into an object containing frontMatter, csvBody, meta, head, columns, rows, and totals.
	 * @param {string} source
	 * @param {object} [options]
	 * @param {boolean} [options.typed]
	 * @param {Record<string, any>} [options.columns]
	 * @param {Record<string, any>} [options.head]
	 * @returns {{ frontMatter: string, csvBody: string, meta?: any, head?: any, columns?: Record<string, any>, rows?: Array<Record<string, any>>, totals?: Record<string, any> }}
	 */
	parse(source, options = {}) {
		if (!source) return { frontMatter: '', csvBody: '', rows: [] }

		const lines = source.split(/\r?\n/)
		let frontMatter = ''
		let csvBody = source

		let hasFrontMatter = false
		const firstLineTrimmed = lines[0].trim()
		if (firstLineTrimmed === '---') {
			const endOfFrontMatter = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
			if (endOfFrontMatter !== -1) {
				hasFrontMatter = true
				frontMatter = lines.slice(1, endOfFrontMatter).join('\n')
				csvBody = lines.slice(endOfFrontMatter + 1).join('\n')
			}
		} else if (firstLineTrimmed === '# ---') {
			// Edit CSV compatible commented FrontMatter: `# ---` ... `# ---` (fast non-regex parsing)
			const end = lines.findIndex((l, i) => i > 0 && l.trim() === '# ---')
			if (end !== -1) {
				hasFrontMatter = true
				frontMatter = lines
					.slice(1, end)
					.map((l) => (l.startsWith('# ') ? l.slice(2) : l.startsWith('#') ? l.slice(1) : l))
					.join('\n')
				csvBody = lines.slice(end + 1).join('\n')
			}
		}

		/** @type {any} */
		const result = { frontMatter, csvBody }

		let meta = null
		if (frontMatter.trim()) {
			meta = NaN0.parse(frontMatter)
			result.meta = meta
		}

		// 1. Resolve columns / head configuration
		let headConfig = null
		if (meta && meta.head !== undefined) {
			headConfig = meta.head
		} else if (options.head !== undefined) {
			headConfig = options.head
		}

		let columnsConfig = null
		if (headConfig && typeof headConfig === 'object') {
			columnsConfig = { ...headConfig }
		} else if (meta?.columns || options.columns) {
			columnsConfig = { ...(meta?.columns || options.columns) }
		}

		// Resolve from Model-as-Schema if model is provided
		const modelRef = meta?.model || options.model
		if (modelRef && this.resolver?.resolveModelSchema) {
			const modelSchema = this.resolver.resolveModelSchema(modelRef)
			if (modelSchema) {
				columnsConfig = { ...modelSchema, ...(columnsConfig || {}) }
			}
		}

		if (columnsConfig) {
			result.columns = columnsConfig
			result.head = columnsConfig
		} else if (headConfig !== undefined) {
			result.head = headConfig
		}

		const hasHeaderRow = headConfig !== false && meta?.head !== false

		const isTyped = options.typed ?? Boolean(
			(meta && (meta.columns || (meta.head && typeof meta.head === 'object') || meta.model || meta.totals)) ||
			options.head ||
			options.columns ||
			options.model
		)

		if (isTyped || hasFrontMatter) {
			const bodyLines = csvBody.trim().split(/\r?\n/).filter((l) => l.trim().length > 0)
			if (bodyLines.length > 0) {
				let headers = []
				let startRowIndex = 0

				if (hasHeaderRow) {
					headers = bodyLines[0].split(',').map((h) => h.trim())
					startRowIndex = 1
				} else if (columnsConfig) {
					headers = Object.keys(columnsConfig)
					startRowIndex = 0
				} else {
					headers = bodyLines[0].split(',').map((h) => h.trim())
					startRowIndex = 1
				}

				const formatInstances = headers.map((h) => {
					const colDef = columnsConfig?.[h] || 'string'
					return this.resolver.resolveSync(colDef)
				})

				// Extract formula columns (Variant A)
				const formulaCols = {}
				if (columnsConfig) {
					for (const [colName, colDef] of Object.entries(columnsConfig)) {
						if (colDef && typeof colDef === 'object' && colDef.formula) {
							formulaCols[colName] = colDef.formula
						}
					}
				}

				const rows = []
				for (let i = startRowIndex; i < bodyLines.length; i++) {
					const cells = bodyLines[i].split(',').map((c) => c.trim())
					const row = {}
					for (let j = 0; j < headers.length; j++) {
						const val = cells[j] ?? ''
						const fmt = formatInstances[j]
						row[headers[j]] = fmt ? fmt.parse(val) : val
					}

					// Evaluate formula columns for current row
					for (const [fCol, expr] of Object.entries(formulaCols)) {
						row[fCol] = this._evalExpr(expr, row)
					}

					rows.push(row)
				}
				result.rows = rows
			} else {
				result.rows = []
			}

			// Variant B: Totals in FrontMatter
			if (meta?.totals && typeof meta.totals === 'object') {
				const totals = {}
				const rows = result.rows || []

				// Helper for aggregate functions like =sum(field)
				const aggregateContext = {
					sum: (field) => {
						const key = typeof field === 'string' ? field : ''
						return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0)
					},
				}

				for (const [totKey, expr] of Object.entries(meta.totals)) {
					if (typeof expr === 'string' && expr.startsWith('=')) {
						const rawExpr = expr.slice(1).trim()
						// Check sum(field) pattern
						const sumMatch = /^sum\(([^)]+)\)$/i.exec(rawExpr)
						if (sumMatch) {
							const colName = sumMatch[1].trim()
							totals[totKey] = aggregateContext.sum(colName)
						} else {
							// Evaluate formula with current totals as scope
							totals[totKey] = this._evalExpr(rawExpr, totals)
						}
					} else {
						totals[totKey] = expr
					}
				}
				result.totals = totals
			}
		} else if (!hasFrontMatter && options.typed !== true) {
			// Plain CSV without FrontMatter: parse into rows
			result.rows = parseCSVObjects(csvBody)
		}

		return result
	}

	/**
	 * Stringifies an array of objects or tabular structure into CSV0 format.
	 * @param {Array<Record<string, any>>} rows
	 * @param {object} [options]
	 * @param {Record<string, any>} [options.columns]
	 * @param {Record<string, any> | boolean} [options.head]
	 * @param {string} [options.title]
	 * @param {Record<string, any>} [options.meta]
	 * @param {boolean} [options.commented] Emit `# ---` commented FrontMatter (Edit CSV compatible)
	 * @returns {string}
	 */
	stringify(rows, options = {}) {
		const fence = options.commented ? '# ---' : '---'
		const commentLine = (/** @type {string} */ l) => (options.commented ? `# ${l}` : l)
		const metaObj = { ...(options.meta || {}) }

		if (options.title && !metaObj.title) {
			metaObj.title = options.title
		}

		let head = options.head !== undefined ? options.head : metaObj.head
		let columns = options.columns || metaObj.columns

		if (head === undefined && columns !== undefined) {
			head = columns
		}

		if (head !== undefined) {
			metaObj.head = head
		} else if (columns !== undefined) {
			metaObj.head = columns
		}

		const columnsConfig = (head && typeof head === 'object') ? head : (columns || {})

		const headers = Object.keys(columnsConfig).length > 0 ? Object.keys(columnsConfig) : Object.keys(rows?.[0] || {})
		const formatInstances = headers.map((h) => {
			const colDef = columnsConfig[h] || 'string'
			return this.resolver.resolveSync(colDef)
		})

		const frontMatter = NaN0.stringify(metaObj).trim()
		const fmLines = [fence, ...frontMatter.split('\n').map(commentLine), fence]

		const hasHeaderRow = head !== false

		const csvLines = []
		if (hasHeaderRow) {
			csvLines.push(headers.join(','))
		}

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
