import { ModelAsApp } from '@nan0web/ui'

/**
 * YouTubeDownloader domain model (Model-as-App).
 * Platform-agnostic domain application controller for media download capability.
 */
export class YouTubeDownloader extends ModelAsApp {
	static alias = 'youtube:download'

	static url = { help: 'Video or audio URL to download', type: 'string', required: true }
	static outputDir = { help: 'Directory path for output files', type: 'string', default: '/tmp' }

	/** @type {string} */ url
	/** @type {string} */ outputDir

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Video or audio URL to download */ this.url
		/** @type {string} Directory path for output files */ this.outputDir
	}

	/**
	 * Parses a single line of yt-dlp stderr output for progress data.
	 * Pure domain helper.
	 * @param {string} line
	 * @returns {{ percent: number, speed: string, eta: string } | null}
	 */
	static _parseProgress(line) {
		const m = line.match(/\[download\]\s+([\d.]+)%/)
		if (!m) return null
		const pct = parseFloat(m[1])
		const speedM = line.match(/at\s+([\d.]+[KMG]?i?B\/s)/)
		const etaM = line.match(/ETA\s+(\S+)/)
		return {
			percent: pct,
			speed: speedM ? speedM[1] : '',
			eta: etaM ? etaM[1] : '',
		}
	}

	/**
	 * Resolves port and downloads audio.
	 * @param {string} url - Video URL.
	 * @param {string} [outputDir='/tmp'] - Target directory.
	 * @param {function} [onProgress] - Progress callback.
	 * @param {Object} [options] - Options context containing injected port.
	 * @returns {Promise<{ filePath: string, title: string }>}
	 */
	static async downloadAudio(url, outputDir = '/tmp', onProgress, options = {}) {
		let port = options.downloader || options._?.downloader
		if (!port) {
			const { YouTubeDownloaderPort } = await import('../ports/YouTubeDownloaderPort.js')
			port = YouTubeDownloaderPort
		}
		return port.downloadAudio(url, outputDir, onProgress, options)
	}
}
