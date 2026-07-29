import { ModelAsApp } from '@nan0web/ui-cli'
import { bash } from '../../vendors/bash.js'
import { chunkTranscript, blocksToAss } from '../generation/SubtitleChunker.js'

/**
 * @typedef {object} ShortsGenerateCommandOptions
 * @property {string} [shortsYaml] - Path to shorts configuration file (YAML/JSON/nan0).
 * @property {string} [videoPath] - Path to the input video file.
 * @property {string} [imgPath] - Path to the thumbnail image file.
 * @property {string} [outputDir] - Output directory for generated shorts.
 * @property {string} [transcriptPath] - Path to Whisper JSON transcript for ASS subtitles.
 * @property {boolean} [useHardwareAcceleration=false] - Use h264_videotoolbox on macOS M1.
 * @property {boolean} [auto] - Auto-segment from transcript word timestamps (no YAML needed).
 * @property {number} [autoDuration] - Target duration per short in seconds (default: 30).
 */

export class ShortsGenerateCommand extends ModelAsApp {
	static alias = 'generate:shorts'

	static shortsYaml = {
		type: 'string',
		required: false,
		help: 'Path to shorts configuration file (YAML, JSON, or nan0)',
	}

	static videoPath = {
		type: 'string',
		required: false,
		help: 'Path to the input video file for splitting',
	}

	static imgPath = {
		type: 'string',
		required: false,
		help: 'Path to the thumbnail image file for embedding',
	}

	static outputDir = {
		type: 'string',
		required: false,
		help: 'Output directory for generated shorts',
	}

	static transcriptPath = {
		type: 'string',
		required: false,
		help: 'Path to Whisper JSON transcript for ASS subtitles',
	}

	static useHardwareAcceleration = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Use h264_videotoolbox hardware encoding on macOS M1 (default: true on Apple Silicon)',
	}

	static auto = {
		type: 'boolean',
		required: false,
		help: 'Auto-segment from transcript word timestamps (no YAML needed)',
	}

	static autoDuration = {
		type: 'number',
		required: false,
		default: 30,
		help: 'Target duration per short in seconds (default: 30)',
	}

	/**
	 * @param {ShortsGenerateCommandOptions} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const db = this._.db

		// --- Load segments ---
		let segments = []

		if (this.auto && this.transcriptPath) {
			// Auto-segment mode: read transcript, split by sentence/time boundaries
			const raw = await db.fetch(this.transcriptPath)
			if (!raw) {
				yield { type: 'log', level: 'error', message: `Transcript not found or empty: ${this.transcriptPath}` }
				return { type: 'result', data: { success: false, message: 'Transcript not found' } }
			}
			segments = this._autoSegment(raw, this.autoDuration || 30)
			yield { type: 'log', level: 'info', message: `Auto-segmented into ${segments.length} shorts from transcript` }
		} else if (this.shortsYaml) {
			// Load config via db.fetch — auto-detects .yaml, .yml, .json, .nan0
			const cfg = await db.fetch(this.shortsYaml)
			if (!cfg) {
				yield { type: 'log', level: 'error', message: `shorts config not found: ${this.shortsYaml}` }
				return { type: 'result', data: { success: false, message: 'Config file not found' } }
			}
			segments = cfg.segments || cfg.shorts || []
			if (!Array.isArray(segments) || segments.length === 0) {
				yield { type: 'log', level: 'error', message: 'No segments found in config (expected "segments" or "shorts" array)' }
				return { type: 'result', data: { success: false, message: 'No segments found' } }
			}
			yield { type: 'log', level: 'info', message: `Loaded ${segments.length} segments from config` }
		} else {
			yield { type: 'log', level: 'error', message: 'Provide either --shortsYaml or --auto with --transcriptPath' }
			return { type: 'result', data: { success: false, message: 'Missing input' } }
		}

		// --- Resolve output dir ---
		const outputDir = this.outputDir || 'out-shorts'
		const videoCodec = this.useHardwareAcceleration ? 'h264_videotoolbox' : 'libx264'
		const encOpts = this.useHardwareAcceleration ? '-b:v 5M' : '-preset medium -crf 23'

		// --- Load transcript for subtitles ---
		let transcriptBlocks = null
		if (this.transcriptPath) {
			try {
				const raw = await db.fetch(this.transcriptPath)
				if (raw) {
					transcriptBlocks = chunkTranscript(raw)
					yield { type: 'log', level: 'info', message: `Loaded transcript: ${transcriptBlocks.length} subtitle blocks` }
				}
			} catch (err) {
				yield { type: 'log', level: 'warn', message: `Transcript load failed: ${err.message}` }
			}
		}

		function blocksForRange(startSec, endSec) {
			if (!transcriptBlocks) return null
			return transcriptBlocks.filter(b => b.start >= startSec && b.end <= endSec)
		}

		const generatedFiles = []
		let totalSubs = 0

		for (let i = 0; i < segments.length; i++) {
			const seg = segments[i]
			const label = seg.label || `short_${i + 1}`
			const start = seg.start
			const end = seg.end
			const dur = end - start
			if (start == null || end == null || dur <= 0) {
				yield { type: 'log', level: 'warn', message: `Skip "${label}": invalid time (${start}s-${end}s)` }
				continue
			}

			if (!this.videoPath) {
				generatedFiles.push({ label, start, end, videoPath: null })
				continue
			}

			const inBase = this.videoPath.split('/').pop()?.replace(/\.[^.]+$/, '') || 'video'
			const outVideoRel = `${outputDir}/${inBase}_${label}.mp4`
			const outSubRel = `${outputDir}/${inBase}_${label}.ass`
			const outVideo = db.location(`@app/${outVideoRel}`)
			const outSub = db.location(`@app/${outSubRel}`)

			// Generate ASS for this segment
			let hasSubs = false
			if (transcriptBlocks) {
				const segBlocks = blocksForRange(start, end)
				if (segBlocks && segBlocks.length > 0) {
					await db.saveFile(`@app/${outSubRel}`, blocksToAss(segBlocks))
					hasSubs = true
					totalSubs += segBlocks.length
				}
			}

			// FFmpeg split
			const absVideo = this.videoPath.startsWith('@') ? db.location(this.videoPath) : this.videoPath
			let cmd = `ffmpeg -y -ss ${start} -i "${absVideo}" -t ${dur}`
			if (hasSubs) cmd += ` -vf "ass=${outSub}"`
			cmd += ` -c:v ${videoCodec} ${encOpts} -c:a aac -b:a 128k "${outVideo}"`

			yield { type: 'log', level: 'info', message: `Splitting "${label}" (${start}s-${end}s)...` }

			try {
				const r = await bash({ command: cmd, timeout: 300000 })
				if (r.code !== 0) throw new Error(`FFmpeg exit code ${r.code}`)
			} catch (err) {
				yield { type: 'log', level: 'error', message: `Split "${label}" failed: ${err.message}` }
				continue
			}

			// Embed thumbnail into this segment
			let finalPath = outVideo
			if (this.imgPath) {
				const absImg = this.imgPath.startsWith('@') ? db.location(this.imgPath) : this.imgPath
				const thumbOut = outVideo.replace('.mp4', '_thumb.mp4')
				const tCmd = `ffmpeg -y -i "${outVideo}" -i "${absImg}" -filter_complex "[1:v]trim=duration=1[thumb];[0:v][thumb]overlay=x=(main_w-overlay_w)/2:y=H-h-10[outv]" -map "[outv]" -map 0:a? -c:v ${videoCodec} ${encOpts} -c:a copy "${thumbOut}"`
				try {
					const tr = await bash({ command: tCmd, timeout: 120000 })
					if (tr.code === 0) finalPath = thumbOut
				} catch {
					yield { type: 'log', level: 'warn', message: `Thumbnail failed for "${label}"` }
				}
			}

			generatedFiles.push({ label, start, end, videoPath: finalPath, subtitlePath: hasSubs ? outSub : null })
		}

		yield { type: 'log', level: 'info', message: `Generated ${generatedFiles.filter(f => f.videoPath).length}/${segments.length} shorts, ${totalSubs} subtitle blocks.` }

		return {
			type: 'result',
			data: {
				success: generatedFiles.some(f => f.videoPath),
				count: generatedFiles.filter(f => f.videoPath).length,
				total: segments.length,
				subtitleCount: totalSubs,
				generatedFiles,
				videoCodec,
			},
		}
	}

	/**
	 * Auto-segment a transcript into shorts based on sentence/time boundaries.
	 * @param {object} transcript - Whisper JSON transcript (segments[].words[]).
	 * @param {number} targetDuration - Target seconds per short.
	 * @returns {Array<{label: string, start: number, end: number}>}
	 */
	_autoSegment(transcript, targetDuration) {
		const words = []
		if (transcript.segments) {
			for (const seg of transcript.segments) {
				if (seg.words) words.push(...seg.words)
			}
		} else if (Array.isArray(transcript)) {
			words.push(...transcript)
		}

		if (words.length === 0) return []

		const totalDuration = words[words.length - 1].end
		const numShorts = Math.max(1, Math.ceil(totalDuration / targetDuration))
		const durationPerShort = totalDuration / numShorts

		const segments = []
		for (let i = 0; i < numShorts; i++) {
			const s = Math.round(i * durationPerShort)
			const e = Math.round((i + 1) * durationPerShort)
			// Find sentence boundaries near the cut point
			const label = `short_${i + 1}`
			segments.push({ label, start: s, end: Math.min(e, Math.ceil(totalDuration)) })
		}
		return segments
	}
}
