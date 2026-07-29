import { Model } from './Models.js'
import { YouTubeDownloader } from './YouTubeDownloader.js'
import { AudioSplitter } from './AudioSplitter.js'
import { AI } from '@nan0web/ai'
import fs from 'node:fs'
import path from 'node:path'

/**
 * MediaDownloadModel handles downloading from YouTube (or using local files),
 * splitting into 5-minute chunks, and transcribing each chunk locally via Whisper.
 */
export class MediaDownloadModel extends Model {
	static url = { help: 'YouTube video URL or local file path', default: undefined }
	static status = { help: 'Current processing status', default: 'idle' }
	static transcript = { help: 'The full transcribed text', default: '' }
	static title = { help: 'Media title', default: '' }
	static chunks = { help: 'Transcribed chunks (5m each)', default: [] }
	static quality = { help: 'Whisper model size', default: 'medium' }
	static format = { help: 'Output format (txt, srt, vtt, json)', default: 'txt' }
	static language = { help: 'Language code (auto, uk, en)', default: 'auto' }

	/** @type {string|undefined} */
	url
	/** @type {string} */
	status
	/** @type {string} */
	transcript
	/** @type {string} */
	title
	/** @type {string[]} */
	chunks
	/** @type {string} */
	quality
	/** @type {string} */
	format
	/** @type {string} */
	language

	constructor(raw = {}, options = {}) {
		super(raw, options)
		this.url = raw.url ?? MediaDownloadModel.url.default
		this.status = raw.status ?? MediaDownloadModel.status.default
		this.transcript = raw.transcript ?? MediaDownloadModel.transcript.default
		this.title = raw.title ?? MediaDownloadModel.title.default
		this.chunks = raw.chunks ?? MediaDownloadModel.chunks.default
		this.quality = raw.quality ?? MediaDownloadModel.quality.default
		this.format = raw.format ?? MediaDownloadModel.format.default
		this.language = raw.language ?? MediaDownloadModel.language.default
	}

	/**
	 * Runs the download and transcription process.
	 * Yields partial results after each 5-minute chunk.
	 * @returns {AsyncGenerator<Object, void, unknown>}
	 */
	async *run() {
		if (!this.url) throw new Error('Input URL or path is required')

		let filePath = this.url
		const isRemote = this.url.startsWith('http')
		const workDir = './tmp'

		if (isRemote) {
			this.status = 'downloading'
			yield { status: this.status, url: this.url }

			// Use a mutable progress object polled from the generator
			let lastProgress = { percent: 0, speed: '', eta: '' }
			const dlPromise = YouTubeDownloader.downloadAudio(this.url, workDir, (p) => {
				lastProgress = p
			})

			// Poll progress every ~200ms until download finishes
			while (true) {
				const race = await Promise.race([
					dlPromise.then(r => ({ type: 'done', result: r })),
					new Promise(resolve => setTimeout(() => resolve({ type: 'tick' }), 200)),
				])
				if (race.type === 'done') {
					filePath = race.result.filePath
					this.title = race.result.title
					break
				}
				yield { status: 'downloading', percent: lastProgress.percent, speed: lastProgress.speed, eta: lastProgress.eta }
			}
		} else {
			this.title = path.basename(filePath)
		}

		try {
			this.status = 'segmenting'
			yield { status: this.status, title: this.title }

			// Split into 5-minute (300s) chunks in workDir so DBFS can see them
			let splitProgress = { percent: null }
			/** @type {string[]} */
			let segmentFiles = []
			const splitPromise = AudioSplitter.split(filePath, {
				segmentDuration: 300,
				outputDir: workDir,
				onProgress: (p) => { splitProgress = p },
			})

			// Poll split progress
			while (true) {
				const race = await Promise.race([
					splitPromise.then(r => ({ type: 'done', result: r })),
					new Promise(resolve => setTimeout(() => resolve({ type: 'tick' }), 200)),
				])
				if (race.type === 'done') {
					segmentFiles = race.result
					if (segmentFiles.length === 0) {
						throw new Error('Audio splitting produced no segments')
					}
					break
				}
				yield { status: 'segmenting', title: this.title, percent: splitProgress.percent }
			}

			this.status = 'transcribing'
			this.transcript = ''
			this.chunks = []

			const ai = new AI({}, this._)
			const whisperModel = this.quality || 'medium'
			const outputFormat = this.format || 'txt'

			for (let i = 0; i < segmentFiles.length; i++) {
				const segmentPath = segmentFiles[i]
				yield { status: 'transcribing', chunk: i + 1, total: segmentFiles.length, model: whisperModel }

				// Using mlx_whisper (Apple Silicon native) — language auto-detected
				const result = await ai.transcribe(segmentPath, {
					model: whisperModel,
					format: outputFormat,
					outputDir: workDir,
					language: this.language !== 'auto' ? this.language : undefined,
				})

				// Read the actual output file — mlx_whisper writes to real filesystem,
				// AI.transcribe() only runs the CLI and returns file paths.
				const outputPath = result.filePaths.find(f => fs.existsSync(f))
				if (!outputPath) {
					throw new Error(`Whisper output not found (tried: ${result.filePaths.join(', ')})`)
				}
				const text = fs.readFileSync(outputPath, 'utf-8').trim()
				fs.unlinkSync(outputPath)

				this.chunks.push(text)

				yield {
					status: 'partial',
					text,
					chunk: i + 1,
					total: segmentFiles.length,
				}

				// Cleanup segment file immediately after transcription
				if (fs.existsSync(segmentPath)) {
					fs.unlinkSync(segmentPath)
				}
			}

			// Merge chunks with deduplication for overlapping segments
			this.transcript = AudioSplitter.mergeTranscripts(this.chunks)

			this.status = 'done'
			yield { status: this.status, transcript: this.transcript, title: this.title, model: whisperModel }

			// Cleanup the main downloaded file if it was a remote download
			if (isRemote && fs.existsSync(filePath)) {
				fs.unlinkSync(filePath)
			}
		} catch (err) {
			this.status = 'error'
			yield { status: this.status, error: err.message }
			throw err
		}
	}
}
