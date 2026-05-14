/**
 * @module Session
 * @description Lightweight session persistence for CLI and Node.js applications.
 *
 * Saves and restores the current user identity (email) to a JSON file.
 * Designed for CLI apps — keeps user logged in between runs.
 *
 * @example
 * const session = new Session('/path/to/session.json')
 * session.save('sovr@yaro.page')
 * session.load() // 'sovr@yaro.page'
 * session.clear()
 * session.load() // null
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export default class Session {
	/** @type {string} */
	#filepath

	/**
	 * @param {string} filepath — absolute path to session.json
	 */
	constructor(filepath) {
		this.#filepath = filepath
	}

	/**
	 * Save current user email to disk.
	 *
	 * @param {string} email — user identifier to persist
	 */
	save(email) {
		try {
			const dir = dirname(this.#filepath)
			if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
			const data = {
				email: email || null,
				savedAt: Date.now(),
			}
			writeFileSync(this.#filepath, JSON.stringify(data, null, 2), 'utf-8')
		} catch {
			// silently fail — session is non-critical
		}
	}

	/**
	 * Load saved email from disk.
	 *
	 * @returns {string|null} — saved email or null if not found / corrupt
	 */
	load() {
		try {
			if (!existsSync(this.#filepath)) return null
			const raw = readFileSync(this.#filepath, 'utf-8')
			const data = JSON.parse(raw)
			return data.email || null
		} catch {
			return null
		}
	}

	/**
	 * Clear session file (write empty object).
	 */
	clear() {
		try {
			if (existsSync(this.#filepath)) {
				writeFileSync(this.#filepath, '{}', 'utf-8')
			}
		} catch {
			// silently fail
		}
	}
}
