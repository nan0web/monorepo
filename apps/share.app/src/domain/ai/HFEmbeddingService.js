/**
 * HFEmbeddingService - Client for generating text embeddings via Hugging Face Spaces / Inference API.
 */
export class HFEmbeddingService {
	/**
	 * @param {object} [options]
	 * @param {string} [options.spaceUrl]
	 * @param {string} [options.token]
	 */
	constructor(options = {}) {
		this.spaceUrl =
			options.spaceUrl ||
			process.env.HF_EMBEDDING_URL ||
			'https://api-inference.huggingface.co/models/BAAI/bge-m3'
		this.token = options.token || process.env.HF_TOKEN || ''
	}

	/**
	 * Formats standard payload for HF feature-extraction pipeline.
	 * @param {string|string[]} inputs
	 * @returns {object}
	 */
	buildRequestPayload(inputs) {
		const arr = Array.isArray(inputs) ? inputs : [inputs]
		return {
			inputs: arr,
			options: { wait_for_model: true },
		}
	}

	/**
	 * Generates embedding vector for a single text chunk.
	 * @param {string} text
	 * @returns {Promise<number[]>}
	 */
	async embed(text) {
		const batch = await this.embedBatch([text])
		return batch[0] || []
	}

	/**
	 * Generates embeddings for a batch of text chunks.
	 * @param {string[]} texts
	 * @returns {Promise<number[][]>}
	 */
	async embedBatch(texts) {
		if (!texts || texts.length === 0) return []

		const payload = this.buildRequestPayload(texts)
		const headers = { 'Content-Type': 'application/json' }
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`
		}

		const res = await fetch(this.spaceUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			const errText = await res.text().catch(() => '')
			throw new Error(`HF Spaces error ${res.status}: ${errText}`)
		}

		return await res.json()
	}
}
