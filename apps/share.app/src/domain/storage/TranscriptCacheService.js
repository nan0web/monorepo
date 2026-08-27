import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/**
 * TranscriptCacheService - Manages hierarchical disk-mirrored caching of transcripts.
 * Default location: ~/.nan0web/share.app/transcripts/
 */
export class TranscriptCacheService {
	/**
	 * @param {object} [options]
	 * @param {string} [options.baseDir]
	 */
	constructor(options = {}) {
		const defaultHome = os.homedir()
		this.baseDir = options.baseDir || path.join(defaultHome, '.nan0web', 'share.app')
		this.transcriptsDir = path.join(this.baseDir, 'transcripts')
	}

	/**
	 * Generates hierarchical mirrored path for a given media file path.
	 * e.g. /Volumes/MyHDD/video.mov -> ~/.nan0web/share.app/transcripts/Volumes/MyHDD/video.json
	 * @param {string} filePath
	 * @param {string} [ext='json']
	 * @returns {string}
	 */
	getCachePath(filePath, ext = 'json') {
		const parsed = path.parse(filePath)
		// Strip root slash for hierarchical nesting
		const cleanDir = parsed.dir.replace(/^[/\\]+/, '')
		return path.join(this.transcriptsDir, cleanDir, `${parsed.name}.${ext}`)
	}

	/**
	 * Checks if transcript cache exists for file.
	 * @param {string} filePath
	 * @param {string} [ext='json']
	 * @returns {boolean}
	 */
	has(filePath, ext = 'json') {
		const target = this.getCachePath(filePath, ext)
		return fs.existsSync(target)
	}

	/**
	 * Saves transcript object or string to cache.
	 * @param {string} filePath
	 * @param {object|string} data
	 * @param {string} [ext='json']
	 * @returns {string} Path where cache was saved
	 */
	save(filePath, data, ext = 'json') {
		const target = this.getCachePath(filePath, ext)
		const targetDir = path.dirname(target)
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true })
		}

		const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
		fs.writeFileSync(target, content, 'utf8')
		return target
	}

	/**
	 * Loads transcript from cache.
	 * @param {string} filePath
	 * @param {string} [ext='json']
	 * @returns {object|string|null}
	 */
	load(filePath, ext = 'json') {
		const target = this.getCachePath(filePath, ext)
		if (!fs.existsSync(target)) return null
		const content = fs.readFileSync(target, 'utf8')
		if (ext === 'json') {
			try {
				return JSON.parse(content)
			} catch {
				return null
			}
		}
		return content
	}
}
