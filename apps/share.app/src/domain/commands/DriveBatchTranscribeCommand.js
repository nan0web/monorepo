import { ModelAsApp, progress, show, result } from '@nan0web/ui-cli'
import { TranscriptCacheService } from '../storage/TranscriptCacheService.js'
import { MediaInspectorService } from '../analysis/MediaInspectorService.js'
import { SubtitleMuxerPort } from '../pipeline/SubtitleMuxerPort.js'
import { MediaDownloadModel } from '../MediaDownloadModel.js'
import fs from 'node:fs'
import path from 'node:path'

/**
 * DriveBatchTranscribeCommand - Batch processes media on a disk/folder:
 * inspects existing subtitles, transcribes via Whisper, muxes soft-subtitles,
 * and caches transcripts in ~/.nan0web/share.app/transcripts/
 */
export class DriveBatchTranscribeCommand extends ModelAsApp {
	static alias = 'drive:batch-transcribe'

	static UI = {
		title: 'Drive Batch Media Processing & Soft-Subtitle Muxing',
		scanningDir: '🔍 Scanning directory for video files: {dir}...',
		foundVideos: 'Found {total} video files ({cached} cached, {needProcessing} to process)',
		inspectingFile: '🔎 [{current}/{total}] Inspecting: {name}...',
		hasSubtitlesSkipping: '⏭️ [{current}/{total}] {name} already has embedded subtitles. Skipping mux.',
		cachedTranscript: '⚡ [{current}/{total}] Using cached transcript for {name}',
		transcribing: '🎙️ [{current}/{total}] Transcribing {name} via Whisper ({model})...',
		transcriptionDone: '✅ [{current}/{total}] Transcribed & cached {name}',
		muxingSubtitles: '🎬 [{current}/{total}] Muxing soft-subtitles into {name}...',
		muxDone: '✅ [{current}/{total}] Soft-subtitles muxed into {name}',
		allCompleted: '🎉 Batch processing completed! Total: {total}, Processed: {processed}, Skipped: {skipped}',
	}

	static dir = {
		type: 'string',
		required: true,
		help: 'Directory or drive mount point containing video files',
	}

	static language = {
		type: 'string',
		required: false,
		default: 'auto',
		help: 'Language code for transcription and subtitle tagging (uk, en, auto)',
	}

	static quality = {
		type: 'string',
		required: false,
		default: 'medium',
		help: 'Whisper model quality size (tiny, base, small, medium, large)',
	}

	static mux = {
		type: 'boolean',
		required: false,
		default: true,
		help: 'Mux soft subtitles directly into video files',
	}

	/**
	 * @param {object} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.dir = data.dir || DriveBatchTranscribeCommand.dir.default
		this.language = data.language || DriveBatchTranscribeCommand.language.default
		this.quality = data.quality || DriveBatchTranscribeCommand.quality.default
		this.mux = data.mux ?? DriveBatchTranscribeCommand.mux.default
	}

	/**
	 * Collects video files recursively.
	 * @param {string} dir
	 * @returns {string[]}
	 */
	_collectVideos(dir) {
		const extList = new Set(['.mov', '.mp4', '.mkv', '.m4v', '.avi'])
		const results = []

		const walk = (current) => {
			if (!fs.existsSync(current)) return
			const entries = fs.readdirSync(current, { withFileTypes: true })
			for (const entry of entries) {
				if (entry.name.startsWith('.')) continue
				const full = path.join(current, entry.name)
				if (entry.isDirectory()) {
					walk(full)
				} else if (entry.isFile()) {
					const ext = path.extname(entry.name).toLowerCase()
					if (extList.has(ext)) {
						results.push(full)
					}
				}
			}
		}

		walk(dir)
		return results
	}

	async *run() {
		const { t } = this._
		const targetDir = path.resolve(this.dir)

		yield progress(t(DriveBatchTranscribeCommand.UI.scanningDir, { dir: targetDir }), 0, {
			id: 'batch',
			total: 100,
		})

		const videos = this._collectVideos(targetDir)
		const cacheService = new TranscriptCacheService()
		const inspector = new MediaInspectorService()
		const muxer = new SubtitleMuxerPort()

		let cachedCount = 0
		for (const v of videos) {
			if (cacheService.has(v)) cachedCount++
		}

		const total = videos.length
		yield show(
			t(DriveBatchTranscribeCommand.UI.foundVideos, {
				total,
				cached: cachedCount,
				needProcessing: total - cachedCount,
			}),
			'info'
		)

		let processed = 0
		let skipped = 0

		for (let i = 0; i < videos.length; i++) {
			const videoPath = videos[i]
			const fileName = path.basename(videoPath)
			const current = i + 1
			const pct = Math.round((current / total) * 100)

			yield progress(t(DriveBatchTranscribeCommand.UI.inspectingFile, { current, total, name: fileName }), pct, {
				id: 'batch',
				total: 100,
			})

			// 1. Check existing subtitles
			const streamMeta = inspector.getVideoMeta(videoPath)
			if (streamMeta.hasSubtitles && cacheService.has(videoPath)) {
				yield show(t(DriveBatchTranscribeCommand.UI.hasSubtitlesSkipping, { current, total, name: fileName }), 'info')
				skipped++
				continue
			}

			// 2. Transcript resolution (Cache vs Whisper)
			let transcriptData = cacheService.load(videoPath)
			if (!transcriptData) {
				yield show(t(DriveBatchTranscribeCommand.UI.transcribing, { current, total, name: fileName, model: this.quality }), 'info')
				const downloader = new MediaDownloadModel({
					url: videoPath,
					quality: this.quality,
					language: this.language,
					format: 'json',
				}, this._)

				for await (const update of downloader.run()) {
					// Stream progress updates if any
				}

				// Look for produced transcript
				const rawTranscriptPath = `${videoPath}.json`
				if (fs.existsSync(rawTranscriptPath)) {
					try {
						transcriptData = JSON.parse(fs.readFileSync(rawTranscriptPath, 'utf8'))
						cacheService.save(videoPath, transcriptData)
						fs.unlinkSync(rawTranscriptPath)
					} catch {}
				}
			} else {
				yield show(t(DriveBatchTranscribeCommand.UI.cachedTranscript, { current, total, name: fileName }), 'info')
			}

			// 3. Soft-subtitle muxing
			if (this.mux && !streamMeta.hasSubtitles && transcriptData) {
				yield show(t(DriveBatchTranscribeCommand.UI.muxingSubtitles, { current, total, name: fileName }), 'info')
				const srtPath = path.join(path.dirname(videoPath), `.${fileName}.tmp.srt`)
				const tmpMuxed = path.join(path.dirname(videoPath), `.${fileName}.tmp${path.extname(videoPath)}`)

				// Generate simple SRT from segments
				const srtContent = this._generateSrt(transcriptData.segments || [])
				fs.writeFileSync(srtPath, srtContent, 'utf8')

				const muxSuccess = muxer.muxSoftSubtitles({
					inputVideo: videoPath,
					subtitlePath: srtPath,
					outputPath: tmpMuxed,
					language: this.language || 'uk',
				})

				if (muxSuccess) {
					muxer.safeAtomicReplace({
						originalPath: videoPath,
						tempPath: tmpMuxed,
						validator: (p) => fs.existsSync(p) && fs.statSync(p).size > 0,
					})
					yield show(t(DriveBatchTranscribeCommand.UI.muxDone, { current, total, name: fileName }), 'success')
				}

				try {
					if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath)
					if (fs.existsSync(tmpMuxed)) fs.unlinkSync(tmpMuxed)
				} catch {}
			}

			processed++
		}

		yield progress(
			t(DriveBatchTranscribeCommand.UI.allCompleted, { total, processed, skipped }),
			100,
			{ id: 'batch', total: 100 }
		)

		return result({
			success: true,
			total,
			processed,
			skipped,
		})
	}

	/**
	 * Formats Whisper segments into standard SRT string.
	 * @param {Array<{ start: number, end: number, text: string }>} segments
	 * @returns {string}
	 */
	_generateSrt(segments = []) {
		const formatTime = (seconds = 0) => {
			const sec = Number(seconds) || 0
			const hrs = Math.floor(sec / 3600).toString().padStart(2, '0')
			const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
			const secs = Math.floor(sec % 60).toString().padStart(2, '0')
			const millis = Math.floor((sec % 1) * 1000).toString().padStart(3, '0')
			return `${hrs}:${mins}:${secs},${millis}`
		}

		return segments
			.map((seg, idx) => {
				return `${idx + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text.trim()}\n`
			})
			.join('\n')
	}
}
