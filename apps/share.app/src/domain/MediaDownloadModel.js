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

	constructor(raw = {}) {
		super()
		this.url = raw.url ?? MediaDownloadModel.url.default
		this.status = raw.status ?? MediaDownloadModel.status.default
		this.transcript = raw.transcript ?? MediaDownloadModel.transcript.default
		this.title = raw.title ?? MediaDownloadModel.title.default
		this.chunks = raw.chunks ?? MediaDownloadModel.chunks.default
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

		if (isRemote) {
			this.status = 'downloading'
			yield { status: this.status, url: this.url }
			const result = await YouTubeDownloader.downloadAudio(this.url)
			filePath = result.filePath
			this.title = result.title
		} else {
			this.title = path.basename(filePath)
		}

		try {
			this.status = 'segmenting'
			yield { status: this.status, title: this.title }

			// Split into 5-minute (300s) chunks
			const segmentFiles = await AudioSplitter.split(filePath, { segmentDuration: 300 })

			this.status = 'transcribing'
			this.transcript = ''
			this.chunks = []

			const ai = new AI()

			for (let i = 0; i < segmentFiles.length; i++) {
				const segmentPath = segmentFiles[i]
				yield { status: 'transcribing', chunk: i + 1, total: segmentFiles.length }

				// Using local whisper (via AI.transcribe refactored for local)
				const text = await ai.transcribe(segmentPath, {
					model: 'medium', // Better for Ukrainian
					language: 'uk',
				})

				this.chunks.push(text)
				this.transcript += (this.transcript ? '\n\n' : '') + text

				yield {
					status: 'partial',
					text,
					chunk: i + 1,
					total: segmentFiles.length,
					fullTranscript: this.transcript,
				}

				// Cleanup segment file immediately after transcription
				if (fs.existsSync(segmentPath)) {
					fs.unlinkSync(segmentPath)
				}
			}

			this.status = 'done'
			yield { status: this.status, transcript: this.transcript, title: this.title }

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
