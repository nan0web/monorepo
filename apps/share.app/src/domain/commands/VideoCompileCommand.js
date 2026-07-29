import { ModelAsApp } from '@nan0web/ui-cli'
import { ResultIntent } from '../Models.js'
import { bash } from '../../vendors/bash.js'
import path from 'node:path'
import fs from 'node:fs'

/**
 * @typedef {object} VideoCompileCommandOptions
 * @property {string} episodeDir - Base directory for the episode.
 * @property {string} [sourceVideoPath] - Path to the source video file (if sourceType is 'video').
 * @property {string} [sourceAudioPath] - Path to the source audio file (if sourceType is 'audio').
 * @property {string} [sourceTextPath] - Path to the source text file (if sourceType is 'text').
 * @property {string} [subtitlePath] - Path to the subtitle file (e.g., .ass).
 * @property {string} [shortsDir] - Directory containing generated shorts if splitting was done.
 * @property {string} [outputPath] - Optional output path for the compiled video.
 * @property {boolean} [useHardwareAcceleration=false] - Use h264_videotoolbox on macOS M1.
 */

export class VideoCompileCommand extends ModelAsApp {
	static alias = 'compile:video'

	static episodeDir = {
		type: 'string',
		required: true,
		help: 'Base directory for the episode.',
	}

	static sourceVideoPath = {
		type: 'string',
		required: false,
		help: 'Path to the source video file.',
	}

	static sourceAudioPath = {
		type: 'string',
		required: false,
		help: 'Path to the source audio file.',
	}

	static sourceTextPath = {
		type: 'string',
		required: false,
		help: 'Path to the source text file.',
	}

	static subtitlePath = {
		type: 'string',
		required: false,
		help: 'Path to the subtitle file (e.g., .ass)',
	}

	static shortsDir = {
		type: 'string',
		required: false,
		help: 'Directory containing generated shorts if splitting was done.',
	}

	static outputPath = {
		type: 'string',
		required: false,
		help: 'Optional output path for the compiled video',
	}

	static useHardwareAcceleration = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Use h264_videotoolbox hardware encoding on macOS M1 (default: true on Apple Silicon)',
	}

	/**
	 * Resolves the video codec and encoder options string.
	 * @returns {{ codec: string, opts: string }}
	 */
	_getVideoEncoder() {
		if (this.useHardwareAcceleration) {
			return {
				codec: 'h264_videotoolbox',
				opts: '-b:v 5M',
			}
		}
		return {
			codec: 'libx264',
			opts: '-preset medium -crf 23',
		}
	}

	/**
	 * @param {VideoCompileCommandOptions} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const enc = this._getVideoEncoder()

		// Determine the primary input source and construct FFmpeg command
		let ffmpegCommand = `ffmpeg -y `
		let inputFiles = []
		let filterComplex = ''
		let hasAudio = false
		let hasVideo = false

		// Case 1: Shorts were generated and provided in shortsDir
		if (this.shortsDir) {
			hasVideo = true
			const shortsFiles = await this.getFilesFromDirectory(this.shortsDir, '.mp4')

			if (shortsFiles.length === 0) {
				yield { type: 'log', level: 'error', message: `No video files found in shortsDir: ${this.shortsDir}` }
				return { type: 'result', data: { success: false, message: `No video files found in shortsDir: ${this.shortsDir}` } }
			}

			shortsFiles.forEach((file, index) => {
				inputFiles.push(`-i "${file}"`)
				filterComplex += `[${index}:v]`
			})

			if (this.subtitlePath && fs.existsSync(this.subtitlePath)) {
				inputFiles.push(`-i "${this.subtitlePath}"`)
				const subtitleIndex = inputFiles.length - 1
				shortsFiles.forEach((_, index) => {
					filterComplex += `subtitles=${this.subtitlePath}:force_style='Fontname=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,MarginV=10',si=${subtitleIndex}[v${index}];`
				})
				filterComplex = filterComplex.slice(0, -1) + 'concat=n=' + shortsFiles.length + ':v=1:a=0[outv]'
			} else {
				filterComplex += `concat=n=${shortsFiles.length}:v=1:a=0[outv]`
			}
			hasAudio = true

			ffmpegCommand += `-filter_complex "${filterComplex}" -map "[outv]" -c:v ${enc.codec} ${enc.opts} -c:a aac `

		} else if (this.sourceVideoPath) {
			// Case 2: Single source video file
			hasVideo = true
			hasAudio = true
			inputFiles.push(`-i "${this.sourceVideoPath}"`)

			if (this.subtitlePath && fs.existsSync(this.subtitlePath)) {
				inputFiles.push(`-vf "subtitles=${this.subtitlePath}:force_style='Fontname=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,MarginV=10'`)
			}

			// If re-encode is needed (subtitles or HW accel), use encoder.
			// Otherwise, copy streams.
			if (this.subtitlePath || this.useHardwareAcceleration) {
				ffmpegCommand += `-c:v ${enc.codec} ${enc.opts} -c:a aac -b:a 128k `
			} else {
				ffmpegCommand += `-c:v copy -c:a copy `
			}

		} else if (this.sourceAudioPath) {
			// Case 3: Source audio file, convert to video with black background
			hasAudio = true
			inputFiles.push(`-i "${this.sourceAudioPath}"`)
			ffmpegCommand += `-f lavfi -i color=c=black:s=1920x1080:r=1 -shortest `
			ffmpegCommand += `-filter_complex "[0:a][1:v]format=yuv420p[outv]" -map "[outv]" -c:v ${enc.codec} ${enc.opts} -c:a aac `

		} else if (this.sourceTextPath) {
			yield { type: 'log', level: 'warn', message: 'Compiling video from text source is not fully implemented yet.' }
			return { type: 'result', data: { success: false, message: 'Text to video compilation not implemented.' } }
		} else {
			yield { type: 'log', level: 'error', message: 'No valid source provided (video, audio, or shortsDir).' }
			return { type: 'result', data: { success: false, message: 'No valid source provided.' } }
		}

		// --- Determine output path ---
		let finalOutputPath = this.outputPath
		if (!finalOutputPath) {
			const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
			finalOutputPath = path.join(this.episodeDir, `compiled_video_${timestamp}.mp4`)
		}

		// Add input files to the command
		ffmpegCommand += inputFiles.join(' ')

		// Add trailing output path
		ffmpegCommand += ` "${finalOutputPath}"`

		const hwTag = this.useHardwareAcceleration ? ' [HW: videotoolbox]' : ''
		yield {
			type: 'log',
			level: 'info',
			message: `Executing FFmpeg command${hwTag}: ${ffmpegCommand}`,
		}

		try {
			const result = await bash({ command: ffmpegCommand, timeout: 600000 })

			if (result.code !== 0) {
				throw new Error(`FFmpeg command failed with code ${result.code}. Stderr: ${result.stderr}`)
			}

			yield {
				type: 'log',
				level: 'info',
				message: `FFmpeg compilation successful. Output: ${finalOutputPath}`,
			}

			return {
				type: 'result',
				data: {
					success: true,
					outputPath: finalOutputPath,
					videoCodec: enc.codec,
					useHardwareAcceleration: this.useHardwareAcceleration,
					message: `Video compilation completed successfully${hwTag}.`,
				},
			}
		} catch (error) {
			yield {
				type: 'log',
				level: 'error',
				message: `FFmpeg compilation failed: ${error.message}`,
			}
			return { type: 'result', data: { success: false, message: error.message } }
		}
	}

	async getFilesFromDirectory(dirPath, extension) {
		if (!fs.existsSync(dirPath)) {
			return []
		}
		const files = fs.readdirSync(dirPath)
		return files
			.filter(file => file.endsWith(extension))
			.map(file => path.join(dirPath, file))
	}
}
