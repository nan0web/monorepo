import { ModelAsApp } from '@nan0web/ui-cli'
import { show, result } from '@nan0web/ui'
import { WhisperModelCatalog } from '../analysis/WhisperModelCatalog.js'

/**
 * WhisperModelsCommand — displays available MLX Whisper models, sizes, and local cache status.
 */
export class WhisperModelsCommand extends ModelAsApp {
	static alias = 'whisper:models'

	static refresh = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Refresh models catalog from Hugging Face API',
	}

	static offline = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Use cached or built-in models without network requests',
	}

	/**
	 * @param {object} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { catalog?: WhisperModelCatalog }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} */
		this.refresh
		/** @type {boolean} */
		this.offline
		this.$catalog = options?.catalog || new WhisperModelCatalog()
	}

	/**
	 * Format models list into a readable CLI table.
	 * @param {Array} models
	 * @returns {string}
	 */
	static formatTable(models) {
		const order = ['tiny', 'base', 'small', 'medium', 'large', 'turbo']
		const sorted = [...models].sort((a, b) => {
			const ia = a.alias ? order.indexOf(a.alias) : 999
			const ib = b.alias ? order.indexOf(b.alias) : 999
			if (ia !== ib) return ia - ib
			return (a.id || '').localeCompare(b.id || '')
		})
		const idWidth = Math.max(10, ...sorted.map((m) => (m.id || '').length)) + 2
		const header = `${'Alias'.padEnd(10)} ${'Model ID'.padEnd(idWidth)} ${'Size'.padEnd(10)} ${'Speed'.padEnd(8)} ${'Cached'.padEnd(8)} Notes`
		const sep = '-'.repeat(header.length)
		const rows = sorted.map((m) => {
			const alias = (m.alias || '-').padEnd(10)
			const id = (m.id || '').padEnd(idWidth)
			const size = (m.sizeLabel || 'unknown').padEnd(10)
			const speed = (m.speedLabel || '-').padEnd(8)
			const cached = (m.cached ? 'yes' : 'no').padEnd(8)
			const note = m.isDefault ? '(default)' : ''
			return `${alias} ${id} ${size} ${speed} ${cached} ${note}`.trimEnd()
		})
		return [header, sep, ...rows].join('\n')
	}

	async *run() {
		const models = await this.$catalog.listModels({
			offline: Boolean(this.offline),
			refresh: Boolean(this.refresh),
		})
		yield show('Available MLX Whisper models:', 'info')
		yield show(WhisperModelsCommand.formatTable(models), 'info')
		return result({ status: 'ok', count: models.length, models })
	}
}
