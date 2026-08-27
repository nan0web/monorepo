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
const MLX_MODEL_MAP = {
	tiny: 'mlx-community/whisper-tiny',
	base: 'mlx-community/whisper-base',
	small: 'mlx-community/whisper-small',
	medium: 'mlx-community/whisper-medium',
	large: 'mlx-community/whisper-large-v3-mlx',
	turbo: 'mlx-community/whisper-large-v3-turbo',
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

// ── Backends ──────────────────────────────────────────────

class MlxWhisperBackend {
	constructor() {}

	async run(audioPath, options = {}) {
		const { spawn } = await import('node:child_process')
		const {
			model = 'medium',
			language,
			format = 'txt',
			outputDir = path.dirname(audioPath),
			onProgress,
		} = options
		const mlxModel = MLX_MODEL_MAP[model] || model
		const baseName = path.basename(audioPath, path.extname(audioPath))
		const langFlag = language ? ['--language', language] : []
		const wordTs =
			format === 'json' || format === 'srt' || format === 'vtt' ? ['--word-timestamps', 'True'] : []
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
			'True', // Enable verbose to capture progress
			...langFlag,
			...wordTs,
		]

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
						// Look for [00:00.000 --> 00:03.000] to get progress inside 5-min chunk
						const m = line.match(/-->\s+(\d{2}):(\d{2})\.(\d{3})\]/)
						if (m) {
							const mins = parseInt(m[1], 10)
							const secs = parseInt(m[2], 10)
							const ms = parseInt(m[3], 10)
							const currentSeconds = mins * 60 + secs + ms / 1000
							// Assuming max chunk is ~300 seconds + overlap
							const pct = Math.min(100, Math.round((currentSeconds / 300) * 100))
							onProgress({ percent: pct, currentTime: currentSeconds })
						}
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
