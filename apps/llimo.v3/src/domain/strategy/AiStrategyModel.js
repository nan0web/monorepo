import { ModelAsApp, show, result, ask } from '@nan0web/ui'

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
		loaded: 'Loaded strategy from .agent/strategy.json',
		loadedGlobal: 'No local strategy found, using global defaults as template',
		saved: 'Strategy saved',
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
			'deepseek/deepseek-v4-flash:free@openrouter',
			'nvidia/nemotron-3-nano-30b-a3b:free@openrouter',
			'openai/gpt-5.4-nano@openrouter'
		],
		type: 'array',
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
	 * Load strategy from database
	 * @param {any} db
	 * @returns {Promise<AiStrategyModel>}
	 */
	static async loadFromDb(db) {
		try {
			const raw = await db.fetch('.agent/strategy.json')
			if (raw && typeof raw === 'object') {
				return new AiStrategyModel(raw)
			}
		} catch {}
		return new AiStrategyModel()
	}

	/**
	 * Save strategy configuration to database
	 * @param {any} db
	 * @returns {Promise<void>}
	 */
	async saveToDb(db) {
		await db.set('.agent/strategy.json', this.toPayload())
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
}

/**
 * StrategyListModel — Read-only display of current strategy.
 */
export class StrategyListModel extends ModelAsApp {
	static alias = 'list'

	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const { t, db } = /** @type {any} */ (this._)
		const strategy = await AiStrategyModel.loadFromDb(db)

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
export class StrategyAddModel extends ModelAsApp {
	static alias = 'add'

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
		const { t, db } = /** @type {any} */ (this._)
		const strategy = await AiStrategyModel.loadFromDb(db)

		let modelId = this.model
		if (!modelId) {
			const res = yield ask('model', StrategyAddModel.model)
			if (res.cancelled) return result({ status: 'cancelled' })
			modelId = String(res.value)
		}

		strategy.cascadeQueue.push(modelId)
		await strategy.saveToDb(db)

		yield show(t(AiStrategyModel.UI.added, { $model: modelId }), 'success')
		return result({ status: 'ok', queue: strategy.cascadeQueue })
	}
}

/**
 * StrategyRemoveModel — Remove a model from the cascade queue.
 */
export class StrategyRemoveModel extends ModelAsApp {
	static alias = 'remove'

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
		const { t, db } = /** @type {any} */ (this._)
		const strategy = await AiStrategyModel.loadFromDb(db)

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
		await strategy.saveToDb(db)

		yield show(t(AiStrategyModel.UI.removed, { $model: modelId }), 'success')
		return result({ status: 'ok', queue: strategy.cascadeQueue })
	}
}

/**
 * StrategyEditModel — Interactive editing of the full strategy.
 */
export class StrategyEditModel extends ModelAsApp {
	static alias = 'edit'

	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const { t, db } = /** @type {any} */ (this._)
		const strategy = await AiStrategyModel.loadFromDb(db)

		const res = yield ask('strategy', AiStrategyModel, {
			value: strategy.toPayload()
		})
		if (res.cancelled) {
			yield show(t(AiStrategyModel.UI.noChanges), 'info')
			return result({ status: 'cancelled' })
		}

		const updated = new AiStrategyModel(res.value || res.body || {})
		await updated.saveToDb(db)

		yield show(t(AiStrategyModel.UI.saved), 'success')
		return result({ status: 'ok', strategy: updated.toPayload() })
	}
}

/**
 * StrategyApp — Nested app for strategy subcommands.
 */
export class StrategyApp extends ModelAsApp {
	static alias = 'strategy'
	static UI = {
		title: 'AI Strategy Management',
	}

	static command = {
		help: 'Strategy subcommand to run',
		options: [
			StrategyListModel,
			StrategyRemoveModel,
			StrategyAddModel,
			StrategyEditModel,
		],
		positional: true,
		default: StrategyListModel,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {any} */ this.command
	}

	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}
		return yield* this.command.run()
	}
}
