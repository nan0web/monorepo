import { Model, ModelError } from '@nan0web/types'

/**
 * Embedder — computes text embeddings via an OpenAI-compatible endpoint.
 * Inherits from Model to follow Model-as-Schema v2.
 */
export class Embedder extends Model {
	static UI = {
		errorFetchFailed: 'Embedder fetch failed: {status} {statusText}',
		errorServiceUnavailable:
			'Embedding service is unavailable at {baseURL} ({reason}).\n' +
			'Start a local OpenAI-compatible server (e.g. LM Studio on http://localhost:1234/v1 or Ollama on http://localhost:11434/v1) ' +
			'or pass { baseURL, model } to new Embedder({ baseURL: "http://localhost:1234/v1", model: "{model}" }).',
	}

	static baseURL = {
		help: 'Base URL of the embedding API (without trailing slash)',
		default: 'http://localhost:1234/v1',
	}

	static model = {
		help: 'Embedding model identifier',
		default: 'text-embedding-multilingual-e5-large-instruct',
	}

	/**
	 * @param {Partial<Embedder> & { fetch?: typeof globalThis.fetch } | Record<string, any>} [data] Initial state with optional fetch override
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		// @ts-ignore
		const { fetch: fetchFn, ...rest } = data
		super(rest, options)
		/** @type {string} API root without slash */ this.baseURL = String(this.baseURL).replace(
			/\/$/,
			''
		)
		/** @type {string} Target embedding model ID */ this.model
		/** @type {typeof globalThis.fetch} Fetch platform override */
		this._fetch = fetchFn || globalThis.fetch.bind(globalThis)
	}

	/**
	 * Checks whether the current model is an E5-Instruct variant
	 * that requires query:/passage: prefix injection.
	 * @returns {boolean}
	 */
	isE5Instruct() {
		return /e5[\w-]*instruct/i.test(this.model)
	}

	/**
	 * Conditionally prepends E5-Instruct prefix to input texts.
	 * @param {string[]} texts
	 * @param {{ type?: 'query' | 'passage' }} [opts]
	 * @returns {string[]}
	 */
	prefixInput(texts, opts = {}) {
		if (!this.isE5Instruct() || !opts.type) return texts
		const prefix = opts.type === 'query' ? 'query: ' : 'passage: '
		return texts.map((t) => `${prefix}${t}`)
	}

	/**
	 * Verifies that the embedding service endpoint is reachable before sending payloads.
	 * @returns {Promise<void>}
	 */
	async checkAvailability() {
		let response
		try {
			const signal =
				typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
					? AbortSignal.timeout(3000)
					: undefined
			response = await this._fetch(`${this.baseURL}/models`, {
				method: 'GET',
				...(signal ? { signal } : {}),
			})
		} catch (/** @type {any} */ err) {
			throw new ModelError({ api: this.#formatUnavailable(err?.message || 'connection failed') })
		}
		if (!response.ok) {
			throw new ModelError({
				api: this.#formatUnavailable(`${response.status} ${response.statusText}`.trim()),
			})
		}
	}

	/**
	 * Computes embeddings for single or multiple inputs.
	 * @param {string|string[]} input
	 * @param {{ type?: 'query' | 'passage' }} [opts]
	 * @returns {Promise<number[] | number[][]>}
	 */
	async embed(input, opts) {
		const isArray = Array.isArray(input)
		const texts = isArray ? input : [input]
		const results = await this.embedBatch(texts, opts)
		return isArray ? results : results[0]
	}

	/**
	 * @param {string[]} texts
	 * @param {{ type?: 'query' | 'passage' }} [opts]
	 * @returns {Promise<number[][]>}
	 */
	async embedBatch(texts, opts) {
		if (texts.length === 0) return []
		const prefixed = this.prefixInput(texts, opts)
		let response
		try {
			response = await this._fetch(`${this.baseURL}/embeddings`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: this.model,
					input: prefixed,
				}),
			})
		} catch (/** @type {any} */ err) {
			throw new ModelError({ api: this.#formatUnavailable(err?.message || 'connection failed') })
		}
		if (!response.ok) {
			const errText = await response.text().catch(() => '')
			throw new ModelError({
				api: Embedder.UI.errorFetchFailed,
				$status: response.status,
				$statusText: response.statusText,
				$details: errText,
			})
		}
		const data = await response.json()
		// OpenAI compatible format expects { data: [ { index, embedding } ] }
		const sorted = data.data.sort((a, b) => a.index - b.index)
		return sorted.map((item) => item.embedding)
	}

	/**
	 * @param {string} reason
	 * @returns {string}
	 */
	#formatUnavailable(reason) {
		return Embedder.UI.errorServiceUnavailable
			.replaceAll('{baseURL}', this.baseURL)
			.replaceAll('{model}', this.model)
			.replaceAll('{reason}', reason)
	}
}
