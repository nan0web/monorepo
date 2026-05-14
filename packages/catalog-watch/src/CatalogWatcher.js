import event from '@nan0web/event'
import { CatalogWatcherModel } from './domain/CatalogWatcherModel.js'

/**
 * @file CatalogWatcher — EventEmitter-based client adapter.
 *
 * Bridges CatalogWatcherModel (agnostic logic) to real browser/Node.js environment:
 * - Real `fetch` API
 * - Real `setInterval` / `setTimeout` for polling
 * - @nan0web/event EventBus for emitting: 'updated', 'unchanged', 'error'
 *
 * Zero hardcoded UI text — all messages come from CatalogWatcherModel.UI.
 *
 * @example
 * import { CatalogWatcher } from '@nan0web/catalog-watch'
 *
 * const watcher = new CatalogWatcher({
 *   url: 'https://bank.example.com/@catalog/uk/cards.index.txt',
 *   interval: 3600,
 * })
 * watcher.on('updated', (index) => { console.log('New version:', index.version) })
 * watcher.on('unchanged', () => { console.log('No changes') })
 * watcher.on('error', (err) => { console.error(err) })
 * watcher.start()
 */
export class CatalogWatcher {
	/** @type {CatalogWatcherModel} */
	#model

	/** @type {ReturnType<typeof event>} */
	#bus

	/** @type {ReturnType<typeof setInterval>|null} */
	#timer = null

	/** @type {boolean} */
	#running = false

	/**
	 * @param {Partial<CatalogWatcherModel> & { url: string }} options
	 */
	constructor(options) {
		this.#model = new CatalogWatcherModel({
			...options,
			autoConfirm: options.autoConfirm ?? true, // Default: headless mode
		})
		this.#bus = event()
	}

	// ─── EventBus delegation ───

	/**
	 * @param {'updated'|'unchanged'|'error'} event
	 * @param {Function} fn
	 */
	on(event, fn) {
		this.#bus.on(event, fn)
		return this
	}

	/**
	 * @param {'updated'|'unchanged'|'error'} event
	 * @param {Function} fn
	 */
	off(event, fn) {
		this.#bus.off(event, fn)
		return this
	}

	// ─── Lifecycle ───

	/** Start periodic polling. */
	start() {
		if (this.#running) return this
		this.#running = true

		// Immediate first check
		this.checkNow()

		// Set up periodic polling
		this.#timer = setInterval(() => {
			this.checkNow()
		}, this.#model.interval * 1000)

		return this
	}

	/** Stop polling. */
	stop() {
		this.#running = false
		if (this.#timer) {
			clearInterval(this.#timer)
			this.#timer = null
		}
		return this
	}

	/** Force an immediate check. */
	async checkNow() {
		const env = {
			fetch: globalThis.fetch.bind(globalThis),
		}

		const gen = this.#model.check(env)
		let step = await gen.next()

		while (!step.done) {
			if (step.value.type === 'ask') {
				// Auto-confirm in adapter mode
				step = await gen.next({ value: true })
			} else {
				step = await gen.next()
			}
		}

		const data = step.value?.data
		if (!data) return

		if (data.updated && data.downloaded) {
			await this.#bus.emit('updated', data.index)
		} else if (data.updated && !data.downloaded) {
			await this.#bus.emit('updated', { updated: true, downloaded: false })
		} else if (data.error) {
			await this.#bus.emit('error', { error: data.error })
		} else {
			await this.#bus.emit('unchanged')
		}
	}

	// ─── Accessors ───

	/** @returns {string} Current watcher status */
	get status() {
		return this.#model.status
	}

	/** @returns {string} Last check timestamp */
	get lastCheck() {
		return this.#model.lastCheck
	}

	/** @returns {string} Last known hash */
	get lastHash() {
		return this.#model.lastHash
	}

	/** @returns {string} Watched URL */
	get url() {
		return this.#model.url
	}

	/** @returns {number} Polling interval in seconds */
	get interval() {
		return this.#model.interval
	}
}
