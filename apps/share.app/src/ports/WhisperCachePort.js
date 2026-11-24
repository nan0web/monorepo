import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/**
 * WhisperCachePort — filesystem adapter for Whisper model catalog & Hugging Face hub cache.
 */
export class WhisperCachePort {
	constructor(options = {}) {
		this.cacheDir = options.cacheDir || path.join(os.homedir(), '.cache', 'nan0web')
		this.cacheFile = path.join(this.cacheDir, 'whisper-models.json')
		this.hfHubDir = options.hfHubDir || path.join(os.homedir(), '.cache', 'huggingface', 'hub')
	}

	/**
	 * Check whether a model repo ID exists in local Hugging Face hub cache.
	 * @param {string} repoId
	 * @returns {boolean}
	 */
	isCachedLocally(repoId) {
		if (!repoId) return false
		const dirName = `models--${repoId.replace('/', '--')}`
		try {
			return fs.existsSync(path.join(this.hfHubDir, dirName))
		} catch {
			return false
		}
	}

	/**
	 * Read cached catalog JSON if present and within TTL.
	 * @param {number} ttlMs
	 * @param {boolean} [ignoreTtl=false]
	 * @returns {Array|null}
	 */
	readCache(ttlMs, ignoreTtl = false) {
		try {
			if (!fs.existsSync(this.cacheFile)) return null
			const raw = JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'))
			if (!raw || !Array.isArray(raw.models)) return null
			if (!ignoreTtl && Date.now() - (raw.updatedAt || 0) > ttlMs) return null
			return raw.models
		} catch {
			return null
		}
	}

	/**
	 * Persist catalog JSON to disk cache.
	 * @param {Array} models
	 */
	writeCache(models) {
		try {
			fs.mkdirSync(this.cacheDir, { recursive: true })
			fs.writeFileSync(
				this.cacheFile,
				JSON.stringify({ updatedAt: Date.now(), models }, null, 2),
				'utf-8'
			)
		} catch {}
	}
}
