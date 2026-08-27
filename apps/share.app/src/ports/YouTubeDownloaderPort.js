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
	 * Downloads audio from a YouTube/TikTok URL with real-time progress output.
	 * @param {string} url - Video URL.
	 * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
	 * @param {function} [onProgress] - Callback({ percent: number, speed: string, eta: string })
	 * @returns {Promise<{ filePath: string, title: string }>} Path to the downloaded audio and video title.
	 */
	static async downloadAudio(url, outputDir = '/tmp', onProgress, options = {}) {
		let normalizedUrl = url
		if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
			normalizedUrl = `https://${normalizedUrl}`
		}

		const cookieArgs = YouTubeDownloaderPort._getCookiesArgs(options)

		let rawTitle = 'media'
		try {
			const argsTitle = ['--impersonate', 'Chrome-133:Macos-15', '--no-warnings', '--get-title', ...cookieArgs]
			argsTitle.push(`"${normalizedUrl}"`)
			const { stdout } = await execAsync(`yt-dlp ${argsTitle.join(' ')}`)
			if (stdout && stdout.trim()) {
				rawTitle = stdout.trim()
			}
		} catch {
			// Title fetch can fail on TikTok/Instagram due to warnings or anti-bot checks
		}
		const videoId = (url.match(/(?:v=|\/|video\/)([\w-]{11,19})/)?.[1] || Date.now().toString(36))
		const cleanTitle = `${videoId}_${(rawTitle.replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s+/g, '_') || 'audio').slice(0, 50)}`
		const outputPathTemplate = path.join(outputDir, `${cleanTitle}.%(ext)s`)

		return new Promise((resolve, reject) => {
			const args = [
				'--impersonate', 'Chrome-133:Macos-15',
				'--no-warnings',
				'-x', // extract audio
				'--audio-quality', '0', // best quality
				'-o', outputPathTemplate,
				...cookieArgs,
			]
			args.push(normalizedUrl)

			const proc = spawn('yt-dlp', args, {
				stdio: ['ignore', 'pipe', 'pipe'],
			})

			let stderrBuf = ''
			let fullOutputBuf = ''
			const handleData = (chunk) => {
				const text = chunk.toString()
				fullOutputBuf += text
				// Keep only last 1000 chars to avoid memory leaks
				if (fullOutputBuf.length > 2000) fullOutputBuf = fullOutputBuf.slice(-1000)

				stderrBuf += text
				const lines = stderrBuf.split(/\r?\n|\r/)
				stderrBuf = lines.pop() || ''
				if (onProgress) {
					for (const line of lines) {
						const parsed = YouTubeDownloaderPort._parseProgress(line)
						if (parsed) onProgress(parsed)
					}
				}
			}

			proc.stdout.on('data', handleData)
			proc.stderr.on('data', handleData)

			proc.on('close', (code) => {
				if (code === 0) {
					// Find the actual file extension that yt-dlp used (e.g. .m4a, .opus, .mp3, .webm, .wav)
					const files = fs.readdirSync(outputDir)
					const downloadedFile = files.find(f => f.startsWith(cleanTitle + '.') && !f.endsWith('.part') && !f.endsWith('.ytdl'))
					if (downloadedFile) {
						resolve({ filePath: path.join(outputDir, downloadedFile), title: rawTitle })
					} else {
						reject(new Error(`Could not find downloaded file starting with ${cleanTitle} in ${outputDir}\n${fullOutputBuf.trim()}`))
					}
				} else {
					reject(new Error(`yt-dlp exited with code ${code}\n${fullOutputBuf.trim()}`))
				}
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
