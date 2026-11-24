import { YouTubeDownloader } from '../domain/YouTubeDownloader.js'
import { spawn, exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'

const execAsync = promisify(exec)

/**
 * Node.js Port extending YouTubeDownloader domain ModelAsApp.
 */
export class YouTubeDownloaderPort extends YouTubeDownloader {
	/**
	 * Downloads audio from a URL with real-time progress output.
	 * @param {string} url - Video URL.
	 * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
	 * @param {function} [onProgress] - Callback({ percent: number, speed: string, eta: string })
	 * @param {object} [options]
	 * @returns {Promise<{ filePath: string, title: string }>}
	 */
	static async downloadAudio(url, outputDir = '/tmp', onProgress, options = {}) {
		return YouTubeDownloaderPort._download(url, outputDir, onProgress, options, false)
	}

	/**
	 * Downloads video (with audio) from a URL as MP4 with real-time progress output.
	 * @param {string} url - Video URL.
	 * @param {string} [outputDir='/tmp'] - Directory to save the video file.
	 * @param {function} [onProgress] - Callback({ percent: number, speed: string, eta: string })
	 * @param {object} [options] - Optional { cookies, filename }
	 * @returns {Promise<{ filePath: string, title: string }>}
	 */
	static async downloadVideo(url, outputDir = '/tmp', onProgress, options = {}) {
		return YouTubeDownloaderPort._download(url, outputDir, onProgress, options, true)
	}

	/**
	 * Shared yt-dlp runner for audio or video downloads.
	 * @param {string} url
	 * @param {string} outputDir
	 * @param {function} [onProgress]
	 * @param {object} [options]
	 * @param {boolean} isVideo
	 * @returns {Promise<{ filePath: string, title: string }>}
	 */
	static async _download(url, outputDir = '/tmp', onProgress, options = {}, isVideo = false) {
		const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`
		const cookieArgs = YouTubeDownloaderPort._getCookiesArgs(options)
		const rawTitle = await YouTubeDownloaderPort._fetchTitle(normalizedUrl, cookieArgs)
		const videoId = (url.match(/(?:v=|\/|video\/)([\w-]{11,19})/)?.[1] || Date.now().toString(36))
		const safeName = (rawTitle.replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s+/g, '_') || 'media').slice(0, 50)
		const filePrefix = options.filename || `${videoId}_${safeName}`
		const outputPathTemplate = path.join(outputDir, `${filePrefix}.%(ext)s`)
		const modeArgs = isVideo
			? ['--merge-output-format', 'mp4']
			: ['-x', '--audio-quality', '0']
		const args = ['--impersonate', 'Chrome-133:Macos-15', '--no-warnings', ...modeArgs, '-o', outputPathTemplate, ...cookieArgs, normalizedUrl]
		return YouTubeDownloaderPort._spawnDownload(args, outputDir, filePrefix, rawTitle, onProgress)
	}

	/**
	 * @param {string} normalizedUrl
	 * @param {string[]} cookieArgs
	 * @returns {Promise<string>}
	 */
	static async _fetchTitle(normalizedUrl, cookieArgs) {
		try {
			const argsTitle = ['--impersonate', 'Chrome-133:Macos-15', '--no-warnings', '--get-title', ...cookieArgs, `"${normalizedUrl}"`]
			const { stdout } = await execAsync(`yt-dlp ${argsTitle.join(' ')}`)
			if (stdout && stdout.trim()) return stdout.trim()
		} catch {
			// Title fetch can fail on social platforms due to warnings or anti-bot checks
		}
		return 'media'
	}

	/**
	 * @param {string[]} args
	 * @param {string} outputDir
	 * @param {string} filePrefix
	 * @param {string} rawTitle
	 * @param {function} [onProgress]
	 * @returns {Promise<{ filePath: string, title: string }>}
	 */
	static _spawnDownload(args, outputDir, filePrefix, rawTitle, onProgress) {
		return new Promise((resolve, reject) => {
			const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] })
			let stderrBuf = ''
			let fullOutputBuf = ''
			const handleData = (chunk) => {
				const text = chunk.toString()
				fullOutputBuf += text
				if (fullOutputBuf.length > 2000) fullOutputBuf = fullOutputBuf.slice(-1000)
				stderrBuf += text
				const lines = stderrBuf.split(/\r?\n|\r/)
				stderrBuf = lines.pop() || ''
				if (!onProgress) return
				for (const line of lines) {
					const parsed = YouTubeDownloaderPort._parseProgress(line)
					if (parsed) onProgress(parsed)
				}
			}
			proc.stdout.on('data', handleData)
			proc.stderr.on('data', handleData)
			proc.on('close', (code) => {
				if (code !== 0) return reject(new Error(`yt-dlp exited with code ${code}\n${fullOutputBuf.trim()}`))
				const files = fs.readdirSync(outputDir)
				const downloaded = files.find(f => f.startsWith(`${filePrefix}.`) && !f.endsWith('.part') && !f.endsWith('.ytdl'))
				if (!downloaded) return reject(new Error(`Could not find downloaded file starting with ${filePrefix} in ${outputDir}\n${fullOutputBuf.trim()}`))
				resolve({ filePath: path.join(outputDir, downloaded), title: rawTitle })
			})
			proc.on('error', reject)
		})
	}

	/**
	 * Resolves cookie flags for yt-dlp.
	 * Supports browser names ('chrome', 'safari'), local file paths ('./cookies.txt'), or Netscape string content.
	 * @param {object} [options]
	 * @returns {string[]}
	 */
	static _getCookiesArgs(options = {}) {
		const cookies = options.cookies || process.env.COOKIES_FILE || process.env.COOKIES
		if (!cookies) return []

		if (fs.existsSync(cookies)) {
			return ['--cookies', path.resolve(cookies)]
		}

		if (typeof cookies === 'string' && cookies.includes('\t') && cookies.includes('TRUE')) {
			const tempCookiesPath = path.join(process.cwd(), 'tmp', 'temp_cookies.txt')
			fs.mkdirSync(path.dirname(tempCookiesPath), { recursive: true })
			fs.writeFileSync(tempCookiesPath, cookies)
			return ['--cookies', tempCookiesPath]
		}

		return ['--cookies-from-browser', cookies]
	}
}
