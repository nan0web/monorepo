import { spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

const execAsync = promisify(exec)

/**
 * Utility for downloading audio from YouTube using yt-dlp and ffmpeg.
 */
export class YouTubeDownloader {
	/**
	 * Parses a single line of yt-dlp stderr output for progress data.
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
	 * Downloads audio from a YouTube URL with real-time progress output.
	 * @param {string} url - YouTube video URL.
	 * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
	 * @param {function} [onProgress] - Callback({ percent: number, speed: string, eta: string })
	 * @returns {Promise<{ filePath: string, title: string }>} Path to the downloaded audio and video title.
	 */
	static async downloadAudio(url, outputDir = '/tmp', onProgress) {
		// Get video title first for a nice filename
		const { stdout: title } = await execAsync(`yt-dlp --get-title "${url}"`)
		const cleanTitle = title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
		const outputPath = path.join(outputDir, `${cleanTitle}.mp3`)

		// Download audio as mp3 with real-time progress to stderr
		await new Promise((resolve, reject) => {
			const proc = spawn('yt-dlp', [
				'-x', '--audio-format', 'mp3',
				'--audio-quality', '0',
				'-o', outputPath,
				url,
			], {
				stdio: ['ignore', 'pipe', 'pipe'],
			})

			// Parse yt-dlp stderr for progress
			// yt-dlp writes progress with \r (carriage return), so we buffer and split on \r
			let stderrBuf = ''
			proc.stderr.on('data', (chunk) => {
				stderrBuf += chunk.toString()
				// Split on \r or \n to get individual lines
				const lines = stderrBuf.split(/\r?\n|\r/)
				stderrBuf = lines.pop() || ''  // keep incomplete line
				if (onProgress) {
					for (const line of lines) {
						const parsed = YouTubeDownloader._parseProgress(line)
						if (parsed) onProgress(parsed)
					}
				}
			})

			proc.on('close', (code) => {
				if (code === 0) resolve()
				else reject(new Error(`yt-dlp exited with code ${code}\n${stderrBuf.slice(-500)}`))
			})
			proc.on('error', reject)
		})

		if (!fs.existsSync(outputPath)) {
			// yt-dlp sometimes adds .mp3 to the output name even if specified
			if (fs.existsSync(outputPath + '.mp3')) return { filePath: outputPath + '.mp3', title: title.trim() }
			throw new Error(`Failed to download audio to ${outputPath}`)
		}

		return { filePath: outputPath, title: title.trim() }
	}
}
