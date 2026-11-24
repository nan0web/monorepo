import { ModelAsApp } from '@nan0web/ui-cli'
import { progress, show, result, log } from '@nan0web/ui'
import { WhisperTranscriptionService } from '../analysis/WhisperTranscriptionService.js'
import { WhisperModelCatalog } from '../analysis/WhisperModelCatalog.js'
import { WhisperModelsCommand } from './WhisperModelsCommand.js'
import { AudioSplitter } from '../AudioSplitter.js'
import { blocksToSrt, blocksToVtt } from '../generation/SubtitleChunker.js'

/**
 * @typedef {object} TranscribeCommandOptions
 * @property {string} [input] - Input audio/video file or glob pattern (e.g. "* / * / * /in/*.{mp3|m4a}")
 * @property {string|string[]} [format='text'] - Output format(s): text, json, sbv, srt, vtt
 * @property {string} [language='auto'] - Language code (uk, en, auto)
 * @property {string} [quality='medium'] - Whisper model size (tiny, base, small, medium, large, turbo)
 * @property {boolean} [force=false] - Overwrite existing target derivative files
 * @property {boolean} [quiet=false] - Quiet mode, suppress detailed progress
 * @property {boolean} [isTTY] - Force TTY mode or non-TTY low-frequency logger
 */

/**
 * TranscribeCommand — CLI STT & Subtitles Pipeline (v3.7.0).
 * Batch transcribes media files into multiple subtitle & text formats.
 */
export class TranscribeCommand extends ModelAsApp {
	static alias = 'transcribe'

	static UI = {
		title: '🎙️ Transcribe: CLI Audio Transcription & Subtitles Pipeline',
		noFilesFound: '⚠️ No media files found matching: {pattern}',
		scanning: '🔍 Scanning for files matching {pattern}...',
		foundFiles: 'Found {count} files to transcribe',
		processingFile: '🎙️ [{current}/{total}] Transcribing: {name} ({modelInfo})...',
		fileSkipped: '⏭️ [{current}/{total}] All targets exist for {name} ({paths}) (use --force to overwrite)',
		savingFormat: '💾 Saved {format}: {path}',
		fileComplete: '✅ [{current}/{total}] Completed: {name}',
		allComplete: '🎉 Transcription completed! Processed: {processed}, Skipped: {skipped}, Total: {total}',
		errorProcessing: '❌ Error processing {file}: {error}',
		missingInput: '❌ Input file, directory, or glob pattern is required. Usage: visnyk transcribe <path>',
		batchStart: '📂 Found {count} media file(s) (total duration: {duration}). Starting transcription...',
		batchProgress: '⏱️ Audio processed: {processed} / {total} | Elapsed: {elapsed}',
		embeddedMetadata: '🏷️ Embedded transcription into metadata: {path}',
	}

	static MEDIA_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac', '.mp4', '.mov', '.mkv', '.webm']

	static input = {
		type: 'string',
		required: true,
		positional: true,
		help: 'Input file path, directory, or glob pattern (e.g. "recordings/*.{mp3,m4a}")',
	}

	static format = {
		type: 'array',
		multiselect: true,
		default: ['text'],
		help: 'Output formats (text, json, sbv, srt, vtt)',
	}

	static language = {
		type: 'string',
		required: false,
		default: 'auto',
		help: 'Language code: uk|en|auto (default: auto)',
	}

	static quality = {
		type: 'string',
		required: false,
		default: 'medium',
		alias: 'model',
		help: 'Whisper model size: tiny|base|small|medium|large|turbo',
	}

	static force = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Force overwrite existing target format files',
	}

	static quiet = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Quiet mode (suppress progress output)',
	}

	static embed = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Embed transcription/subtitles into media metadata instead of separate files',
	}

	static offline = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'Run in offline mode without checking remote model hub',
	}

	static tail = {
		type: 'number',
		required: false,
		default: 1,
		help: 'Show last N decoded lines under progress bar (0 to disable)',
	}

	static models = {
		type: 'boolean',
		required: false,
		default: false,
		help: 'List available Whisper models and exit',
	}

	static initialPrompt = {
		type: 'string',
		required: false,
		alias: 'initial-prompt',
		help: 'Initial prompt / vocabulary terms (or path to .txt file) for Whisper',
	}

	static noConditionOnPreviousText = {
		type: 'boolean',
		required: false,
		default: false,
		alias: 'no-condition-on-previous-text',
		help: 'Disable conditioning Whisper decoder on previous text within a chunk',
	}

	static chunkDuration = {
		type: 'number',
		required: false,
		default: 300,
		alias: 'chunk-duration',
		help: 'Audio chunk duration in seconds (default: 300)',
	}

	/**
	 * @param {Partial<TranscribeCommandOptions>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { whisperService?: typeof WhisperTranscriptionService }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		/** @type {string} Input file path or glob pattern */
		this.input
		/** @type {string[]} Output formats (text, json, sbv, srt, vtt) */
		this.format
		/** @type {string} Language code */
		this.language
		/** @type {string} Whisper model size */
		this.quality
		if (data?.model && !data?.quality) this.quality = data.model
		/** @type {boolean} Force overwrite existing target format files */
		this.force
		/** @type {boolean} Quiet mode */
		this.quiet
		/** @type {boolean} Embed transcription into media metadata */
		this.embed
		/** @type {boolean} Run in offline mode */
		this.offline
		/** @type {number} Number of tail lines to show */
		this.tail
		/** @type {boolean} List available Whisper models */
		this.models
		/** @type {string} Initial prompt or path to vocabulary file */
		this.initialPrompt
		/** @type {boolean} Disable conditioning on previous text */
		this.noConditionOnPreviousText
		/** @type {number} Audio chunk duration in seconds */
		this.chunkDuration

		/** @type {typeof WhisperTranscriptionService} Injected Whisper transcription service */
		this.$whisperService = options?.whisperService || WhisperTranscriptionService
		/** @type {Function} Injected metadata embedder */
		this.$embedder = options?.embedder || TranscribeCommand.embedMetadata
	}

	/**
	 * Formats duration in seconds into human-readable string (e.g. 1h 20m, 2m 15s, 45s).
	 * @param {number} seconds
	 * @returns {string}
	 */
	static formatDuration(seconds) {
		const s = Math.max(0, Math.round(seconds || 0))
		const h = Math.floor(s / 3600)
		const m = Math.floor((s % 3600) / 60)
		const rem = s % 60
		if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
		if (m > 0) return `${m}m ${String(rem).padStart(2, '0')}s`
		return `${rem}s`
	}

	/**
	 * Embeds transcription text into media file metadata using ffmpeg.
	 * @param {string} file
	 * @param {string} text
	 */
	static async embedMetadata(file, text) {
		const { execFile } = await import('node:child_process')
		const { promisify } = await import('node:util')
		const execFileAsync = promisify(execFile)
		const tmpFile = `${file}.embed.tmp.${file.split('.').pop()}`
		await execFileAsync('ffmpeg', ['-y', '-i', file, '-c', 'copy', '-metadata', `comment=${text}`, tmpFile])
		const fs = await import('node:fs/promises')
		await fs.rename(tmpFile, file)
	}

	/**
	 * Expands bash-like brace patterns: "a/{b,c}/d" -> ["a/b/d", "a/c/d"].
	 * Also handles pipe syntax: "{mp3|m4a}" -> ["mp3", "m4a"].
	 * @param {string} pattern
	 * @returns {string[]}
	 */
	static expandBraces(pattern) {
		if (!pattern || typeof pattern !== 'string') return []

		// Support pipe as delimiter inside braces: {mp3|m4a} -> {mp3,m4a}
		const normalized = pattern.replace(/\{([^{}]+)\}/g, (match, content) => {
			if (content.includes('|')) {
				return `{${content.split('|').join(',')}}`
			}
			return match
		})

		const braceMatch = normalized.match(/\{([^{}]+)\}/)
		if (!braceMatch) {
			return [normalized]
		}

		const before = normalized.slice(0, braceMatch.index)
		const after = normalized.slice((braceMatch.index || 0) + braceMatch[0].length)
		const options = braceMatch[1].split(',')

		const results = []
		for (const opt of options) {
			const expanded = TranscribeCommand.expandBraces(`${before}${opt}${after}`)
			results.push(...expanded)
		}

		return results
	}

	/**
	 * Resolves matching document paths from an In-Memory DB using expandBraces and glob matching.
	 * @param {import('@nan0web/db').DB} db
	 * @param {string} pattern
	 * @returns {Promise<string[]>}
	 */
	static async findMatchingFiles(db, pattern) {
		if (!db || !pattern) return []

		const patterns = TranscribeCommand.expandBraces(pattern)
		const matched = new Set()

		// Get list of all known documents from DB in-memory data store
		const allDocs = []
		if (db.data && typeof db.data.keys === 'function') {
			for (const key of db.data.keys()) {
				allDocs.push(key)
			}
		} else if (db.data && typeof db.data.entries === 'function') {
			for (const [key] of db.data.entries()) {
				allDocs.push(key)
			}
		} else if (db._dirCache) {
			for (const key of db._dirCache.keys()) {
				allDocs.push(key)
			}
		}

		// If pattern is a directory path (no wildcards), match all media files inside it
		if (!pattern.includes('*') && !pattern.includes('{')) {
			const dirPrefix = pattern.replace(/\/+$/, '')
			for (const docPath of allDocs) {
				if (docPath.startsWith(`${dirPrefix}/`)) {
					const lower = docPath.toLowerCase()
					if (TranscribeCommand.MEDIA_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
						matched.add(docPath)
					}
				}
			}
			if (matched.size > 0) {
				return Array.from(matched).sort()
			}
		}

		// Helper to test if a document path matches a glob pattern
		const matchGlob = (filePath, glob) => {
			// Convert glob to regex: * -> [^/]*, ** -> .*
			const escaped = glob
				.replace(/[.+^${}()|[\]\\]/g, '\\$&')
				.replace(/\*\*/g, '.*')
				.replace(/\*/g, '[^/]*')
			const re = new RegExp(`^${escaped}$`)
			return re.test(filePath)
		}

		for (const p of patterns) {
			// If exact file without wildcards exists in DB
			if (!p.includes('*')) {
				const stat = await db.statDocument(p).catch(() => null)
				if (stat?.exists || (db.data && typeof db.data.has === 'function' && db.data.has(p))) {
					matched.add(p)
				}
				continue
			}

			// Wildcard match against all stored doc keys
			for (const docPath of allDocs) {
				if (matchGlob(docPath, p)) {
					matched.add(docPath)
				}
			}
		}

		return Array.from(matched)
	}

	/**
	 * Returns normalized array of output format strings.
	 * @returns {string[]}
	 */
	getFormatList() {
		const raw = this.format
		if (Array.isArray(raw)) {
			return raw.flatMap((f) => String(f).split(',')).map((f) => f.trim().toLowerCase()).filter(Boolean)
		}
		if (typeof raw === 'string') {
			return raw.split(',').map((f) => f.trim().toLowerCase()).filter(Boolean)
		}
		return ['text']
	}

	/**
	 * Formats Whisper transcription result to the target extension format.
	 * @param {object} whisperResult
	 * @param {string} format - text|txt, json, sbv, srt, vtt
	 * @returns {string}
	 */
	static formatOutput(whisperResult, format) {
		const fmt = (format || '').toLowerCase().trim()
		const segments = whisperResult?.segments || []
		const fullText = whisperResult?.text || segments.map((s) => s.text).join(' ').trim()

		switch (fmt) {
			case 'text':
			case 'txt':
				return fullText

			case 'json':
				return typeof whisperResult === 'string'
					? whisperResult
					: JSON.stringify(whisperResult, null, 2)

			case 'sbv': {
				// YouTube SubViewer format: 0:00:00.000,0:00:02.500
				return segments
					.map((seg) => {
						const start = TranscribeCommand.formatTimeSbv(seg.start)
						const end = TranscribeCommand.formatTimeSbv(seg.end)
						const text = (seg.text || '').trim()
						return `${start},${end}\n${text}`
					})
					.join('\n\n') + '\n'
			}

			case 'srt': {
				const blocks = segments.map((seg) => ({
					text: (seg.text || '').trim(),
					start: seg.start,
					end: seg.end,
				}))
				return blocksToSrt(blocks)
			}

			case 'vtt': {
				const blocks = segments.map((seg) => ({
					text: (seg.text || '').trim(),
					start: seg.start,
					end: seg.end,
				}))
				return blocksToVtt(blocks)
			}

			default:
				return fullText
		}
	}

	/**
	 * Formats seconds to SubViewer time format: H:MM:SS.mmm
	 * @param {number} seconds
	 * @returns {string}
	 */
	static formatTimeSbv(seconds) {
		const sec = Math.max(0, Number(seconds) || 0)
		const h = Math.floor(sec / 3600)
		const m = Math.floor((sec % 3600) / 60)
		const s = Math.floor(sec % 60)
		const ms = Math.floor((sec % 1) * 1000)
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
	}

	/**
	 * Creates a low-frequency progress throttler for TTY vs non-TTY logging.
	 * @param {object} [options]
	 * @param {boolean} [options.isTTY=false]
	 * @param {number} [options.intervalMs=1000]
	 * @param {number} [options.stepPercent=10]
	 */
	static createProgressThrottler(options = {}) {
		const isTTY = options.isTTY ?? false
		const intervalMs = options.intervalMs ?? 1000
		const stepPercent = options.stepPercent ?? 10

		let lastTime = 0
		let lastPercent = -1

		return {
			shouldEmit({ percent, time = Date.now() }) {
				if (isTTY) return true
				if (lastPercent === -1) return true
				if (percent === 100) return true

				const timeDelta = time - lastTime
				const percentDelta = Math.abs(percent - lastPercent)

				if (timeDelta >= intervalMs) return true
				if (percentDelta >= stepPercent) return true

				return false
			},
			markEmitted({ percent, time = Date.now() }) {
				lastTime = time
				lastPercent = percent
			},
		}
	}

	/**
	 * Resolves companion derivative file path (replaces extension or appends).
	 * @param {string} inputPath
	 * @param {string} format
	 * @returns {string}
	 */
	getDerivativePath(inputPath, format) {
		const ext = format === 'text' ? 'txt' : format
		const lastDot = inputPath.lastIndexOf('.')
		if (lastDot > 0 && inputPath.indexOf('/', lastDot) === -1) {
			return `${inputPath.slice(0, lastDot)}.${ext}`
		}
		return `${inputPath}.${ext}`
	}

	/**
	 * Safe translation helper (interpolates {param} placeholders).
	 * @param {string} text
	 * @param {Record<string, any>} [params]
	 * @returns {string}
	 */
	t(text, params = {}) {
		if (typeof super.t === 'function') {
			try {
				return super.t(text, params)
			} catch {}
		}
		if (!text || typeof text !== 'string') return ''
		return text.replace(/\{(\w+)\}/g, (_, key) => (params[key] !== undefined ? params[key] : `{${key}}`))
	}
	/**
	 * Append non-empty line(s) into a ring buffer bounded by limit.
	 * @param {string[]} buffer
	 * @param {string|string[]} textOrList
	 * @param {number} limit
	 */
	static pushTailLine(buffer, textOrList, limit) {
		if (!limit || limit <= 0) return
		const items = Array.isArray(textOrList) ? textOrList : [textOrList]
		for (const item of items) {
			const clean = String(item || '').replace(/\s+/g, ' ').trim()
			if (!clean) continue
			buffer.push(clean)
		}
		if (buffer.length > limit) {
			buffer.splice(0, buffer.length - limit)
		}
	}

	/**
	 * Format progress message with up to tailLimit last decoded lines truncated to terminal width.
	 * @param {string} baseMsg
	 * @param {string[]} tailLines
	 * @param {number} [columns=80]
	 * @param {number} [tailLimit=1]
	 * @returns {string}
	 */
	static formatTailProgress(baseMsg, tailLines, columns = 80, tailLimit = 1) {
		if (!tailLimit || tailLimit <= 0 || !Array.isArray(tailLines) || tailLines.length === 0) {
			return baseMsg
		}
		const maxLen = Math.max(10, (columns || 80) - 5)
		const slice = tailLines.slice(-tailLimit).map((line) => {
			const clean = String(line).replace(/\s+/g, ' ').trim()
			const cut = clean.length > maxLen ? `${clean.slice(0, maxLen - 3)}...` : clean
			return `  │ ${cut}`
		})
		return `${baseMsg}\n${slice.join('\n')}`
	}

	async *run() {
		if (this.models) {
			const modelsCmd = new WhisperModelsCommand({ offline: Boolean(this.offline) }, this._)
			return yield* modelsCmd.run()
		}

		const db = this.$db
		const inputPattern = this.input
		const formats = this.getFormatList()
		const force = Boolean(this.force)
		const quiet = Boolean(this.quiet)

		if (!inputPattern) {
			yield log(this.t(TranscribeCommand.UI.missingInput), 'error')
			return result({ status: 'error', reason: 'missing_input' })
		}

		// Find all matching files via DB in-memory or registered files
		let files = await TranscribeCommand.findMatchingFiles(db, inputPattern)
		if (files.length === 0) {
			// If not a pattern but a direct file name
			if (!inputPattern.includes('*') && !inputPattern.includes('{')) {
				files = [inputPattern]
			} else {
				yield show(this.t(TranscribeCommand.UI.noFilesFound, { pattern: inputPattern }), 'warn')
				return result({ status: 'ok', processed: 0, skipped: 0, total: 0 })
			}
		}

		let processed = 0
		let skipped = 0

		const fileDurations = await Promise.all(
			files.map((f) => AudioSplitter.probeDuration(f).catch(() => 0).then((d) => d || 0))
		)
		const totalDurationSec = fileDurations.reduce((acc, d) => acc + d, 0)
		let processedDurationSec = 0
		const batchStartTime = Date.now()

		if (!quiet && files.length > 1) {
			yield show(
				this.t(TranscribeCommand.UI.batchStart, {
					count: files.length,
					duration: TranscribeCommand.formatDuration(totalDurationSec),
				}),
				'info'
			)
		}

		const isTTY = this.isTTY ?? Boolean(process.stdout?.isTTY)
		const throttler = TranscribeCommand.createProgressThrottler({ isTTY, intervalMs: 2000, stepPercent: 10 })

		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			const fileName = (db.basename ? db.basename(file) : file.split('/').pop()) || file

			// Check if all requested derivative formats already exist
			const derivativeMap = new Map()
			let allExist = !this.embed

			if (!this.embed) {
				for (const fmt of formats) {
					const derivPath = this.getDerivativePath(file, fmt)
					derivativeMap.set(fmt, derivPath)

					if (!force) {
						const stat = await db.statDocument(derivPath).catch(() => null)
						const hasDoc = stat?.exists || (db.data && typeof db.data.has === 'function' && db.data.has(derivPath))
						if (!hasDoc) {
							allExist = false
						}
					} else {
						allExist = false
					}
				}
			}

			if (allExist) {
				skipped++
				if (!quiet) {
					yield show(
						this.t(TranscribeCommand.UI.fileSkipped, {
							current: i + 1,
							total: files.length,
							name: fileName,
							paths: Array.from(derivativeMap.values()).join(', '),
						}),
						'info'
					)
				}
				continue
			}

			// Transcribe using Whisper service
			const quality = this.quality || 'medium'
			const sizeLabel = WhisperModelCatalog.getModelSizeLabel(quality)
			const modelInfo = sizeLabel ? `model: ${quality} · ${sizeLabel}` : `model: ${quality}`
			if (!quiet) {
				yield show(
					this.t(TranscribeCommand.UI.processingFile, {
						current: i + 1,
						total: files.length,
						name: fileName,
						modelInfo,
					}),
					'info'
				)
			}

			// Probe audio/video duration in seconds for accurate progress bar
			const fileDurationSec = (await AudioSplitter.probeDuration(file).catch(() => 0)) || 0
			const fileStartTime = Date.now()

			// Run transcription
			let resolvedPrompt = this.initialPrompt
			if (resolvedPrompt && db && typeof db.loadDocument === 'function') {
				const stat = await db.statDocument(resolvedPrompt).catch(() => null)
				if (stat?.exists) {
					const doc = await db.loadDocument(resolvedPrompt).catch(() => null)
					const content = typeof doc === 'object' && doc ? doc.content || doc.value : doc
					if (typeof content === 'string' && content.trim()) resolvedPrompt = content.trim()
				}
			}
			const outputDir = db.dirname ? db.dirname(file) : file.split('/').slice(0, -1).join('/')
			const transcribeGen = this.$whisperService.transcribe({
				url: file,
				outputDir,
				language: this.language || 'auto',
				quality: this.quality || 'medium',
				initialPrompt: resolvedPrompt,
				conditionOnPreviousText: !this.noConditionOnPreviousText,
				chunkDuration: Number(this.chunkDuration) || 300,
				silentHeader: true,
				saveCache: formats.includes('json'),
				offline: Boolean(this.offline),
				db,
				t: (k, params) => this.t(k, params),
				context: this.context,
			})

			let whisperResult = null
			let maxProgress = 0
			let inTranscribePhase = false
			let lastLanguage = null
			const tailLimit = Number.isFinite(Number(this.tail)) ? Math.max(0, Number(this.tail)) : 1
			const tailLines = []
			const termCols = process.stdout?.columns || 80
			while (true) {
				const { value: event, done } = await transcribeGen.next()
				if (done) {
					whisperResult = event?.whisperJson || event
					break
				}
				if (event && event.language && event.language !== lastLanguage) {
					lastLanguage = event.language
					if (!quiet) {
						yield show(`🌐 Detected language: ${lastLanguage}`, 'info')
					}
				}
				if (event && (event.texts || event.text)) {
					TranscribeCommand.pushTailLine(tailLines, event.texts || event.text, tailLimit)
				}
				if (event && event.type === 'progress') {
					const msg = event.message || ''
					const isTranscribeMsg = msg.includes('Whisper') || msg.includes('Chunk')
					if (!inTranscribePhase && isTranscribeMsg) {
						inTranscribePhase = true
						maxProgress = 0
					}
					const current = event.value ?? event.current ?? event.percent ?? 0
					const total = event.total ?? event.options?.total ?? 100
					const ratio = total > 0 ? current / total : 0
					const pct = Math.round(ratio * 100)
					const pTotal = fileDurationSec > 0 ? Math.round(fileDurationSec) : 100
					const pCurrent = Math.max(maxProgress, Math.round(ratio * pTotal))
					maxProgress = pCurrent
					if (isTranscribeMsg || throttler.shouldEmit({ percent: pct, time: Date.now() })) {
						throttler.markEmitted({ percent: pct, time: Date.now() })
						if (!quiet) {
							const displayMsg = isTranscribeMsg
								? TranscribeCommand.formatTailProgress(msg || 'Transcribing...', tailLines, termCols, tailLimit)
								: msg || 'Transcribing...'
							yield progress(displayMsg, pCurrent, pTotal, { id: isTranscribeMsg ? 'transcribe' : 'whisper-prep' })
						}
					}
				} else if (event) {
					if (!quiet) yield event
				}
			}

			if (whisperResult?.whisperJson) {
				whisperResult = whisperResult.whisperJson
			}

			if (!whisperResult) {
				// Fallback: check if transcript.json was saved in outputDir
				const jsonPath = db.resolveSync ? db.resolveSync(outputDir, 'transcript.json') : `${outputDir}/transcript.json`
				const saved = await db.loadDocument(jsonPath).catch(() => null)
				if (saved) {
					whisperResult = typeof saved === 'string' ? JSON.parse(saved) : saved
				}
			}

			if (whisperResult) {
				if (this.embed) {
					const primaryFmt = formats[0] || 'text'
					const formattedContent = TranscribeCommand.formatOutput(whisperResult, primaryFmt)
					await this.$embedder(file, formattedContent)
				} else {
					// Save all requested derivative formats into DB
					for (const [fmt, targetPath] of derivativeMap.entries()) {
						const formattedContent = TranscribeCommand.formatOutput(whisperResult, fmt)
						await db.saveDocument(targetPath, formattedContent)
						if (!quiet) {
							yield show(this.t(TranscribeCommand.UI.savingFormat, { format: fmt, path: targetPath }), 'success')
						}
					}
				}

				processed++
				if (!quiet) {
					const elapsedSec = Math.max(0.1, (Date.now() - fileStartTime) / 1000)
					const speedInfo =
						fileDurationSec > 0
							? ` (${TranscribeCommand.formatDuration(elapsedSec)} · ${(fileDurationSec / elapsedSec).toFixed(1)}x realtime)`
							: ` (${TranscribeCommand.formatDuration(elapsedSec)})`
					yield show(
						this.t(TranscribeCommand.UI.fileComplete, {
							current: i + 1,
							total: files.length,
							name: fileName,
						}) + speedInfo,
						'success'
					)
				}
			}
			processedDurationSec += fileDurations[i] || 0
			if (!quiet && files.length > 1) {
				const elapsedSec = Math.round((Date.now() - batchStartTime) / 1000)
				yield show(
					this.t(TranscribeCommand.UI.batchProgress, {
						processed: TranscribeCommand.formatDuration(processedDurationSec),
						total: TranscribeCommand.formatDuration(totalDurationSec),
						elapsed: TranscribeCommand.formatDuration(elapsedSec),
					}),
					'info'
				)
			}
		}

		if (!quiet) {
			yield show(
				this.t(TranscribeCommand.UI.allComplete, {
					processed,
					skipped,
					total: files.length,
				}),
				'success'
			)
		}

		return result({
			status: 'ok',
			processed,
			skipped,
			total: files.length,
		})
	}
}
