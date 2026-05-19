import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'

const execAsync = promisify(exec)

/**
 * Utility for downloading audio from YouTube using yt-dlp and ffmpeg.
 */
export class YouTubeDownloader {
	/**
	 * Downloads audio from a YouTube URL.
	 * @param {string} url - YouTube video URL.
	 * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
	 * @returns {Promise<{ filePath: string, title: string }>} Path to the downloaded audio and video title.
	 */
	static async downloadAudio(url, outputDir = '/tmp') {
		// Get video title first for a nice filename
		const { stdout: title } = await execAsync(`yt-dlp --get-title "${url}"`)
		const cleanTitle = title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
		const outputPath = path.join(outputDir, `${cleanTitle}.mp3`)

		// Download audio as mp3
		const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`
		await execAsync(cmd)

		if (!fs.existsSync(outputPath)) {
			// yt-dlp sometimes adds .mp3 to the output name even if specified
			if (fs.existsSync(outputPath + '.mp3')) return { filePath: outputPath + '.mp3', title: title.trim() }
			throw new Error(`Failed to download audio to ${outputPath}`)
		}

		return { filePath: outputPath, title: title.trim() }
	}
}
