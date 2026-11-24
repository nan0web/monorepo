import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const execAsync = promisify(exec)

/**
 * @typedef {Object} WhisperBackend
 * @property {string} name - Backend name (mlx, whisper, cpp)
 * @property {'mlx'|'whisper'|'cpp'} type
 * @property {Function} run - Execute transcription
 */

/**
 * @typedef {Object} WhisperResult
 * @property {string} outputDir - Absolute path to output directory
 * @property {string} baseName - Base filename (without extension)
 * @property {string} format - Output format
 * @property {string[]} filePaths - Expected output file paths
 */

/** @type {Record<string, string>} */
export const MLX_MODEL_MAP = {
	tiny: 'mlx-community/whisper-tiny',
	base: 'mlx-community/whisper-base',
	small: 'mlx-community/whisper-small',
	medium: 'mlx-community/whisper-medium',
	large: 'mlx-community/whisper-large-v3-mlx',
	turbo: 'mlx-community/whisper-large-v3-turbo',
}

/** @type {Record<string, { id: string, sizeBytes: number, sizeLabel: string, speedLabel: string }>} */
export const MLX_MODEL_META = {
	tiny: {
		id: MLX_MODEL_MAP.tiny,
		sizeBytes: 75 * 1024 * 1024,
		sizeLabel: '~75 MB',
		speedLabel: '~20x',
	},
	base: {
		id: MLX_MODEL_MAP.base,
		sizeBytes: 145 * 1024 * 1024,
		sizeLabel: '~145 MB',
		speedLabel: '~12x',
	},
	small: {
		id: MLX_MODEL_MAP.small,
		sizeBytes: 485 * 1024 * 1024,
		sizeLabel: '~485 MB',
		speedLabel: '~6x',
	},
	medium: {
		id: MLX_MODEL_MAP.medium,
		sizeBytes: 1.5 * 1024 * 1024 * 1024,
		sizeLabel: '~1.5 GB',
		speedLabel: '~2.5x',
	},
	large: {
		id: MLX_MODEL_MAP.large,
		sizeBytes: 3.1 * 1024 * 1024 * 1024,
		sizeLabel: '~3.1 GB',
		speedLabel: '~1.0x',
	},
	turbo: {
		id: MLX_MODEL_MAP.turbo,
		sizeBytes: 1.6 * 1024 * 1024 * 1024,
		sizeLabel: '~1.6 GB',
		speedLabel: '~2.0x',
	},
}

/**
 * Format byte count into a human-readable approximate size label.
 * @param {number} bytes
 * @returns {string}
 */
export function formatModelSize(bytes) {
	if (!bytes || bytes <= 0) return 'unknown'
	const gb = bytes / (1024 * 1024 * 1024)
	if (gb >= 1) return `~${gb.toFixed(1)} GB`
	const mb = Math.round(bytes / (1024 * 1024))
	return `~${mb} MB`
}

/**
 * Parse a single stdout/stderr line from mlx_whisper.
 * @param {string} line
 * @returns {{ language?: string, percent?: number, currentTime?: number, text?: string } | null}
 */
export function parseMlxProgressLine(line) {
	if (!line) return null
	const langMatch = line.match(/Detected language:\s*(.+)/)
	if (langMatch) {
		return { language: langMatch[1].trim() }
	}
	const segMatch = line.match(/\[.*?-->\s+(\d{2}):(\d{2})\.(\d{3})\]\s*(.*)/)
	if (segMatch) {
		const mins = parseInt(segMatch[1], 10)
		const secs = parseInt(segMatch[2], 10)
		const ms = parseInt(segMatch[3], 10)
		const currentTime = mins * 60 + secs + ms / 1000
		const percent = Math.min(100, Math.round((currentTime / 300) * 100))
		const text = (segMatch[4] || '').trim()
		return text ? { percent, currentTime, text } : { percent, currentTime }
	}
	return null
}

/**
 * Fetch available mlx-community Whisper models from Hugging Face Hub API with built-in fallback.
 * @param {object} [options]
 * @param {Function} [options.fetchFn]
 * @param {boolean} [options.offline=false]
 * @returns {Promise<Array<{ alias: string|null, id: string, sizeBytes: number, sizeLabel: string, isDefault: boolean }>>}
 */
export async function fetchMlxWhisperModels(options = {}) {
	const fallback = Object.entries(MLX_MODEL_META).map(([alias, meta]) => ({
		alias,
		id: meta.id,
		sizeBytes: meta.sizeBytes,
		sizeLabel: meta.sizeLabel,
		speedLabel: meta.speedLabel,
		isDefault: alias === 'medium',
	}))
	if (options.offline) return fallback
	const fetchFn = options.fetchFn || globalThis.fetch
	if (typeof fetchFn !== 'function') return fallback
	try {
		const url =
			'https://huggingface.co/api/models?author=mlx-community&search=whisper&full=true&expand[]=usedStorage&expand[]=siblings'
		const res = await fetchFn(url, { signal: AbortSignal.timeout(8000) })
		if (!res || !res.ok) return fallback
		const data = await res.json()
		if (!Array.isArray(data) || data.length === 0) return fallback
		const reverseMap = Object.fromEntries(Object.entries(MLX_MODEL_MAP).map(([k, v]) => [v, k]))
		return data.map((item) => {
			const alias = reverseMap[item.id] || null
			const siblingsBytes = Array.isArray(item.siblings)
				? item.siblings.reduce((sum, s) => sum + (s.size || 0), 0)
				: 0
			const bytes = item.usedStorage || item.safetensors?.total || siblingsBytes
			const metaSize = alias ? MLX_MODEL_META[alias] : null
			const sizeBytes = bytes || metaSize?.sizeBytes || 0
			const sizeLabel = bytes > 0 ? formatModelSize(bytes) : metaSize?.sizeLabel || 'unknown'
			const speedLabel = metaSize?.speedLabel || '-'
			return { alias, id: item.id, sizeBytes, sizeLabel, speedLabel, isDefault: alias === 'medium' }
		})
	} catch {
		return fallback
	}
}

/**
 * WhisperEngine — multi-backend transcription engine.
 *
 * Supports three backends in priority order:
 *   1. `mlx`    — mlx_whisper       (Apple Silicon, MLX framework)
 *   2. `whisper` — openai-whisper   (Python, CPU/GPU, cross-platform)
 *   3. `cpp`    — whisper-cli       (whisper.cpp, CPU, cross-platform)
 *
 * Usage:
 *   const engine = await WhisperEngine.detect({ model: 'medium' })
 *   const result = await engine.transcribe('/path/to/audio.mp3')
 *   // result → { outputDir, baseName, format, filePaths }
 */
export class WhisperEngine {
	/** @param {WhisperBackend} backend */
	constructor(backend) {
		this.backend = backend
	}

	/**
	 * Detect available whisper backend, returning the best one.
	 * Priority: mlx > whisper > cpp
	 * @param {Object} [options]
	 * @param {string} [options.model='medium']
	 * @returns {Promise<WhisperEngine>}
	 */
	static async detect(options = {}) {
		const backends = [
			{ name: 'MlxWhisperBackend', type: 'mlx', check: 'mlx_whisper', cls: MlxWhisperBackend },
			{
				name: 'OpenaiWhisperBackend',
				type: 'whisper',
				check: 'whisper',
				cls: OpenaiWhisperBackend,
			},
			{ name: 'WhisperCppBackend', type: 'cpp', check: 'whisper-cli', cls: WhisperCppBackend },
		]

		for (const b of backends) {
			try {
				await execAsync(`which "${b.check}"`, { timeout: 3000 })
				return new WhisperEngine(new b.cls(options))
			} catch {}
		}

		throw new Error(
			'No whisper backend found. Install one of:\n' +
				'  macOS ARM:  pip install mlx-whisper\n' +
				'  Any OS:     pip install openai-whisper\n' +
				'  Any OS:     brew install whisper-cpp  (or build whisper.cpp)'
		)
	}

	/**
	 * Transcribe audio file.
	 * @param {string} audioPath - Path to audio file
	 * @param {Object} [options]
	 * @param {string} [options.model='medium'] - Model size
	 * @param {string} [options.language] - ISO-639-1 language code
	 * @param {string} [options.format='txt'] - Output format
	 * @param {string} [options.outputDir] - Output directory
	 * @returns {Promise<WhisperResult>}
	 */
	async transcribe(audioPath, options = {}) {
		return this.backend.run(audioPath, options)
	}
}

/**
 * @param {string} format
 * @param {string} baseName
 * @param {string} outputDir
 * @returns {string[]}
 */
function buildFilePaths(format, baseName, outputDir) {
	const isJsonOrTsv = format === 'json' || format === 'tsv'
	const names = isJsonOrTsv
		? [`${baseName}-transcript.${format}`, `${baseName}.${format}`]
		: [`${baseName}.${format}`, `${baseName}-transcript.${format}`]
	return names.map((f) => path.join(outputDir, f))
}

/**
 * Normalize Whisper language name or code to ISO-639-1 code (returns undefined for 'auto').
 * @param {string} [lang]
 * @returns {string|undefined}
 */
export function normalizeWhisperLanguage(lang) {
	if (!lang || typeof lang !== 'string') return undefined
	const clean = lang.trim().toLowerCase()
	if (!clean || clean === 'auto') return undefined
	const map = {
		ukrainian: 'uk',
		english: 'en',
		polish: 'pl',
		german: 'de',
		french: 'fr',
		spanish: 'es',
		italian: 'it',
		portuguese: 'pt',
		russian: 'ru',
	}
	return map[clean] || clean
}

/**
 * Build CLI arguments for mlx_whisper.
 * @param {string} audioPath
 * @param {object} [options]
 * @returns {string[]}
 */
export function buildMlxArgs(audioPath, options = {}) {
	const {
		model = 'medium',
		language,
		format = 'txt',
		outputDir = path.dirname(audioPath),
		initialPrompt,
		conditionOnPreviousText = true,
	} = options
	const mlxModel = MLX_MODEL_MAP[model] || model
	const langCode = normalizeWhisperLanguage(language)
	const absOutputDir = path.resolve(outputDir)
	const args = [
		audioPath,
		'--model',
		mlxModel,
		'--output-dir',
		absOutputDir,
		'--output-format',
		format,
		'--verbose',
		'True',
		'--condition-on-previous-text',
		conditionOnPreviousText ? 'True' : 'False',
	]
	if (langCode) args.push('--language', langCode)
	if (format === 'json' || format === 'srt' || format === 'vtt')
		args.push('--word-timestamps', 'True')
	if (initialPrompt && String(initialPrompt).trim()) {
		args.push('--initial-prompt', String(initialPrompt).trim())
	}
	return args
}

// ── Backends ──────────────────────────────────────────────

class MlxWhisperBackend {
	constructor() {}

	async run(audioPath, options = {}) {
		const { spawn } = await import('node:child_process')
		const { format = 'txt', outputDir = path.dirname(audioPath), onProgress } = options
		const baseName = path.basename(audioPath, path.extname(audioPath))
		const absOutputDir = path.resolve(outputDir)
		const args = buildMlxArgs(audioPath, options)

		return new Promise((resolve, reject) => {
			const proc = spawn('mlx_whisper', args, {
				stdio: ['ignore', 'pipe', 'pipe'],
				env: { ...process.env, PYTHONUNBUFFERED: '1' },
			})
			let stderrBuf = ''

			const handleData = (chunk) => {
				stderrBuf += chunk.toString()
				if (onProgress) {
					const lines = stderrBuf.split(/\r?\n|\r/)
					stderrBuf = lines.pop() || ''
					for (const line of lines) {
						const parsed = parseMlxProgressLine(line)
						if (parsed) onProgress(parsed)
					}
				}
			}

			proc.stdout.on('data', handleData)
			proc.stderr.on('data', handleData)

			proc.on('close', (code) => {
				if (code === 0) {
					const filePaths = buildFilePaths(format, baseName, absOutputDir)
					resolve({ outputDir: absOutputDir, baseName, format, filePaths })
				} else {
					const errStr =
						stderrBuf.split('\n').find((l) => l.toLowerCase().includes('error')) ||
						stderrBuf.slice(-500)
					reject(new Error(errStr.trim() || `mlx_whisper exited with code ${code}`))
				}
			})
			proc.on('error', reject)
		})
	}
}

class OpenaiWhisperBackend {
	constructor() {}

	async run(audioPath, options = {}) {
		const {
			model = 'medium',
			language,
			format = 'txt',
			outputDir = path.dirname(audioPath),
		} = options
		const baseName = path.basename(audioPath, path.extname(audioPath))
		const absOutputDir = path.resolve(outputDir)
		const langFlag = language ? ` --language ${language}` : ''
		// openai-whisper uses --word_timestamps (underscore, no hyphen)
		const wordTs =
			format === 'json' || format === 'srt' || format === 'vtt' ? ' --word_timestamps True' : ''
		const cmd = `whisper "${audioPath}" --model ${model}${langFlag} --output_dir "${absOutputDir}" --output_format ${format}${wordTs} --verbose False`

		const { stderr } = await execAsync(cmd, { timeout: 600000 })
		if (stderr && stderr.toLowerCase().includes('error')) {
			throw new Error(
				stderr.split('\n').find((l) => l.toLowerCase().includes('error')) || stderr.trim()
			)
		}

		const filePaths = buildFilePaths(format, baseName, absOutputDir)
		return { outputDir: absOutputDir, baseName, format, filePaths }
	}
}

class WhisperCppBackend {
	constructor(options = {}) {
		this.modelPath = options.modelPath || this.#findDefaultModel(options.model || 'medium')
	}

	async run(audioPath, options = {}) {
		const {
			model = 'medium',
			language,
			format = 'txt',
			outputDir = path.dirname(audioPath),
		} = options
		const baseName = path.basename(audioPath, path.extname(audioPath))
		const absOutputDir = path.resolve(outputDir)

		// Ensure model file exists
		const modelPath = this.modelPath || this.#findDefaultModel(model)
		if (!modelPath) {
			throw new Error(
				'whisper-cpp model not found. Download one:\n' +
					`  whisper-cli --download-model ${model}\n` +
					'  or set modelPath in WhisperEngine options'
			)
		}

		// whisper.cpp CLI flags (whisper-cli)
		const langFlag = language ? ` -l ${language}` : ''
		const fmtFlag = format !== 'txt' ? ` --output-${format}` : ''
		const cmd = `whisper-cli -f "${audioPath}" -m "${modelPath}"${langFlag} --output-dir "${absOutputDir}"${fmtFlag}`

		await execAsync(cmd, { timeout: 600000 })

		const filePaths = buildFilePaths(format, baseName, absOutputDir)
		return { outputDir: absOutputDir, baseName, format, filePaths }
	}

	/**
	 * Try to locate a whisper.cpp model in common locations.
	 * @param {string} model - Model size (tiny, base, small, medium, large, turbo)
	 * @returns {string|null}
	 */
	#findDefaultModel(model) {
		const models = {
			tiny: 'ggml-tiny.bin',
			base: 'ggml-base.bin',
			small: 'ggml-small.bin',
			medium: 'ggml-medium.bin',
			large: 'ggml-large-v3.bin',
			turbo: 'ggml-large-v3-turbo.bin',
		}
		const name = models[model] || `ggml-${model}.bin`
		const home = os.homedir()
		const candidates = [
			path.join(home, '.cache', 'whisper', name),
			path.join(home, '.local', 'share', 'whisper', name),
			path.join('/usr', 'local', 'share', 'whisper', name),
			path.join('/usr', 'share', 'whisper', name),
		]
		return (
			candidates.find((f) => {
				try {
					return fs.existsSync(f)
				} catch {
					return false
				}
			}) || null
		)
	}
}
