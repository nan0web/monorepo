import { ModelAsApp } from '@nan0web/ui-cli'
import { MediaDownloadModel } from '../MediaDownloadModel.js'
import { ToolChecker } from '../ToolChecker.js'

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
		help: 'Output format: txt (default), srt, vtt, json (auto-detected from --output extension)',
	}

	static language = {
		type: 'string',
		required: false,
		help: 'Language code: uk|en|auto (default: auto — Whisper detects from audio)',
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
	 * @returns {'txt'|'srt'|'vtt'|'json'|null}
	 */
	static _detectFormat(filePath) {
		const ext = filePath.split('.').pop()?.toLowerCase()
		if (ext === 'srt' || ext === 'vtt' || ext === 'json') return ext
		return null
	}

	async *run() {
		// Check if URL is provided
		if (!this.url) {
			yield {
				type: 'log',
				level: 'error',
				message: 'Usage: nan0ai download:whisper --url <YouTube URL or local file path> [--output <path>]',
			}
			return { type: 'result', data: { success: false, message: 'URL is required' } }
		}

		// Verify required CLI tools are installed
		const missing = await ToolChecker.require({
			'mlx_whisper': 'pip install mlx-whisper  (Apple Silicon required)',
			'yt-dlp': 'pip install yt-dlp  or  brew install yt-dlp',
			'ffmpeg': 'brew install ffmpeg  or  apt install ffmpeg',
		})

		if (missing.length > 0) {
			const detail = missing.map(m => `  \x1b[1m${m.tool}\x1b[0m — ${m.hint}`).join('\n')
			yield { type: 'log', level: 'error', message: `\x1b[1;31mMissing required tools:\x1b[0m\n${detail}` }
			return { type: 'result', data: { success: false, message: 'Missing required CLI tools' } }
		}

		const model = new MediaDownloadModel({
			url: this.url,
			quality: this.quality || 'medium',
			format: this.format || (this.output && DownloadWhisperCommand._detectFormat(this.output)) || 'txt',
			language: this.language || 'auto',
		}, this._)

		yield {
			type: 'log',
			level: 'info',
			message: `\x1b[1m[MediaProcessor]\x1b[0m Starting for: ${this.url}`,
		}

		try {
			// The original script used 'for await...of model.run()'.
			// We need to adapt this to yield intents.
			// The 'model.run()' likely returns an async iterator.
			const iterator = model.run()
			let lastChunk = ''

			for await (const update of iterator) {
				switch (update.status) {
					case 'downloading':
						yield {
							type: 'progress',
							message: `\x1b[94m·\x1b[0m Завантаження аудіо...${update.percent != null ? ` \x1b[1m${update.percent.toFixed(1)}%\x1b[0m` : ''}${update.speed ? ` (${update.speed})` : ''}`,
						}
						break
					case 'segmenting':
						yield {
							type: 'progress',
							message: `\x1b[94m·\x1b[0m Конвертація у аудіо...${update.percent != null ? ` \x1b[1m${update.percent.toFixed(1)}%\x1b[0m` : ''}`,
						}
						break
					case 'transcribing':
						yield {
							type: 'progress',
							message: `\x1b[93m·\x1b[0m Конвертація у текст... ${update.chunk}/${update.total} (\x1b[2m${update.model}\x1b[0m)`,
						}
						break
					case 'partial':
						lastChunk = update.text.substring(0, 150)
						yield {
							type: 'progress',
							message: `\x1b[93m·\x1b[0m Чанк ${update.chunk}/${update.total} готово`,
						}
						break
					case 'done':
						yield {
							type: 'log',
							level: 'success',
							message: `\n\x1b[1;32m✓ Finished!\x1b[0m`,
						}
						yield {
							type: 'log',
							level: 'info',
							message: `\x1b[1mTitle:\x1b[0m ${update.title}`,
						}
						yield {
							type: 'log',
							level: 'info',
							message: `\x1b[1mModel:\x1b[0m ${update.model} (language: auto-detected)`,
						}

						const db = this._.db
						const transcript = model.transcript || ''
						const outputPath = this.output
						const outputFormat = this.format || 'txt'

						if (outputPath) {
							await db.saveFile(`@app/${outputPath}`, transcript)
							yield {
								type: 'log',
								level: 'info',
								message: `\x1b[1mTranscript saved to:\x1b[0m ${outputPath}`,
							}
						} else {
							yield { type: 'log', level: 'info', message: '' }
							yield { type: 'log', level: 'info', message: `\x1b[1m─── Transcript ───\x1b[0m` }
							yield { type: 'log', level: 'info', message: transcript }
							yield { type: 'log', level: 'info', message: `\x1b[1m──────────────────\x1b[0m` }
						}

						return {
							type: 'result',
							data: {
								success: true,
								title: update.title,
								transcript,
								outputPath: this.output || null,
							},
						}
					case 'error':
						yield {
							type: 'log',
							level: 'error',
							message: `\n\x1b[1;31m✘ Error:\x1b[0m ${update.error}`,
						}
						// Return an error result
						return {
							type: 'result',
							data: { success: false, message: update.error },
						}
				}
			}
		} catch (err) {
			yield {
				type: 'log',
				level: 'error',
				message: `\x1b[1;31mCritical failure:\x1b[0m ${err.message}`,
			}
			// Return an error result
			return { type: 'result', data: { success: false, message: err.message } }
		}
	}
}
