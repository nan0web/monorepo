import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * SubtitleMuxerPort - Embeds soft-subtitles into video files (Stream Copy) and handles safe atomic file replacement.
 */
export class SubtitleMuxerPort {
	/**
	 * Builds FFmpeg command for stream copy muxing based on container format.
	 * @param {object} params
	 * @param {string} params.inputVideo
	 * @param {string} params.subtitlePath
	 * @param {string} params.outputPath
	 * @param {string} [params.language='uk']
	 * @returns {string}
	 */
	buildMuxCommand({ inputVideo, subtitlePath, outputPath, language = 'uk' }) {
		const ext = path.extname(inputVideo).toLowerCase()

		let subCodec = 'mov_text'
		if (ext === '.mkv') {
			subCodec = 'srt'
		}

		return `ffmpeg -y -i "${inputVideo}" -i "${subtitlePath}" -c:v copy -c:a copy -c:s ${subCodec} -metadata:s:s:0 language=${language} "${outputPath}"`
	}

	/**
	 * Muxes subtitle into a new video file.
	 * @param {object} params
	 * @param {string} params.inputVideo
	 * @param {string} params.subtitlePath
	 * @param {string} params.outputPath
	 * @param {string} [params.language='uk']
	 * @returns {boolean}
	 */
	muxSoftSubtitles({ inputVideo, subtitlePath, outputPath, language = 'uk' }) {
		const cmd = this.buildMuxCommand({ inputVideo, subtitlePath, outputPath, language })
		try {
			execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] })
			return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0
		} catch {
			return false
		}
	}

	/**
	 * Safely replaces original file with temp file only if temp file passes validation.
	 * Removes temp file if validation fails.
	 * @param {object} params
	 * @param {string} params.originalPath
	 * @param {string} params.tempPath
	 * @param {Function} [params.validator]
	 * @returns {boolean}
	 */
	safeAtomicReplace({ originalPath, tempPath, validator }) {
		if (!fs.existsSync(tempPath)) return false

		const isValid = validator
			? validator(tempPath)
			: fs.statSync(tempPath).size > 0

		if (!isValid) {
			try {
				fs.unlinkSync(tempPath)
			} catch {}
			return false
		}

		try {
			// Atomic rename
			fs.renameSync(tempPath, originalPath)
			return true
		} catch {
			return false
		}
	}
}
