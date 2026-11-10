import { ModelAsApp, result, show, progress } from '@nan0web/ui'
import { FastApiDiscovery } from '../ast/FastApiDiscovery.js'

/**
 * FastApiApp — CLI subcommand to inspect API skeleton/contracts from AST.
 */
export class FastApiApp extends ModelAsApp {
	static alias = 'api'

	static UI = {
		title: '⚡ Fast API Discovery (AST Contractor)',
		description: 'Extracts minimalist API outline and method/field contracts without bodies.',
		reading: 'Reading API contract for {path}...',
		error_no_db: 'Database not initialized in context.',
		error_missing_path: 'Please provide a file or path to inspect.',
	}

	static path = {
		type: 'string',
		help: 'Path to source or declaration file (.d.ts / .js)',
		positional: true,
		default: '',
	}

	static level = {
		type: 'string',
		help: 'Level of inspection depth: classes | methods | fields | all',
		default: 'all',
	}

	static only = {
		type: 'string',
		help: 'Filter entities: static | async | methods | fields',
		default: '',
	}

	static style = {
		type: 'string',
		help: 'Outline detail style: short (method(...) # desc) | full (Variant C dictionary with params/result)',
		default: 'short',
	}

	static includeDeps = {
		type: 'boolean',
		help: 'Include imported external dependencies',
		default: false,
	}

	static format = {
		type: 'string',
		help: 'Output format: nano | json',
		default: 'nano',
	}

	/**
	 * @param {Partial<FastApiApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to source or declaration file (.d.ts / .js) */ this.path
		/** @type {string} Level of inspection depth: classes | methods | fields | all */ this.level
		/** @type {string} Filter entities: static | async | methods | fields */ this.only
		/** @type {string} Outline detail style: short (method(...) # desc) | full (Variant C dictionary with params/result) */ this
			.style
		/** @type {boolean} Include imported external dependencies */ this.includeDeps
		/** @type {string} Output format: nano | json */ this.format
	}

	/**
	 * Execute Fast API inspection.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		const targetPath = this.path || this.dir || ''
		if (!targetPath) {
			yield show(t(FastApiApp.UI.error_missing_path, 'error'))
			return result({ ok: false, error: 'MISSING_PATH' })
		}

		const discovery = new FastApiDiscovery({}, { db: this.$db })

		// Multiple files detection or glob could trigger progress indicator
		const isMultiple = targetPath.includes('*') || targetPath.includes(',')
		if (isMultiple) {
			yield progress(t(FastApiApp.UI.reading, { path: targetPath }), 0, 'api-discovery')
		}

		const extracted = await discovery.extractFromFile(targetPath, {
			level: this.level,
			only: this.only || undefined,
			includeDeps: this.includeDeps,
		})

		if (isMultiple) {
			yield progress('', 100, { id: 'api-discovery', stop: 'success' })
		}

		const outline =
			this.format === 'json'
				? JSON.stringify(
						discovery.toContractObject(extracted, { style: /** @type {any} */ (this.style) }),
						null,
						2
					)
				: discovery.stringify(extracted, { style: /** @type {any} */ (this.style) })

		yield show(outline, 'info')

		return result({
			ok: true,
			outline,
			extracted,
		})
	}
}
