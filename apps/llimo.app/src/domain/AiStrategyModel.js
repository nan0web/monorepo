import { Model } from '@nan0web/types'
import { ModelAsApp, show, ask, result } from '@nan0web/ui'
import { FileSystem } from '../utils/FileSystem.js'

/** @type {string} */
const CONFIG_PATH = '.agent/strategy.nan0'

/**
 * AiStrategyModel — Model-as-Schema representing cascade, budgeting, failover options, and timeouts for LLiMo execution.
 *
 * @property {string[]} cascadeQueue Priority target queue of models to attempt.
 * @property {number} budgetLimitUsd Hard cost limit for this execution.
 * @property {number} timeoutMs Target model response timeout limit.
 * @property {number} failoverLimit Maximum cascade failovers allowed.
 * @property {number} retryCount Immediate transient error retry attempts before fallback.
 * @property {string[]} fallbackCodes Error codes triggering next fallback in cascade.
 * @property {number} concurrencyLimit Max number of parallel subagents.
 * @property {string} cachingMode Cache resolution strategy.
 */
export class AiStrategyModel extends ModelAsApp {
	static alias = 'strategy'

	static UI = {
		title: 'AI Strategy Configuration',
		loaded: 'Loaded strategy from {$path}',
		loadedGlobal: 'No local strategy found, using global defaults as template',
		saved: 'Strategy saved to {$path}',
		noChanges: 'No changes made',
		currentQueue: 'Current cascade queue:',
		added: 'Added model: {$model}',
		removed: 'Removed model: {$model}',
		notFound: 'Model not found in queue: {$model}',
		moved: 'Moved {$model} from position {$from} to {$to}',
		invalidPosition: 'Invalid position: {$pos} (queue has {$length} items)',
	}

	static cascadeQueue = {
		help: 'Priority target queue of models (array)',
		default: [
			'gpt-oss-120b@cerebras',
			'glm-4.7@cerebras',
			'llama3.1-8b@cerebras',
			'grok-2@openrouter',
			'meta-llama/llama-3.3-70b-instruct@openrouter',
			'anthropic/claude-3.5-sonnet@openrouter'
		],
		type: 'array',
		hint: 'sortable',
		selectHint: 'table-select',
		columns: [
			{ key: 'label', label: 'Model.ID' },
			{ key: 'context', label: 'Context' },
			{ key: 'provider', label: 'Provider' },
			{ key: 'modality', label: 'Modality' },
			{ key: 'priceIn', label: 'Price in' },
			{ key: 'priceOut', label: 'Price out' },
		]
	}

	static budgetLimitUsd = {
		help: 'Hard cost limit for this execution in USD',
		default: 2.00,
		type: 'number'
	}

	static timeoutMs = {
		help: 'Response timeout limit per model call in milliseconds',
		default: 60000,
		type: 'number'
	}

	static failoverLimit = {
		help: 'Maximum cascade failovers allowed',
		default: 3,
		type: 'number'
	}

	static failbackCodes = {
		help: 'Error codes/triggers for fallback',
		default: ['429', '402', 'TIMEOUT', '503', 'error'],
		type: 'array'
	}

	static retryCount = {
		help: 'Immediate error retries before next fallback',
		default: 1,
		type: 'number'
	}

	static fallbackCodes = {
		help: 'Error codes/triggers for fallback',
		default: ['429', '402', 'TIMEOUT', '503', 'error'],
		type: 'array'
	}

	static concurrencyLimit = {
		help: 'Max number of parallel subagents allowed',
		default: 1,
		type: 'number'
	}

	static cachingMode = {
		help: 'Cache resolution mode (none, memory, persist)',
		default: 'persist',
		type: 'string'
	}

	static command = {
		help: 'Subcommand (edit, list, add, remove, move)',
		options: [],
		positional: true,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		this.cascadeQueue = data.cascadeQueue ? [...data.cascadeQueue] : [...AiStrategyModel.cascadeQueue.default]
		this.budgetLimitUsd = Number(data.budgetLimitUsd ?? AiStrategyModel.budgetLimitUsd.default)
		this.timeoutMs = Number(data.timeoutMs ?? AiStrategyModel.timeoutMs.default)
		this.failoverLimit = Number(data.failoverLimit ?? AiStrategyModel.failoverLimit.default)
		this.retryCount = Number(data.retryCount ?? AiStrategyModel.retryCount.default)
		this.fallbackCodes = data.fallbackCodes ?? AiStrategyModel.fallbackCodes.default
		this.concurrencyLimit = Number(data.concurrencyLimit ?? AiStrategyModel.concurrencyLimit.default)
		this.cachingMode = data.cachingMode ?? AiStrategyModel.cachingMode.default
	}

	/**
	 * Load strategy from local .agent/strategy.nan0 or fall back to global defaults.
	 * @param {FileSystem} [fs]
	 * @returns {Promise<{strategy: AiStrategyModel, source: string}>}
	 */
	static async loadFromProject(fs) {
		const lfs = fs || new FileSystem()
		try {
			const raw = await lfs.load(CONFIG_PATH)
			if (raw && typeof raw === 'object') {
				return { strategy: new AiStrategyModel(raw), source: 'local' }
			}
		} catch {}
		return { strategy: new AiStrategyModel(), source: 'default' }
	}

	/**
	 * Save strategy to local .agent/strategy.nan0.
	 * @param {FileSystem} [fs]
	 * @returns {Promise<void>}
	 */
	async saveToProject(fs) {
		const lfs = fs || new FileSystem()
		await this.saveTemplate(CONFIG_PATH, lfs)
	}

	/**
	 * Get serializable payload for persistence.
	 * @returns {Record<string, any>}
	 */
	toPayload() {
		return {
			cascadeQueue: this.cascadeQueue,
			budgetLimitUsd: this.budgetLimitUsd,
			timeoutMs: this.timeoutMs,
			failoverLimit: this.failoverLimit,
			retryCount: this.retryCount,
			fallbackCodes: this.fallbackCodes,
			concurrencyLimit: this.concurrencyLimit,
			cachingMode: this.cachingMode
		}
	}

	/**
	 * Load template from .nan0 file
	 * @param {string} path 
	 * @param {FileSystem} fs 
	 * @returns {Promise<AiStrategyModel>}
	 */
	static async loadTemplate(path, fs) {
		const raw = await fs.load(path)
		return new AiStrategyModel(raw || {})
	}

	/**
	 * Save strategy configuration as .nan0 template
	 * @param {string} path 
	 * @param {FileSystem} fs 
	 * @returns {Promise<void>}
	 */
	async saveTemplate(path, fs) {
		await fs.save(path, this.toPayload())
	}
}

/**
 * StrategyListModel — Read-only display of current strategy.
 */
export class StrategyListModel extends Model {
	static alias = 'strategy:list'

	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const { t, fs } = /** @type {any} */ (this._)
		const { strategy, source } = await AiStrategyModel.loadFromProject(fs)

		if (source === 'default') {
			yield show(t(AiStrategyModel.UI.loadedGlobal), 'warn')
		} else {
			yield show(t(AiStrategyModel.UI.loaded, { $path: CONFIG_PATH }), 'info')
		}

		yield show(t(AiStrategyModel.UI.currentQueue), 'info')
		for (let i = 0; i < strategy.cascadeQueue.length; i++) {
			yield show(`  ${i + 1}. ${strategy.cascadeQueue[i]}`)
		}
		yield show(`  budgetLimitUsd: $${strategy.budgetLimitUsd}`)
		yield show(`  timeoutMs: ${strategy.timeoutMs}ms`)
		yield show(`  failoverLimit: ${strategy.failoverLimit}`)
		yield show(`  retryCount: ${strategy.retryCount}`)
		yield show(`  fallbackCodes: ${strategy.fallbackCodes.join(', ')}`)
		yield show(`  concurrencyLimit: ${strategy.concurrencyLimit}`)
		yield show(`  cachingMode: ${strategy.cachingMode}`)

		return result({ status: 'ok', strategy: strategy.toPayload() })
	}
}

/**
 * StrategyAddModel — Add a model to the cascade queue.
 */
export class StrategyAddModel extends Model {
	static alias = 'strategy:add'

	static model = {
		help: 'Model ID to add (e.g. gpt-oss-120b@cerebras)',
		default: '',
		positional: true,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.model = data.model || ''
	}

	async *run() {
		const { t, fs } = /** @type {any} */ (this._)
		const { strategy } = await AiStrategyModel.loadFromProject(fs)

		let modelId = this.model
		if (!modelId) {
			const res = yield ask('model', StrategyAddModel.model)
			if (res.cancelled) return result({ status: 'cancelled' })
			modelId = String(res.value)
		}

		strategy.cascadeQueue.push(modelId)
		await strategy.saveToProject(fs)

		yield show(t(AiStrategyModel.UI.added, { $model: modelId }), 'success')
		yield show(t(AiStrategyModel.UI.saved, { $path: CONFIG_PATH }), 'success')

		return result({ status: 'ok', queue: strategy.cascadeQueue })
	}
}

/**
 * StrategyRemoveModel — Remove a model from the cascade queue.
 */
export class StrategyRemoveModel extends Model {
	static alias = 'strategy:remove'

	static model = {
		help: 'Model ID to remove',
		default: '',
		positional: true,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.model = data.model || ''
	}

	async *run() {
		const { t, fs } = /** @type {any} */ (this._)
		const { strategy } = await AiStrategyModel.loadFromProject(fs)

		let modelId = this.model
		if (!modelId) {
			const res = yield ask('model', {
				help: 'Select model to remove',
				options: strategy.cascadeQueue.map((m, i) => ({ value: m, label: `${i + 1}. ${m}` }))
			})
			if (res.cancelled) return result({ status: 'cancelled' })
			modelId = String(res.value)
		}

		const idx = strategy.cascadeQueue.indexOf(modelId)
		if (idx === -1) {
			yield show(t(AiStrategyModel.UI.notFound, { $model: modelId }), 'error')
			return result({ status: 'error' })
		}

		strategy.cascadeQueue.splice(idx, 1)
		await strategy.saveToProject(fs)

		yield show(t(AiStrategyModel.UI.removed, { $model: modelId }), 'success')
		yield show(t(AiStrategyModel.UI.saved, { $path: CONFIG_PATH }), 'success')

		return result({ status: 'ok', queue: strategy.cascadeQueue })
	}
}

/**
 * StrategyMoveModel — Move a model to a different position in the cascade queue.
 */
export class StrategyMoveModel extends Model {
	static alias = 'strategy:move'

	static model = {
		help: 'Model ID to move',
		default: '',
		positional: true,
	}

	static position = {
		help: 'Target position (1-based index)',
		default: 0,
		type: 'number',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.model = data.model || ''
		/** @type {number} */ this.position = Number(data.position || 0)
	}

	async *run() {
		const { t, fs } = /** @type {any} */ (this._)
		const { strategy } = await AiStrategyModel.loadFromProject(fs)

		let modelId = this.model
		if (!modelId) {
			const res = yield ask('model', {
				help: 'Select model to move',
				options: strategy.cascadeQueue.map((m, i) => ({ value: m, label: `${i + 1}. ${m}` }))
			})
			if (res.cancelled) return result({ status: 'cancelled' })
			modelId = String(res.value)
		}

		const fromIdx = strategy.cascadeQueue.indexOf(modelId)
		if (fromIdx === -1) {
			yield show(t(AiStrategyModel.UI.notFound, { $model: modelId }), 'error')
			return result({ status: 'error' })
		}

		let targetPos = this.position
		if (!targetPos) {
			const res = yield ask('position', StrategyMoveModel.position)
			if (res.cancelled) return result({ status: 'cancelled' })
			targetPos = Number(res.value)
		}

		const toIdx = targetPos - 1
		if (toIdx < 0 || toIdx >= strategy.cascadeQueue.length) {
			yield show(t(AiStrategyModel.UI.invalidPosition, { $pos: String(targetPos), $length: String(strategy.cascadeQueue.length) }), 'error')
			return result({ status: 'error' })
		}

		// Remove from old position and insert at new
		strategy.cascadeQueue.splice(fromIdx, 1)
		strategy.cascadeQueue.splice(toIdx, 0, modelId)
		await strategy.saveToProject(fs)

		yield show(t(AiStrategyModel.UI.moved, { $model: modelId, $from: String(fromIdx + 1), $to: String(toIdx + 1) }), 'success')
		yield show(t(AiStrategyModel.UI.saved, { $path: CONFIG_PATH }), 'success')

		return result({ status: 'ok', queue: strategy.cascadeQueue })
	}
}

/**
 * StrategyEditModel — Interactive editing of the full strategy (default subcommand).
 */
export class StrategyEditModel extends Model {
	static alias = 'strategy:edit'

	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const { t, fs } = /** @type {any} */ (this._)
		const { strategy, source } = await AiStrategyModel.loadFromProject(fs)

		if (source === 'default') {
			yield show(t(AiStrategyModel.UI.loadedGlobal), 'warn')
		} else {
			yield show(t(AiStrategyModel.UI.loaded, { $path: CONFIG_PATH }), 'info')
		}

		const { progress } = await import('@nan0web/ui')
		yield progress('Loading models...', undefined, { id: 'load-models', type: 'spinner' })
		let modelOptions = []
		try {
			const { ModelProvider } = await import('../llm/ModelProvider.js')
			const provider = new ModelProvider({ fs })
			const modelMap = await provider.getAll()
			modelOptions = Array.from(modelMap.entries()).map(([key, info]) => {
				const pricing = info.pricing
				return {
					value: key,
					label: info.id || key,
					context: info.context_length ? `${Math.round(info.context_length / 1000)}Kt` : '—',
					provider: info.provider || '—',
					modality: info.architecture?.modality || 'text',
					priceIn: pricing?.prompt ? `$${pricing.prompt.toFixed(2)}` : '—',
					priceOut: pricing?.completion ? `$${pricing.completion.toFixed(2)}` : '—',
				}
			})
			yield progress('Loaded models successfully', undefined, { id: 'load-models', stop: 'success' })
		} catch (err) {
			const error = /** @type {any} */ (err)
			yield progress(`Failed to load models: ${error.message}`, undefined, { id: 'load-models', stop: 'error' })
		}

		const res = yield ask('strategy', AiStrategyModel, {
			options: {
				cascadeQueue: modelOptions
			}
		})
		if (res.cancelled) {
			yield show(t(AiStrategyModel.UI.noChanges), 'info')
			return result({ status: 'cancelled' })
		}

		const updated = new AiStrategyModel(res.value || res.body || {})
		await updated.saveToProject(fs)

		yield show(t(AiStrategyModel.UI.saved, { $path: CONFIG_PATH }), 'success')

		return result({ status: 'ok', strategy: updated.toPayload() })
	}
}
