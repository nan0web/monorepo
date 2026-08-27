import { Model } from './Models.js'
import { YouTubeDownloader } from './YouTubeDownloader.js'
import { AudioSplitter } from './AudioSplitter.js'
import { AI } from '@nan0web/ai'
import fs from 'node:fs'
import path from 'node:path'

/**
 * MediaDownloadModel (Model-as-App & Model-as-Schema) handles downloading from YouTube/TikTok,
 * splitting into 5-minute chunks, and transcribing each chunk locally via Whisper.
 */
export class MediaDownloadModel extends Model {
	static alias = 'media:download'

	static UI = {
		downloadProgress: '📥 Extracting/downloading audio track... {percent}%',
		segmentProgress: '✂️ Splitting audio into chunks... {percent}%',
		whisperChunkProgress: '🧠 Transcribing Whisper chunk {chunk}/{total} (MLX/Metal)...',
		whisperChunkDetail: '🧠 Whisper chunk {chunk}/{total}: [{percent}%]',
		whisperChunkDone: '✅ Chunk {chunk}/{total} processed',
		transcriptionComplete: '✅ Transcription completed and saved to {path}',
		transcriptionSaved: '✅ Transcription saved to {path}',
	}

	static url = { help: 'YouTube video URL or local file path', default: undefined }
	static status = { help: 'Current processing status', default: 'idle' }
	static transcript = { help: 'The full transcribed text', default: '' }
	static title = { help: 'Media title', default: '' }
	static chunks = { help: 'Transcribed chunks (5m each)', default: [] }
	static quality = { help: 'Whisper model size', default: 'medium' }
	static format = { help: 'Output format (txt, srt, vtt, json)', default: 'txt' }
	static language = { help: 'Language code (auto, uk, en)', default: 'auto' }

	/** @type {string|undefined} */ url
	/** @type {string} */ status
	/** @type {string} */ transcript
	/** @type {string} */ title
	/** @type {string[]} */ chunks
	/** @type {string} */ quality
	/** @type {string} */ format
	/** @type {string} */ language
	/** @type {string} */ llmModel
	/** @type {string} */ cookies

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
		this.llmModel = raw.llmModel
		this.cookies = raw.cookies
	}

	/**
	 * Runs the download and transcription process.
	 * Yields partial results after each 5-minute chunk.
	 * @returns {AsyncGenerator<Object, void, unknown>}
	 */
	async *run() {
		if (!this.url) throw new Error('Input URL or path is required')

		let filePath = this.url
		const isRemote = this.url.startsWith('http://') || 
			this.url.startsWith('https://') || 
			this.url.includes('youtube.com') || 
			this.url.includes('youtu.be') ||
			this.url.includes('tiktok.com')
		const workDir = './tmp'

		if (isRemote) {
			this.status = 'downloading'
			yield { status: this.status, url: this.url }

			let lastProgress = { percent: 0, speed: '', eta: '' }
			const dlPromise = YouTubeDownloader.downloadAudio(
				this.url,
				workDir,
				(p) => { lastProgress = p },
				{ cookies: this.cookies, _: this._ }
			)

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

			let splitProgress = { percent: null }
			/** @type {string[]} */
			let segmentFiles = []
			const splitPromise = AudioSplitter.split(filePath, {
				segmentDuration: 300,
				outputDir: workDir,
				onProgress: (p) => { splitProgress = p },
				_: this._,
			})

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
			const outputFormat = this.format === 'md' ? 'json' : (this.format || 'txt')

			for (let i = 0; i < segmentFiles.length; i++) {
				const segmentPath = segmentFiles[i]
				this.status = 'transcribing'
				yield { status: this.status, chunk: i + 1, total: segmentFiles.length, model: this.quality }

				let chunkProgress = { percent: 0 }
				const tPromise = ai.transcribe(segmentPath, {
					model: whisperModel,
					format: outputFormat,
					outputDir: workDir,
					language: this.language !== 'auto' ? this.language : undefined,
					onProgress: (p) => { chunkProgress = p }
				})

				let result
				while (true) {
					const race = await Promise.race([
						tPromise.then(r => ({ type: 'done', result: r })),
						new Promise(resolve => setTimeout(() => resolve({ type: 'tick' }), 200)),
					])
					if (race.type === 'done') {
						result = race.result
						break
					}
					if (chunkProgress.percent > 0) {
						yield { status: 'partial_progress', chunk: i + 1, total: segmentFiles.length, percent: chunkProgress.percent, model: whisperModel }
					}
				}

				const outputPath = result.filePaths.find(f => fs.existsSync(f))
				if (!outputPath) {
					throw new Error(`Expected transcription output not found for chunk ${i + 1}`)
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

				if (fs.existsSync(segmentPath)) {
					fs.unlinkSync(segmentPath)
				}
			}

			this.transcript = AudioSplitter.mergeTranscripts(this.chunks, outputFormat)

			if (this.format === 'md') {
				this.status = 'llm_processing'
				yield { status: this.status, title: this.title }
				
				let formattedInput = this.transcript
				try {
					const data = JSON.parse(this.transcript)
					if (data.segments && Array.isArray(data.segments)) {
						formattedInput = data.segments.map(s => {
							const totalSec = Math.floor(s.start || 0)
							const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
							const sec = String(totalSec % 60).padStart(2, '0')
							return `[${m}:${sec}] ${s.text || ''}`
						}).join('\n')
					} else if (data.text) {
						formattedInput = data.text
					}
				} catch {}

				let selectedLlmModel
				if (this.llmModel) {
					selectedLlmModel = ai.findModel(this.llmModel)
				}
				if (!selectedLlmModel) {
					await ai.refreshModels()
					const queue = ai.buildFallbackQueue(4096)
					if (queue.length > 0) {
						selectedLlmModel = queue[0]
					} else {
						selectedLlmModel = ai.getModels()[0]
					}
				}

				if (!selectedLlmModel) {
					throw new Error('Жодна LLM модель не доступна для форматування Markdown.')
				}

				const segments = data.segments || []
				if (segments.length > 0) {
					// Split segments into 10-minute chunks (600 seconds per chunk)
					const CHUNK_DURATION = 600
					const chunks = []
					let currentChunk = []
					let currentChunkIndex = 0

					for (const s of segments) {
						const chunkIdx = Math.floor((s.start || 0) / CHUNK_DURATION)
						if (chunkIdx !== currentChunkIndex && currentChunk.length > 0) {
							chunks.push(currentChunk)
							currentChunk = []
							currentChunkIndex = chunkIdx
						}
						currentChunk.push(s)
					}
					if (currentChunk.length > 0) chunks.push(currentChunk)

					let fullMarkdownBody = ''
					for (let i = 0; i < chunks.length; i++) {
						const chunkSegments = chunks[i]
						const formattedChunk = chunkSegments.map(s => {
							const totalSec = Math.floor(s.start || 0)
							const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
							const sec = String(totalSec % 60).padStart(2, '0')
							return `[${m}:${sec}] ${s.text || ''}`
						}).join('\n')

						const prompt = `Ось розпізнана частина аудіо/відео з таймкодами (частина ${i + 1} з ${chunks.length}). Виконай постобробку:
1. Виправ орфографічні та граматичні помилки розпізнавання.
2. Розбий текст на логічні блоки з відповідними заголовками (Markdown H2/H3) мовою оригіналу.
3. Збережи оригінальні таймкоди біля відповідних абзаців або речень (наприклад, [00:01:23]).
4. Опрацюй УСІ речення від початку цієї частини і до кінця! Поверни ТІЛЬКИ готовий Markdown текст.

Текст:
${formattedChunk}`

						let chunkMarkdown = ''
						const result = await ai.streamText(selectedLlmModel, [{ role: 'user', content: prompt }])
						for await (const textChunk of result.textStream) {
							chunkMarkdown += textChunk
						}
						fullMarkdownBody += '\n\n' + chunkMarkdown.trim()
						yield { status: 'llm_progress', text: fullMarkdownBody }
					}

					const summaryPrompt = `Ось текст транскрипту. Напиши коротке резюме ("## Краткое содержание" або "## Короткий зміст") мовою оригіналу на 1-2 абзаци:\n\n${fullMarkdownBody.slice(0, 4000)}`
					const summaryRes = await ai.generateText(selectedLlmModel, [{ role: 'user', content: summaryPrompt }])

					const header = this.url ? `# [${this.title || 'Відео'}](${this.url})\n\n` : `# ${this.title || 'Відео'}\n\n`
					this.markdown = header + (summaryRes.text || '## Короткий зміст') + '\n\n---\n' + fullMarkdownBody
				} else {
					const prompt = `Ось розпізнаний текст аудіо/відео з таймкодами. Виконай постобробку:
1. Напиши коротке резюме ("## Короткий зміст") мовою оригіналу на початку.
2. Виправ орфографічні та граматичні помилки розпізнавання.
3. Розбий текст на логічні блоки з відповідними заголовками (Markdown H2/H3) мовою оригіналу.
4. Збережи оригінальні таймкоди біля відповідних абзаців або речень (наприклад, [00:01:23]).
5. Поверни ТІЛЬКИ готовий Markdown текст.

Текст:
${formattedInput}`

					let markdownText = ''
					const result = await ai.streamText(selectedLlmModel, [{ role: 'user', content: prompt }])
					for await (const textChunk of result.textStream) {
						markdownText += textChunk
						yield { status: 'llm_progress', text: markdownText }
					}
					const header = this.url ? `# [${this.title || 'Відео'}](${this.url})\n\n` : `# ${this.title || 'Відео'}\n\n`
					this.markdown = header + markdownText
				}
			}

			this.status = 'done'
			yield { status: this.status, transcript: this.transcript, markdown: this.markdown, title: this.title, model: whisperModel }

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
