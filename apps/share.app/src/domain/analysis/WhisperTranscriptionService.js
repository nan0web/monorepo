import { MediaDownloadModel } from '../MediaDownloadModel.js'
import { progress, show } from '@nan0web/ui'

/**
 * WhisperTranscriptionService — manages audio downloading, chunked Whisper transcription,
 * and persistent hierarchical caching.
 */
export class WhisperTranscriptionService {
	/**
	 * Factory for MediaDownloadModel (overridable in tests).
	 * @param {object} data
	 * @param {object} context
	 * @returns {MediaDownloadModel}
	 */
	static createDownloadModel(data, context) {
		return new MediaDownloadModel(data, context)
	}

	/**
	 * Ensures transcript is available for the given URL/file.
	 * @param {object} options
	 * @param {string} options.url
	 * @param {string} options.outputDir
	 * @param {string} [options.language='auto']
	 * @param {string} [options.quality='medium']
	 * @param {Function} options.t
	 * @param {object} options.context
	 * @param {import('@nan0web/db').DB} [options.db]
	 * @returns {AsyncGenerator<any, { whisperJson: object|null, transcriptPath: string }, any>}
	 */
	static async *transcribe(options) {
		const { url, outputDir, language = 'auto', t, context } = options
		const db = options.db || context?.db
		const resolvePath = (dir, file) =>
			db && typeof db.resolveSync === 'function' ? db.resolveSync(dir, file) : `${dir}/${file}`
		const basename = (filePath) =>
			db && typeof db.basename === 'function'
				? db.basename(filePath)
				: (filePath || '').split('/').filter(Boolean).pop() || ''

		const transcriptPath = resolvePath(outputDir, 'transcript.json')
		let whisperJson = null

		const hasTranscript = db ? (await db.statDocument(transcriptPath).catch(() => null))?.exists : false
		if (hasTranscript) {
			yield show(t('Found saved transcript: {path} (using cache)', { path: transcriptPath }), 'success')
			try {
				const cachedDoc = await db.loadDocument(transcriptPath).catch(() => null)
				const raw = typeof cachedDoc === 'object' && cachedDoc ? cachedDoc.content || cachedDoc.value : cachedDoc
				whisperJson = typeof raw === 'string' ? JSON.parse(raw) : raw
				return { whisperJson, transcriptPath }
			} catch {}
		}

		if (!options.silentHeader) {
			yield show(t('🎙️ Audio extraction & Whisper transcription ({name})...', { name: basename(url) }), 'info')
		}

		if (options.offline) {
			process.env.HF_HUB_OFFLINE = '1'
			process.env.TRANSFORMERS_OFFLINE = '1'
		}

		const downloadModel =
			options.downloadModel ||
			WhisperTranscriptionService.createDownloadModel(
				{
					url,
					quality: options.quality || 'medium',
					format: 'json',
					language,
					initialPrompt: options.initialPrompt,
					conditionOnPreviousText: options.conditionOnPreviousText ?? true,
					chunkDuration: options.chunkDuration || 300,
				},
				context
			)

		let transcriptResult = null
		let lastDownloadPercent = -1
		let lastSegmentPercent = -1
		let lastTranscribeChunk = 0

		for await (const update of downloadModel.run()) {
			switch (update.status) {
				case 'downloading':
					if (update.percent !== undefined && update.percent !== lastDownloadPercent) {
						lastDownloadPercent = update.percent
						yield progress(t('📥 Extracting/downloading audio track... {percent}%', { percent: update.percent }), update.percent, { id: 'whisper', total: 100 })
					}
					break
				case 'segmenting':
					if (update.percent !== undefined && update.percent !== lastSegmentPercent) {
						lastSegmentPercent = update.percent
						yield progress(t('✂️ Splitting audio into chunks... {percent}%', { percent: update.percent }), update.percent, { id: 'whisper', total: 100 })
					}
					break
				case 'transcribing':
					if (update.chunk !== lastTranscribeChunk) {
						lastTranscribeChunk = update.chunk
						yield progress(t('🧠 Transcribing Whisper chunk {chunk}/{total} (MLX/Metal)...', { chunk: update.chunk, total: update.total }), update.chunk - 1, { id: 'whisper', total: update.total })
					}
					break
				case 'partial_progress':
					if (update.percent !== undefined || update.language || update.text) {
						const ev = progress(
							t('🧠 Whisper chunk {chunk}/{total}: [{percent}%]', { chunk: update.chunk, total: update.total, percent: update.percent ?? 0 }),
							update.chunk - 1 + (update.percent ?? 0) / 100,
							{ id: 'whisper', total: update.total }
						)
						if (update.language) ev.language = update.language
						if (update.text) ev.text = update.text
						if (update.texts) ev.texts = update.texts
						yield ev
					}
					break
				case 'partial':
					yield progress(t('✅ Chunk {chunk}/{total} processed', { chunk: update.chunk, total: update.total }), update.chunk, { id: 'whisper', total: update.total })
					break
				case 'done':
					transcriptResult = update.transcript || update.text || downloadModel.transcript
					break
			}
		}

		if (!transcriptResult && downloadModel.transcript) {
			transcriptResult = downloadModel.transcript
		}

		if (transcriptResult) {
			if (options.saveCache !== false && db && typeof db.saveDocument === 'function') {
				await db.saveDocument(transcriptPath, transcriptResult)
			}
			try {
				whisperJson = JSON.parse(transcriptResult)
			} catch {
				whisperJson = { text: transcriptResult }
			}
			yield show(t('✅ Transcription completed and saved to {path}', { path: transcriptPath }), 'success')
		}

		return { whisperJson, transcriptPath }
	}
}
