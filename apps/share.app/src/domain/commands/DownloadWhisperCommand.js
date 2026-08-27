import { ModelAsApp } from '@nan0web/ui-cli'
import { MediaDownloadModel } from '../MediaDownloadModel.js'
import { ToolCheckerPort } from '../../ports/ToolCheckerPort.js'
import { progress, show, result, log } from '@nan0web/ui'

/**
 * @typedef {object} DownloadWhisperCommandOptions
 * @property {string} url - YouTube URL or local file path
 * @property {string} [output] - Output file path for the transcript
 * @property {'tiny'|'base'|'small'|'medium'|'large'} [quality] - Whisper model size (default: medium)
 * @property {'txt'|'srt'|'vtt'|'json'} [format] - Output format: txt (plain text), srt/vtt (timestamps), json (word-level timestamps)
 */

export class DownloadWhisperCommand extends ModelAsApp {
	static alias = 'download:whisper'

	static url = {
		type: 'string',
		required: true,
		help: 'YouTube URL or local file path to process',
	}

	static output = {
		type: 'string',
		required: false,
		help: 'Output file path for the transcript (default: print to stdout)',
	}

	static quality = {
		type: 'string',
		required: false,
		help: 'Whisper model: tiny|base|small|medium|large|turbo (default: medium)',
	}

	static format = {
		type: 'string',
		required: false,
		help: 'Output format: txt (default), srt, vtt, json, md (AI Notebook)',
	}

	static language = {
		type: 'string',
		required: false,
		help: 'Language code: uk|en|auto (default: auto — Whisper detects from audio)',
	}

	static llmModel = {
		type: 'string',
		required: false,
		help: 'LLM Model ID to use for formatting Markdown (default: auto selected)',
	}

	static cookies = {
		type: 'string',
		required: false,
		help: 'Browser name (e.g. chrome, safari, firefox), path to local cookies file (e.g. ./cookies.txt), or COOKIES env var',
	}

	/**
	 * @param {DownloadWhisperCommandOptions} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * Detect output format from file extension.
	 * @param {string} filePath
	 * @returns {'txt'|'srt'|'vtt'|'json'|'md'|null}
	 */
	static _detectFormat(filePath) {
		const ext = filePath.split('.').pop()?.toLowerCase()
		if (ext === 'srt' || ext === 'vtt' || ext === 'json' || ext === 'md') return ext
		return null
	}

	async *run() {
		const { AI } = await import('@nan0web/ai')
		if (this.format === 'md' || (this.output && DownloadWhisperCommand._detectFormat(this.output) === 'md')) {
			const ai = new AI({}, this._)
			await ai.refreshModels()
			if (ai.getModels().length === 0) {
				yield show('Жодна LLM модель не налаштована. Будь ласка, налаштуйте хоча б одного провайдера для використання формату md.', 'error')
				return result({ success: false, message: 'No LLM model configured for md format' })
			}
		}

		// Check if URL is provided
		if (!this.url) {
			yield show('Usage: nan0ai download:whisper --url <YouTube URL or local file path> [--output <path>]', 'error')
			return result({ success: false, message: 'URL is required' })
		}

		// Verify required CLI tools are installed
		const missing = await ToolCheckerPort.require({
			'mlx_whisper': 'pip install mlx-whisper  (Apple Silicon required)',
			'yt-dlp': 'pip install yt-dlp  or  brew install yt-dlp',
			'ffmpeg': 'brew install ffmpeg  or  apt install ffmpeg',
		})

		if (missing.length > 0) {
			const detail = missing.map(m => `  ${m.tool} — ${m.hint}`).join('\n')
			yield show(`Відсутні інструменти:\n${detail}`, 'error')
			return result({ success: false, message: 'Missing required CLI tools' })
		}

		const model = new MediaDownloadModel({
			url: this.url,
			quality: this.quality || 'medium',
			format: this.format || (this.output && DownloadWhisperCommand._detectFormat(this.output)) || 'txt',
			language: this.language || 'auto',
			llmModel: this.llmModel,
			cookies: this.cookies,
		}, this._)

		yield progress(`[MediaProcessor] Starting for: ${this.url}`, 0, { id: 'downloading', total: 100 })

		try {
			const iterator = model.run()
			let lastChunk = ''
			let lastDownloadPercent = -1
			let lastSegmentPercent = -1
			let lastTranscribeChunk = 0

			for await (const update of iterator) {
				switch (update.status) {
					case 'downloading':
						if (update.percent !== undefined && update.percent !== lastDownloadPercent) {
							lastDownloadPercent = update.percent
							yield progress(
								`Завантаження аудіо...${update.speed ? ` (${update.speed})` : ''}${update.eta ? ` ETA: ${update.eta}` : ''}`,
								update.percent,
								{ id: 'downloading', total: 100 }
							)
						}
						break
					case 'segmenting':
						if (update.percent !== undefined && update.percent !== lastSegmentPercent) {
							lastSegmentPercent = update.percent
							yield progress(
								`Сегментування (${update.title})...`,
								update.percent,
								{ id: 'segmenting', total: 100 }
							)
						}
						break
					case 'transcribing':
						if (update.chunk !== lastTranscribeChunk) {
							lastTranscribeChunk = update.chunk
							yield progress(
								`Транскрибування чанку ${update.chunk}/${update.total}... (${update.model})`,
								update.chunk,
								{ id: 'transcribing', total: update.total }
							)
						}
						break
					case 'partial_progress':
						if (update.percent !== undefined) {
							// For fine-grained progress, we update the same chunk id but pass the percentage as the value
							yield progress(
								`Транскрибування чанку ${update.chunk}/${update.total}... (${update.model}) [${update.percent}%]`,
								update.chunk - 1 + (update.percent / 100),
								{ id: 'transcribing', total: update.total }
							)
						}
						break
					case 'partial':
						lastChunk = update.text.substring(0, 150)
						yield progress(
							`Чанк ${update.chunk}/${update.total} готово`,
							update.chunk,
							{ id: 'transcribing', total: update.total }
						)
						break
					case 'llm_processing':
						yield show('Початок обробки транскрипту за допомогою LLM (форматування Markdown)...', 'info')
						break
					case 'llm_progress':
						// For stream progress we can just use progress bar or show spinning
						yield progress(
							`Генерація Markdown...`,
							null, // indeterminate
							{ id: 'llm_progress', total: 100 }
						)
						break
					case 'done':
						yield show(`✓ Готово!`, 'success')
						yield show(`Назва: ${update.title}`, 'info')
						yield show(`Модель: ${update.model} (мова: авто-визначення)`, 'info')

						const db = this._.db
						const transcript = update.transcript || ''
						const outputPath = this.output

						if (outputPath) {
							if (this.format === 'md') {
								// Save the markdown file
								await db.saveFile(`@app/${outputPath}`, update.markdown || '')
								yield show(`Markdown збережено: ${outputPath}`, 'info')
								// Also save the original JSON
								const jsonPath = outputPath.replace(/\.md$/i, '.json')
								await db.saveFile(`@app/${jsonPath}`, transcript)
								yield show(`Оригінальний JSON збережено: ${jsonPath}`, 'info')
								// Also save original plain text (.txt)
								try {
									const parsedJson = JSON.parse(transcript)
									if (parsedJson.text) {
										const txtPath = outputPath.replace(/\.md$/i, '.txt')
										await db.saveFile(`@app/${txtPath}`, parsedJson.text)
										yield show(`Оригінальний текст збережено: ${txtPath}`, 'info')
									}
								} catch {}
							} else {
								await db.saveFile(`@app/${outputPath}`, transcript)
								yield show(`Транскрипт збережено: ${outputPath}`, 'info')
							}
						} else {
							yield show('─── Транскрипт ───', 'info')
							yield show(this.format === 'md' ? (update.markdown || '') : transcript, 'info')
							yield show('──────────────────', 'info')
						}

						return result({
							success: true,
							title: update.title,
							transcript: this.format === 'md' ? update.markdown : transcript,
							originalJson: this.format === 'md' ? transcript : null,
							outputPath: this.output || null,
						})
					case 'error':
						yield show(`✘ Помилка: ${update.error}`, 'error')
						return result({ success: false, message: update.error })
				}
			}
		} catch (err) {
			yield show(`Критична помилка: ${err.message}`, 'error')
			return result({ success: false, message: err.message })
		}
	}
}
