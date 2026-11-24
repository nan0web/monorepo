import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { ModelAsApp } from '@nan0web/ui-cli'
import { progress, result, show } from '@nan0web/ui'

const AUDIO_EXTENSIONS = new Set(['.mp3', '.m4a', '.flac', '.wav', '.ogg', '.opus', '.aac', '.webm'])
const FAT32_MAX_FILE_BYTES = 4 * 1024 * 1024 * 1024 - 1

const CATEGORY_MAP = {
	'01_Ukrainian': 'Music/01_Ukrainian',
	'02_Modern_Hits': 'Music/02_Modern_Hits',
	'03_Chill_Drive': 'Music/03_Chill_Drive',
	Audiobooks: 'Audiobooks',
}

/**
 * Default synchronous runner for ffmpeg.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {{ status: number | null, stdout: Buffer, stderr: Buffer, error?: Error }}
 */
function defaultExec(cmd, args) {
	return spawnSync(cmd, args, { maxBuffer: 10 * 1024 * 1024 })
}

/**
 * MusicPrepareCommand — Prepares FAT32 media structure and ID3v2.3 MP3 files (192-320 kbps)
 * for VW Golf B7 USA (`MUSIC32` SD card).
 */
export class MusicPrepareCommand extends ModelAsApp {
	static alias = 'music:prepare'

	static CANONICAL_DIRS = [
		'Music/01_Ukrainian',
		'Music/02_Modern_Hits',
		'Music/03_Chill_Drive',
		'Audiobooks',
	]

	static UI = {
		title: '🎵 MUSIC32: FAT32 & ID3v2.3 Media Preparation (VW Golf B7 USA)',
		invalidCategory: '❌ Invalid category "{category}". Allowed: 01_Ukrainian, 02_Modern_Hits, 03_Chill_Drive, Audiobooks',
		invalidBitrate: '❌ Invalid bitrate "{bitrate}". Allowed: 192k, 256k, 320k',
		missingSource: '⚠️ No source specified; initialized canonical MUSIC32 directory structure only.',
		sourceNotFound: '❌ Source path not found: {source}',
		done: '🎉 MUSIC32 preparation completed! Processed: {processed}, Skipped: {skipped}',
	}

	static source = {
		default: '',
		positional: true,
		help: 'Source audio file or directory',
	}

	static target = {
		default: '/Volumes/MUSIC32',
		help: 'Target MUSIC32 root directory (FAT32)',
	}

	static category = {
		default: '01_Ukrainian',
		help: 'Target category: 01_Ukrainian | 02_Modern_Hits | 03_Chill_Drive | Audiobooks',
	}

	static bitrate = {
		default: '192k',
		help: 'MP3 bitrate for VW Golf B7 USA: 192k | 256k | 320k',
	}

	static maxSizeGb = {
		default: 12,
		type: 'number',
		help: 'Maximum size budget in GB (8-12 GB for Music)',
	}

	static initStructure = {
		default: true,
		type: 'boolean',
		help: 'Ensure canonical MUSIC32 folders exist',
	}

	static dryRun = {
		default: false,
		type: 'boolean',
		help: 'Simulate preparation without writing or transcoding files',
	}

	static skipExisting = {
		default: false,
		type: 'boolean',
		help: 'Skip files that already exist and are non-empty at target',
	}

	/**
	 * @param {Partial<MusicPrepareCommand>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { exec?: typeof defaultExec }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.source
		/** @type {string} */ this.target
		/** @type {string} */ this.category
		/** @type {string} */ this.bitrate
		/** @type {number} */ this.maxSizeGb
		/** @type {boolean} */ this.initStructure
		/** @type {boolean} */ this.dryRun
		/** @type {boolean} */ this.skipExisting
		/** @type {typeof defaultExec} */
		this.$exec = options?.exec || defaultExec
	}

	/**
	 * Resolves relative target subdirectory for a given category.
	 * @param {string} category
	 * @returns {string | null}
	 */
	static resolveCategoryDir(category) {
		return CATEGORY_MAP[category] || null
	}

	/**
	 * Sanitizes a filename for FAT32 compatibility.
	 * @param {string} filename
	 * @returns {string}
	 */
	static sanitizeFat32Name(filename) {
		const cleaned = filename
			.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
			.replace(/[. ]+$/g, '')
			.trim()
		if (!cleaned) return 'track'
		return cleaned.length > 200 ? cleaned.slice(0, 200) : cleaned
	}

	/**
	 * Builds ffmpeg CLI arguments for ID3v2.3 MP3 output.
	 * @param {string} inputPath
	 * @param {string} outputPath
	 * @param {string} [bitrate='192k']
	 * @returns {string[]}
	 */
	static buildFfmpegArgs(inputPath, outputPath, bitrate = '192k') {
		return [
			'-y',
			'-i',
			inputPath,
			'-vn',
			'-codec:a',
			'libmp3lame',
			'-b:a',
			bitrate,
			'-id3v2_version',
			'3',
			'-write_id3v1',
			'1',
			'-map_metadata',
			'0',
			outputPath,
		]
	}

	/**
	 * Recursively collects supported audio files from a path.
	 * @param {string} srcPath
	 * @returns {string[]}
	 */
	static collectAudioFiles(srcPath) {
		if (!existsSync(srcPath)) return []
		const st = statSync(srcPath)
		if (st.isFile()) {
			return AUDIO_EXTENSIONS.has(extname(srcPath).toLowerCase()) ? [srcPath] : []
		}
		/** @type {string[]} */
		const out = []
		for (const entry of readdirSync(srcPath, { withFileTypes: true })) {
			const full = join(srcPath, entry.name)
			if (entry.isDirectory()) {
				out.push(...MusicPrepareCommand.collectAudioFiles(full))
			} else if (entry.isFile() && AUDIO_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
				out.push(full)
			}
		}
		return out.sort()
	}

	/**
	 * Ensures canonical MUSIC32 folders exist under target.
	 */
	ensureStructure() {
		if (this.dryRun) return
		for (const rel of MusicPrepareCommand.CANONICAL_DIRS) {
			mkdirSync(join(this.target, rel), { recursive: true })
		}
	}

	/**
	 * Executes the MUSIC32 preparation pipeline.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		if (this.help) {
			return yield* super.run()
		}

		const relCategoryDir = MusicPrepareCommand.resolveCategoryDir(this.category)
		if (!relCategoryDir) {
			yield show(MusicPrepareCommand.UI.invalidCategory.replace('{category}', this.category), 'error')
			return result({ ok: false, reason: 'invalid_category' })
		}

		if (!['192k', '256k', '320k'].includes(this.bitrate)) {
			yield show(MusicPrepareCommand.UI.invalidBitrate.replace('{bitrate}', this.bitrate), 'error')
			return result({ ok: false, reason: 'invalid_bitrate' })
		}

		yield show(MusicPrepareCommand.UI.title, 'info')

		if (this.initStructure) {
			this.ensureStructure()
		}

		if (!this.source) {
			yield show(MusicPrepareCommand.UI.missingSource, 'warn')
			return result({ ok: true, processed: 0, skipped: 0, files: [] })
		}

		if (!existsSync(this.source)) {
			yield show(MusicPrepareCommand.UI.sourceNotFound.replace('{source}', this.source), 'error')
			return result({ ok: false, reason: 'source_not_found' })
		}

		const files = MusicPrepareCommand.collectAudioFiles(this.source)
		const destDir = join(this.target, relCategoryDir)
		if (!this.dryRun) {
			mkdirSync(destDir, { recursive: true })
		}

		const maxBytes = (this.maxSizeGb || 12) * 1024 * 1024 * 1024
		let totalBytes = 0
		let processed = 0
		let skipped = 0
		/** @type {string[]} */
		const outputs = []

		for (let i = 0; i < files.length; i++) {
			const srcFile = files[i]
			const srcSize = statSync(srcFile).size
			if (srcSize > FAT32_MAX_FILE_BYTES || totalBytes + srcSize > maxBytes) {
				skipped++
				continue
			}

			const base = basename(srcFile, extname(srcFile))
			const safeName = `${MusicPrepareCommand.sanitizeFat32Name(base)}.mp3`
			const destFile = join(destDir, safeName)
			if (this.skipExisting && existsSync(destFile) && statSync(destFile).size > 0) {
				totalBytes += statSync(destFile).size
				skipped++
				continue
			}
			const pct = Math.round(((i + 1) / files.length) * 100)

			yield progress(`🎵 [${this.category}] ${safeName} (${this.bitrate}, ID3v2.3)`, pct)

			if (!this.dryRun) {
				const args = MusicPrepareCommand.buildFfmpegArgs(srcFile, destFile, this.bitrate)
				const execRes = this.$exec('ffmpeg', args)
				if (execRes.error || execRes.status !== 0) {
					const reason = execRes.error?.message || execRes.stderr?.toString('utf8').trim() || `exit ${execRes.status}`
					yield show(`❌ ffmpeg failed for ${basename(srcFile)}: ${reason}`, 'error')
					skipped++
					continue
				}
			}

			totalBytes += srcSize
			processed++
			outputs.push(destFile)
		}

		yield show(
			MusicPrepareCommand.UI.done.replace('{processed}', String(processed)).replace('{skipped}', String(skipped)),
			'success',
		)
		return result({ ok: true, processed, skipped, files: outputs, targetDir: destDir })
	}
}
