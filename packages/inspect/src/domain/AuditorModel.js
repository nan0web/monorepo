import { ModelAsApp } from '@nan0web/ui'
import { StackDetector } from '@nan0web/core'

/** @typedef {'js' | 'python' | 'unknown'} LanguagePlatform */

/**
 * @typedef {Object} AuditorError
 * @property {string} [file] Target file where the error occurred
 * @property {string} [check] Logical check identifier (e.g. scripts.test)
 * @property {string} error Human-readable error description
 * @property {string} [suggestion] Optional code snippet or command to fix the issue
 * @property {string[]} [boundary] Files that must be modified to fix the issue
 * @property {string[]} [context] Files needed as context to understand the fix
 */

/**
 * AuditorModel — Base model for all architecture auditors.
 */
export class AuditorModel extends ModelAsApp {
	static alias = ''

	static dir = {
		help: 'Target directory to audit',
		type: 'string',
		default: '.',
		positional: true,
	}

	static help = {
		help: 'Show help',
		default: false,
	}

	static fix = {
		help: 'Automatically apply fixes where possible',
		default: false,
		type: 'boolean',
	}

	static platform = {
		help: 'Language platform (js, python)',
		options: ['js', 'python'],
		default: 'js',
	}

	static timeout = {
		help: 'Execution timeout in seconds',
		type: 'number',
		default: 30,
	}

	/** @type {LanguagePlatform?} LanguagePlatform on construction */
	#specificPlatform

	/**
	 * @param {Partial<AuditorModel> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target directory to audit */ this.dir
		/** @type {boolean} Show help */ this.help
		/** @type {LanguagePlatform} Language platform to audit */ this.platform
		/** @type {boolean} Automatically apply fixes where possible */ this.fix =
			Boolean(data.fix || (options && 'fix' in options ? (/** @type {any} */(options)).fix : false))
		this.#specificPlatform = data.platform


	}

	/**
	 * Initializes the auditor by detecting a platform if were not specified at construction.
	 */
	async init() {
		if (!this._.db) throw new Error('DB not found in context')

		if (!this.#specificPlatform || !this.platform) {
			const detected = await StackDetector.detectPlatform(this._.db, this.dir)
			this.platform = (detected === 'unknown' ? 'js' : detected) ?? 'js'
		}
	}

	/**
	 * Check if a file exists in the target directory.
	 * @param {string} rel - Relative path to the file.
	 * @returns {Promise<boolean>}
	 */
	async fileExists(rel) {
		if (!this._.db) return false
		let path = rel.startsWith('@') ? rel : this._.db.resolveSync(this.dir, rel)
		if (path.startsWith('./')) path = path.slice(2)
		const s = await this._.db.statDocument(path).catch(() => null)
		return s?.exists === true && s?.isFile === true
	}

	/**
	 * Check if a directory exists in the target directory.
	 * @param {string} rel - Relative path to the directory.
	 * @returns {Promise<boolean>}
	 */
	async dirExists(rel) {
		if (!this._.db) return false
		let path = rel.startsWith('@') ? rel : this._.db.resolveSync(this.dir, rel)
		if (path.startsWith('./')) path = path.slice(2)
		const s = await this._.db.statDocument(path.endsWith('/') ? path : path + '/').catch(() => null)
		return s?.exists === true && s?.isDirectory === true
	}
}
