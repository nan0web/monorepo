import { execSync } from 'node:child_process'
import fs from 'node:fs'

/**
 * MediaInspectorService - Analyzes media files using ffprobe to detect streams, codecs, and embedded soft-subtitles.
 */
export class MediaInspectorService {
	/**
	 * Runs ffprobe on file and returns parsed JSON metadata.
	 * @param {string} filePath
	 * @returns {object|null}
	 */
	probe(filePath) {
		if (!fs.existsSync(filePath)) return null
		try {
			const cmd = `ffprobe -v error -show_entries stream=index,codec_type,codec_name:stream_tags=language,title -of json "${filePath}"`
			const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
			return JSON.parse(stdout)
		} catch {
			return null
		}
	}

	/**
	 * Analyzes ffprobe output object.
	 * @param {object} probeOutput
	 * @returns {{ hasVideo: boolean, hasAudio: boolean, hasSubtitles: boolean, subtitleStreams: Array<{ index: number, codec: string, language: string, title: string }> }}
	 */
	analyzeStreams(probeOutput) {
		if (!probeOutput || !Array.isArray(probeOutput.streams)) {
			return { hasVideo: false, hasAudio: false, hasSubtitles: false, subtitleStreams: [] }
		}

		let hasVideo = false
		let hasAudio = false
		const subtitleStreams = []

		for (const s of probeOutput.streams) {
			if (s.codec_type === 'video') hasVideo = true
			if (s.codec_type === 'audio') hasAudio = true
			if (s.codec_type === 'subtitle') {
				subtitleStreams.push({
					index: s.index,
					codec: s.codec_name || 'unknown',
					language: s.tags?.language || s.tags?.LANGUAGE || 'und',
					title: s.tags?.title || '',
				})
			}
		}

		return {
			hasVideo,
			hasAudio,
			hasSubtitles: subtitleStreams.length > 0,
			subtitleStreams,
		}
	}

	/**
	 * Checks if media file already contains embedded subtitle streams.
	 * @param {string} filePath
	 * @returns {boolean}
	 */
	hasSubtitles(filePath) {
		const raw = this.probe(filePath)
		return this.analyzeStreams(raw).hasSubtitles
	}

	/**
	 * Extracts embedded subtitles from video to an external file.
	 * @param {string} filePath
	 * @param {string} outPath
	 * @param {number} [streamIndex=0]
	 * @returns {boolean}
	 */
	extractSubtitles(filePath, outPath, streamIndex = 0) {
		try {
			const cmd = `ffmpeg -y -i "${filePath}" -map 0:s:${streamIndex} "${outPath}"`
			execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] })
			return fs.existsSync(outPath) && fs.statSync(outPath).size > 0
		} catch {
			return false
		}
	}

	/**
	 * Gets general media info.
	 * @param {string} filePath
	 * @returns {object}
	 */
	getVideoMeta(filePath) {
		const raw = this.probe(filePath)
		return this.analyzeStreams(raw)
	}
}
