import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { StackDetector } from '@nan0web/inspect'

/**
 * @typedef {Object} OSExecutorOptions
 * @property {string} [cwd] Current working directory
 */

/**
 * OSExecutor class that implements the OS-adapter contract for llimo.v3
 */
export class OSExecutor {
	/**
	 * @param {OSExecutorOptions} [options]
	 */
	constructor(options = {}) {
		this.cwd = options.cwd || process.cwd()
	}

	/**
	 * Execute a shell command securely and return output
	 * @param {string} command
	 * @param {Object} [options]
	 * @param {number} [options.timeout] timeout in ms
	 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
	 */
	async executeCommand(command, options = {}) {
		return new Promise((resolve) => {
			exec(command, { cwd: this.cwd, timeout: options.timeout }, (error, stdout, stderr) => {
				resolve({
					code: error ? error.code || 1 : 0,
					stdout: stdout.toString(),
					stderr: stderr.toString(),
				})
			})
		})
	}

	/**
	 * Check if file or directory exists
	 * @param {string} filePath
	 * @returns {Promise<boolean>}
	 */
	async exists(filePath) {
		const target = path.resolve(this.cwd, filePath)
		try {
			await fs.access(target)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Read file content
	 * @param {string} filePath
	 * @param {BufferEncoding} [encoding='utf8']
	 * @returns {Promise<string>}
	 */
	async readFile(filePath, encoding = 'utf8') {
		const target = path.resolve(this.cwd, filePath)
		return await fs.readFile(target, encoding)
	}

	/**
	 * Write file content
	 * @param {string} filePath
	 * @param {string} content
	 * @returns {Promise<void>}
	 */
	async writeFile(filePath, content) {
		const target = path.resolve(this.cwd, filePath)
		await fs.mkdir(path.dirname(target), { recursive: true })
		await fs.writeFile(target, content, 'utf8')
	}

	/**
	 * Detect project platform (js, python, unknown)
	 * @param {any} db - @nan0web/db instance
	 * @param {string} dir
	 * @returns {Promise<'js' | 'python' | 'unknown'>}
	 */
	async detectPlatform(db, dir) {
		return /** @type {any} */ (await StackDetector.detectPlatform(db, dir))
	}
}
