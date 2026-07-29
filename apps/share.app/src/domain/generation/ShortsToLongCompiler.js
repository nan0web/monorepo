import { bash } from '../../vendors/bash.js'
import path from 'node:path'
import fs from 'node:fs'
import { ResultIntent } from '../Models.js'

/**
 * ShortsToLongCompiler
 *
 * Concatenates an array of vertical Shorts (9:16) into one long horizontal (16:9) video.
 * Uses FFmpeg boxblur to fill side bands, with the original Short centered on top.
 *
 * Apple Silicon M1 note: use h264_videotoolbox for hardware-accelerated encoding.
 */

/**
 * @typedef {object} CompileOptions
 * @property {Array<string>} shortsPaths - Array of paths to short video files (9:16).
 * @property {string} outputPath - Path for the compiled long video.
 * @property {number} [targetWidth=1920] - Output video width (16:9).
 * @property {number} [targetHeight=1080] - Output video height (16:9).
 * @property {boolean} [useHardwareAcceleration=false] - Use h264_videotoolbox on macOS M1.
 * @property {number} [blurRadius=20] - Boxblur radius for side bands.
 * @property {boolean} [keepTempFiles=false] - Keep intermediate pre-processed files.
 */

export class ShortsToLongCompiler {
	/**
	 * @param {CompileOptions} options
	 */
	constructor(options = {}) {
		this.shortsPaths = options.shortsPaths || []
		this.outputPath = options.outputPath
		this.targetWidth = options.targetWidth ?? 1920
		this.targetHeight = options.targetHeight ?? 1080
		this.useHardwareAcceleration = options.useHardwareAcceleration ?? false
		this.blurRadius = options.blurRadius ?? 20
		this.keepTempFiles = options.keepTempFiles ?? false
	}

	/**
	 * Compiles all shorts into a single long 16:9 video.
	 * @returns {Promise<ResultIntent & { outputPath: string, duration: number }>}
	 */
	async compile() {
		if (!this.shortsPaths || this.shortsPaths.length === 0) {
			throw new Error('No shorts provided for compilation')
		}
		if (!this.outputPath) {
			throw new Error('outputPath is required')
		}

		const outputDir = path.dirname(this.outputPath)
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}

		const videoCodec = this.useHardwareAcceleration ? 'h264_videotoolbox' : 'libx264'
		const encOpts = this.useHardwareAcceleration ? '-b:v 5M' : '-preset medium -crf 23'

		// Step 1: Pre-process each short — scale+blur background + overlay original
		const tempDir = path.join(outputDir, '.shorts2long_tmp')
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

		const processedClips = []
		let totalDuration = 0

		for (let i = 0; i < this.shortsPaths.length; i++) {
			const shortPath = this.shortsPaths[i]
			if (!fs.existsSync(shortPath)) {
				throw new Error(`Short file not found: ${shortPath}`)
			}

			const processedPath = path.join(tempDir, `processed_${i}.mp4`)
			processedClips.push(processedPath)

			// Get short dimensions
			const probeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of csv=s=,:p=0 "${shortPath}"`
			let probeResult
			try {
				probeResult = await bash({ command: probeCmd, timeout: 10000 })
			} catch (err) {
				throw new Error(`Failed to probe short ${i}: ${err.message}`)
			}

			const [w, h, dur] = (probeResult.stdout || '').trim().split(',').map(Number)
			if (!w || !h) {
				throw new Error(`Could not get dimensions for short ${i}`)
			}
			totalDuration += dur || 10 // fallback duration

			// FFmpeg filter_complex for boxblur side bands:
			// 1. Scale input to fill 16:9 (may crop)
			// 2. Blur it heavily
			// 3. Scale original to fit vertically centered in 9:16 mode on 16:9 canvas
			// 4. Overlay centered
			//
			// Alternative simpler approach (from next.md):
			// scale short to full width 16:9, blur, overlay original centered
			//
			// [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=20:5[bground];
			// [0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2[over];
			// [bground][over]overlay=(W-w)/2:(H-h)/2

			const s = this.targetWidth
			const blurFilter = `boxblur=${this.blurRadius}:5`

			// For vertical (9:16) input:
			// Background: scale to fill 1920x1080 then blur
			// Foreground: scale so height=1080, then pad to 1920x1080 centered
			const filterComplex =
				`[0:v]scale=${this.targetWidth}:${this.targetHeight}:force_original_aspect_ratio=increase,crop=${this.targetWidth}:${this.targetHeight},${blurFilter}[bground];` +
				`[0:v]scale=-1:${this.targetHeight}:force_original_aspect_ratio=decrease,pad=${this.targetWidth}:${this.targetHeight}:(ow-iw)/2:(oh-ih)/2[over];` +
				`[bground][over]overlay=(W-w)/2:(H-h)/2[outv]`

			const cmd = `ffmpeg -y -i "${shortPath}" -filter_complex "${filterComplex}" -map "[outv]" -map 0:a? -c:v ${videoCodec} ${encOpts} -c:a aac -b:a 128k "${processedPath}"`

			try {
				const r = await bash({ command: cmd, timeout: 300000 })
				if (r.code !== 0) throw new Error(`FFmpeg exit code ${r.code} for short ${i}`)
			} catch (err) {
				throw new Error(`Failed to pre-process short ${i}: ${err.message}`)
			}
		}

		// Step 2: Concatenate all processed clips
		const concatFile = path.join(tempDir, 'concat_list.txt')
		const concatContent = processedClips.map(p => `file '${p}'`).join('\n')
		fs.writeFileSync(concatFile, concatContent, 'utf-8')

		const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c:v ${videoCodec} ${encOpts} -c:a aac -b:a 128k "${this.outputPath}"`

		try {
			const r = await bash({ command: concatCmd, timeout: 600000 })
			if (r.code !== 0) throw new Error(`Concat failed with code ${r.code}`)
		} catch (err) {
			throw new Error(`Failed to concatenate shorts: ${err.message}`)
		}

		// Step 3: Cleanup temp files unless keepTempFiles is set
		if (!this.keepTempFiles && fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}

		return ResultIntent.from({
			ok: true,
			code: 200,
			success: true,
			outputPath: this.outputPath,
			duration: totalDuration,
			shortCount: this.shortsPaths.length,
		})
	}
}