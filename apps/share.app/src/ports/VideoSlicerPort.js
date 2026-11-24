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
	 * Parse string of scene specs with alignments and offsets.
	 * Examples: "code=left+100,chat=right-50,present=center+30" or "code=960x1080+0+0"
	 * @param {string} specStr
	 * @returns {Record<string, { align?: string, offsetX?: number, box?: string }>}
	 */
	static parseSceneSpecs(specStr) {
		const result = {}
		if (!specStr || typeof specStr !== 'string') return result

		const items = specStr.split(',')
		for (const item of items) {
			const [rawKey, rawVal] = item.split(/[=:]/)
			if (!rawKey || !rawVal) continue
			const key = rawKey.trim()
			const val = rawVal.trim()

			if (val.includes('x') && val.includes('+')) {
				result[key] = { box: val }
				continue
			}

			// Match align with optional offset: e.g. "left+100", "right-50", "center+20", "left"
			const match = val.match(/^([a-z]+)(?:([+-]\d+))?/i)
			if (match) {
				const align = match[1].toLowerCase()
				const offsetX = match[2] ? parseInt(match[2], 10) : undefined
				result[key] = { align, ...(offsetX !== undefined ? { offsetX } : {}) }
			} else {
				result[key] = { align: val }
			}
		}
		return result
	}

	/**
	 * Builds FFmpeg video filter for vertical 9:16 crop with alignment and pixel offset.
	 * @param {object} options
	 * @param {string} [options.align='center'] - 'left' | 'right' | 'center'
	 * @param {number} [options.offsetX=0] - Pixel offset X
	 * @param {string} [options.crop] - Explicit crop expression override
	 * @param {number} [options.targetWidth=1080]
	 * @param {number} [options.targetHeight=1920]
	 * @returns {string}
	 */
	buildCropFilter(options = {}) {
		if (options.crop) return options.crop

		const align = options.align || 'center'
		const offset = Number(options.offsetX) || 0
		const targetW = options.targetWidth || 1080
		const targetH = options.targetHeight || 1920

		let cropX
		if (align === 'left' || align === 'start') {
			cropX = offset !== 0 ? `min(max(0\\,${offset})\\,in_w-out_w)` : '0'
		} else if (align === 'right' || align === 'end') {
			cropX = offset !== 0
				? (offset < 0 ? `in_w-out_w${offset}` : `in_w-out_w+${offset}`)
				: 'in_w-out_w'
		} else {
			cropX = offset !== 0
				? (offset > 0 ? `(in_w-out_w)/2+${offset}` : `(in_w-out_w)/2${offset}`)
				: '(in_w-out_w)/2'
		}

		return `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH}:${cropX}`
	}

	/**
	 * Extracts a single frame snapshot with 9:16 crop filter applied for instant preview.
	 * @param {object} options
	 * @param {string} options.source - Path to video file
	 * @param {number} options.time - Timestamp in seconds
	 * @param {string} options.outputPath - Destination path for preview .jpg/.png
	 * @param {string} [options.align='center']
	 * @param {number} [options.offsetX=0]
	 * @param {string} [options.crop]
	 * @returns {Promise<{ outputPath: string, time: number }>}
	 */
	async captureFramePreview(options) {
		const { source, time = 0, outputPath, align = 'center', offsetX = 0, crop } = options
		if (!source || !outputPath) {
			throw new Error('source and outputPath are required for frame preview')
		}
		const outDir = path.dirname(outputPath)
		if (!fs.existsSync(outDir)) {
			try { fs.mkdirSync(outDir, { recursive: true }) } catch {}
		}

		const vf = this.buildCropFilter({ align, offsetX, crop })
		const args = [
			'-y',
			'-ss', String(time),
			'-i', source,
			'-vf', vf,
			'-vframes', '1',
			'-q:v', '2',
			outputPath
		]
		await this.runner('ffmpeg', args)
		return { outputPath, time }
	}

	/**
	 * Builds FFmpeg command to stitch an array of clips with xfade and acrossfade transitions.
	 * @param {Array<{ path: string, duration: number }>} clips
	 * @param {object} options
	 * @param {string} options.outputPath
	 * @param {string} [options.transition='fade']
	 * @param {number} [options.transitionDuration=0.5]
	 * @param {boolean} [options.acrossfade=true]
	 * @param {number} [options.audioTransitionDuration]
	 * @param {string} [options.videoCodec='libx264']
	 * @param {string} [options.audioCodec='aac']
	 * @returns {string}
	 */
	buildStitchCommand(clips, options = {}) {
		const {
			outputPath,
			transition = 'fade',
			transitionDuration = 0.5,
			acrossfade = true,
			audioTransitionDuration = transitionDuration,
			videoCodec = 'libx264',
			audioCodec = 'aac',
		} = options

		if (!clips || clips.length === 0) {
			throw new Error('No clips provided for stitching')
		}
		if (!outputPath) {
			throw new Error('outputPath is required for stitching')
		}

		// Single clip: direct copy/transcode
		if (clips.length === 1) {
			return `ffmpeg -y -i "${clips[0].path}" -c copy "${outputPath}"`
		}

		const inputs = clips.map((c) => `-i "${c.path}"`).join(' ')
		const vFilters = []
		const aFilters = []

		let currentOffset = clips[0].duration - transitionDuration

		// Build video xfade chain
		for (let i = 1; i < clips.length; i++) {
			const prevV = i === 1 ? '[0:v]' : `[v_xfade_${i - 1}]`
			const nextV = `[${i}:v]`
			const outV = i === clips.length - 1 ? '[v_out]' : `[v_xfade_${i}]`

			vFilters.push(
				`${prevV}${nextV}xfade=transition=${transition}:duration=${transitionDuration}:offset=${Number(currentOffset.toFixed(2))}${outV}`
			)

			if (i < clips.length - 1) {
				currentOffset = currentOffset + clips[i].duration - transitionDuration
			}
		}

		// Build audio chain: acrossfade or straight concat
		if (acrossfade) {
			for (let i = 1; i < clips.length; i++) {
				const prevA = i === 1 ? '[0:a]' : `[a_fade_${i - 1}]`
				const nextA = `[${i}:a]`
				const outA = i === clips.length - 1 ? '[a_out]' : `[a_fade_${i}]`

				aFilters.push(
					`${prevA}${nextA}acrossfade=d=${audioTransitionDuration}${outA}`
				)
			}
		} else {
			const inAudio = clips.map((_, idx) => `[${idx}:a]`).join('')
			aFilters.push(`${inAudio}concat=n=${clips.length}:v=0:a=1[a_out]`)
		}

		const filterComplex = [...vFilters, ...aFilters].join(';')
		return `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -map "[v_out]" -map "[a_out]" -c:v ${videoCodec} -pix_fmt yuv420p -c:a ${audioCodec} "${outputPath}"`
	}

	/**
	 * Stitches an array of clips into one file using xfade and acrossfade.
	 * @param {Array<{ path: string, duration: number }>} clips
	 * @param {object} options
	 * @param {string} options.outputPath
	 * @param {string} [options.transition='fade']
	 * @param {number} [options.transitionDuration=0.5]
	 * @param {boolean} [options.acrossfade=true]
	 * @param {number} [options.audioTransitionDuration]
	 * @param {string} [options.videoCodec='libx264']
	 * @param {string} [options.audioCodec='aac']
	 * @returns {Promise<{ outputPath: string, duration: number }>}
	 */
	async stitch(clips, options = {}) {
		const {
			outputPath,
			transition = 'fade',
			transitionDuration = 0.5,
			acrossfade = true,
			audioTransitionDuration = transitionDuration,
			videoCodec = 'libx264',
			audioCodec = 'aac',
		} = options

		if (!clips || clips.length === 0) {
			throw new Error('No clips provided for stitching')
		}

		const outDir = path.dirname(outputPath)
		if (!fs.existsSync(outDir)) {
			try {
				fs.mkdirSync(outDir, { recursive: true })
			} catch {}
		}

		if (clips.length === 1) {
			await this.runner('ffmpeg', ['-y', '-i', clips[0].path, '-c', 'copy', outputPath])
			return { outputPath, duration: clips[0].duration }
		}

		const args = ['-y']
		for (const c of clips) {
			args.push('-i', c.path)
		}

		const vFilters = []
		const aFilters = []
		let currentOffset = clips[0].duration - transitionDuration

		for (let i = 1; i < clips.length; i++) {
			const prevV = i === 1 ? '[0:v]' : `[v_xfade_${i - 1}]`
			const nextV = `[${i}:v]`
			const outV = i === clips.length - 1 ? '[v_out]' : `[v_xfade_${i}]`

			vFilters.push(
				`${prevV}${nextV}xfade=transition=${transition}:duration=${transitionDuration}:offset=${Number(currentOffset.toFixed(2))}${outV}`
			)

			if (i < clips.length - 1) {
				currentOffset = currentOffset + clips[i].duration - transitionDuration
			}
		}

		if (acrossfade) {
			for (let i = 1; i < clips.length; i++) {
				const prevA = i === 1 ? '[0:a]' : `[a_fade_${i - 1}]`
				const nextA = `[${i}:a]`
				const outA = i === clips.length - 1 ? '[a_out]' : `[a_fade_${i}]`

				aFilters.push(
					`${prevA}${nextA}acrossfade=d=${audioTransitionDuration}${outA}`
				)
			}
		} else {
			const inAudio = clips.map((_, idx) => `[${idx}:a]`).join('')
			aFilters.push(`${inAudio}concat=n=${clips.length}:v=0:a=1[a_out]`)
		}

		const filterComplex = [...vFilters, ...aFilters].join(';')
		args.push(
			'-filter_complex', filterComplex,
			'-map', '[v_out]',
			'-map', '[a_out]',
			'-c:v', videoCodec,
			'-pix_fmt', 'yuv420p',
			'-c:a', audioCodec,
			outputPath
		)

		await this.runner('ffmpeg', args)

		const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0) - ((clips.length - 1) * transitionDuration)
		return { outputPath, duration: Number(totalDuration.toFixed(2)) }
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

			if (aspect === '9:16' || seg.type === 'short' || seg.type === 'scene') {
				const vf = this.buildCropFilter({
					align: seg.align,
					offsetX: seg.offsetX,
					crop: seg.crop,
				})
				return `ffmpeg -y -ss ${seg.start} -i "${source}" -t ${duration} -vf "${vf}" -c:a aac "${outPath}"`
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
			if (aspect === '9:16' || seg.type === 'short' || seg.type === 'scene') {
				const vf = this.buildCropFilter({
					align: seg.align,
					offsetX: seg.offsetX,
					crop: seg.crop,
				})
				args = [
					'-y',
					'-ss', String(seg.start),
					'-i', cutMap.source,
					'-t', String(duration),
					'-vf', vf,
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

