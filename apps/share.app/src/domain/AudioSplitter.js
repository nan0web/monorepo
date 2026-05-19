import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'

const execAsync = promisify(exec)

/**
 * Utility for splitting audio files into segments using ffmpeg.
 */
export class AudioSplitter {
	/**
	 * Splits an audio file into fixed-duration segments.
	 * @param {string} inputPath - Path to the input audio file.
	 * @param {Object} options
	 * @param {number} [options.segmentDuration=300] - Duration of each segment in seconds (default 5m).
	 * @param {string} [options.outputDir] - Directory to save segments (defaults to input dir).
	 * @returns {Promise<string[]>} Array of paths to the generated segments.
	 */
	static async split(inputPath, options = {}) {
		const { segmentDuration = 300, outputDir = path.dirname(inputPath) } = options

		if (!fs.existsSync(inputPath)) {
			throw new Error(`Input file not found: ${inputPath}`)
		}

		const baseName = path.basename(inputPath, path.extname(inputPath))
		const segmentPattern = path.join(outputDir, `${baseName}_part_%03d.mp3`)

		// ffmpeg command to split audio without re-encoding (fast)
		// -f segment -segment_time 300 -c copy
		// Note: -c copy is fast but might not be precise on some formats. 
		// If precision is needed, we might need to re-encode.
		const cmd = `ffmpeg -i "${inputPath}" -f segment -segment_time ${segmentDuration} -c copy "${segmentPattern}"`

		try {
			await execAsync(cmd)

			// Find all generated files
			const files = fs.readdirSync(outputDir)
				.filter(f => f.startsWith(`${baseName}_part_`) && f.endsWith('.mp3'))
				.map(f => path.join(outputDir, f))
				.sort()

			return files
		} catch (err) {
			throw new Error(`FFmpeg split error: ${err.message}`)
		}
	}
}
