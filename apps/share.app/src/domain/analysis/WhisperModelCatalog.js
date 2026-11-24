import { fetchMlxWhisperModels, MLX_MODEL_META } from '@nan0web/ai'
import { WhisperCachePort } from '../../ports/WhisperCachePort.js'

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * WhisperModelCatalog — manages available MLX Whisper models,
 * local Hugging Face cache detection, and 7-day JSON catalog caching.
 */
export class WhisperModelCatalog {
	/**
	 * @param {object} [options]
	 * @param {string} [options.cacheDir]
	 * @param {string} [options.hfHubDir]
	 * @param {number} [options.ttlMs]
	 * @param {Function} [options.fetchFn]
	 * @param {WhisperCachePort} [options.cachePort]
	 */
	constructor(options = {}) {
		this.cachePort = options.cachePort || new WhisperCachePort(options)
		this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
		this.fetchFn = options.fetchFn
	}

	/**
	 * Return approximate size label for a known model alias (e.g. 'medium' -> '~1.5 GB').
	 * @param {string} quality
	 * @returns {string|null}
	 */
	static getModelSizeLabel(quality) {
		return MLX_MODEL_META[quality]?.sizeLabel || null
	}

	/**
	 * Check whether a model repo ID exists in local Hugging Face hub cache.
	 * @param {string} repoId
	 * @returns {boolean}
	 */
	isCachedLocally(repoId) {
		return this.cachePort.isCachedLocally(repoId)
	}

	/**
	 * List available MLX Whisper models with local cache status.
	 * @param {object} [options]
	 * @param {boolean} [options.offline=false]
	 * @param {boolean} [options.refresh=false]
	 * @returns {Promise<Array<{ alias: string|null, id: string, sizeBytes: number, sizeLabel: string, isDefault: boolean, cached: boolean }>>}
	 */
	async listModels(options = {}) {
		const offline = Boolean(options.offline)
		const refresh = Boolean(options.refresh)

		let models = !refresh ? this.cachePort.readCache(this.ttlMs, offline) : null
		if (!models) {
			models = await fetchMlxWhisperModels({ offline, fetchFn: this.fetchFn })
			if (!offline && models.length > 0) {
				this.cachePort.writeCache(models)
			}
		}

		return models.map((m) => ({
			...m,
			cached: this.isCachedLocally(m.id),
		}))
	}
}
