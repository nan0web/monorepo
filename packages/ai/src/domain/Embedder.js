import { Model, ModelError } from '@nan0web/types'

/**
 * Embedder — computes text embeddings via an OpenAI-compatible endpoint.
 * Inherits from Model to follow Model-as-Schema v2.
 */
export class Embedder extends Model {
	static UI = {
		errorFetchFailed: 'Embedder fetch failed: {status} {statusText}',
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
			'',
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
		const response = await this._fetch(`${this.baseURL}/embeddings`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: this.model,
				input: prefixed,
			}),
		})
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
}
