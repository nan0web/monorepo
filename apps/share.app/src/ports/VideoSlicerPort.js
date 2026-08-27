import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

/**
 * @typedef {object} CutSegment
 * @property {string} label - Segment identifier/filename base.
 * @property {number} start - Start time in seconds.
 * @property {number} end - End time in seconds.
 * @property {string} [type] - 'episode' | 'short' | etc.
 * @property {string} [aspectRatio] - '16:9' | '9:16'
 */

/**
 * @typedef {object} CutMap
 * @property {number} [version]
 * @property {string} source - Source video path.
 * @property {string} [aspectRatio] - Default aspect ratio (e.g. '16:9').
 * @property {CutSegment[]} segments - List of segments to slice.
 */

/**
 * VideoSlicerPort - FFmpeg-based video cutting & vertical formatting adapter.
 */
export class VideoSlicerPort {
	/**
	 * @param {object} [options]
	 * @param {Function} [options.runner] - Optional custom execution runner (for mocking/testing).
	 */
	constructor(options = {}) {
		this.runner = options.runner || VideoSlicerPort.defaultRunner
	}

	/**
	 * Default child_process runner.
	 * @param {string} cmd
	 * @param {string[]} args
	 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
	 */
	static async defaultRunner(cmd, args) {
		return new Promise((resolve, reject) => {
			const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
			let stdout = ''
			let stderr = ''

			proc.stdout.on('data', (d) => { stdout += d.toString() })
			proc.stderr.on('data', (d) => { stderr += d.toString() })

			proc.on('close', (code) => {
				if (code === 0) resolve({ code, stdout, stderr })
				else reject(new Error(`FFmpeg exited with code ${code}:\n${stderr}`))
			})
			proc.on('error', reject)
		})
	}

	/**
	 * Builds command string list for all segments defined in a cut-map.
	 * @param {CutMap} cutMap
	 * @param {object} [options]
	 * @param {string} [options.outputDir='tmp/output']
	 * @returns {string[]}
	 */
	buildCommands(cutMap, options = {}) {
		const outputDir = options.outputDir || 'tmp/output'
		const source = cutMap.source
		const defaultAspect = cutMap.aspectRatio || '16:9'

		return cutMap.segments.map((seg) => {
			const aspect = seg.aspectRatio || defaultAspect
			const duration = seg.end - seg.start
			const outName = `${seg.label}.mp4`
			const outPath = path.join(outputDir, outName)

			if (aspect === '9:16' || seg.type === 'short') {
				// Vertical format: scale/crop to 1080x1920
				return `ffmpeg -y -ss ${seg.start} -i "${source}" -t ${duration} -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:a aac "${outPath}"`
			}

			// Standard 16:9 episode: fast stream copy
			return `ffmpeg -y -ss ${seg.start} -i "${source}" -t ${duration} -c copy "${outPath}"`
		})
	}

	/**
	 * Slices a video according to cut-map YAML data.
	 * @param {CutMap} cutMap
	 * @param {object} [options]
	 * @param {string} [options.outputDir='tmp/output']
	 * @returns {Promise<Array<{ label: string, outputPath: string, type: string }>>}
	 */
	async slice(cutMap, options = {}) {
		const outputDir = options.outputDir || 'tmp/output'
		if (!fs.existsSync(outputDir)) {
			try {
				fs.mkdirSync(outputDir, { recursive: true })
			} catch {
				// Ignore if running with mock in-memory
			}
		}

		const results = []
		const defaultAspect = cutMap.aspectRatio || '16:9'

		for (const seg of cutMap.segments) {
			const aspect = seg.aspectRatio || defaultAspect
			const duration = seg.end - seg.start
			const outName = `${seg.label}.mp4`
			const outPath = path.join(outputDir, outName)

			let args = []
			if (aspect === '9:16' || seg.type === 'short') {
				args = [
					'-y',
					'-ss', String(seg.start),
					'-i', cutMap.source,
					'-t', String(duration),
					'-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
					'-c:a', 'aac',
					outPath,
				]
			} else {
				args = [
					'-y',
					'-ss', String(seg.start),
					'-i', cutMap.source,
					'-t', String(duration),
					'-c', 'copy',
					outPath,
				]
			}

			await this.runner('ffmpeg', args)
			results.push({
				label: seg.label,
				outputPath: outPath,
				type: seg.type || 'episode',
				aspectRatio: aspect,
			})
		}

		return results
	}
}
