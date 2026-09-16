import fs from 'node:fs'
import { DocumentStat, DocumentEntry } from '@nan0web/db'
import DBFSDoc from './DBFSDoc.js'

/**
 * Directory and locale management layer for filesystem database.
 * Handles directory listing, stats mapping and auto-detection of locales.
 *
 * @class
 * @extends {DBFSDoc}
 */
export default class DBFSDir extends DBFSDoc {
	/**
	 * Creates a DocumentStat instance from fs.Stats.
	 * @param {import("node:fs").Stats} stats The fs.Stats object.
	 * @returns {DocumentStat} A new DocumentStat instance.
	 */
	static createDocumentStatFrom(stats) {
		return new DocumentStat({
			atimeMs: stats.atimeMs,
			btimeMs: stats.birthtimeMs,
			blksize: stats.blksize,
			blocks: stats.blocks,
			ctimeMs: stats.ctimeMs,
			dev: stats.dev,
			gid: stats.gid,
			ino: stats.ino,
			mode: stats.mode,
			mtimeMs: stats.mtimeMs,
			nlink: stats.nlink,
			rdev: stats.rdev,
			size: stats.size,
			uid: stats.uid,
			isDirectory: stats.isDirectory(),
			isFile: stats.isFile(),
			isBlockDevice: stats.isBlockDevice(),
			isFIFO: stats.isFIFO(),
			isSocket: stats.isSocket(),
			isSymbolicLink: stats.isSymbolicLink(),
		})
	}

	/**
	 * Lists the contents of a directory.
	 * @param {string} uri The directory URI to list.
	 * @param {{depth?: number, skipStat?: boolean}} [options={}] Options for listing.
	 * @returns {Promise<DocumentEntry[]>} The list of directory entries.
	 */
	async listDir(uri, { depth = 0, skipStat = false } = {}) {
		this.console.debug('Listing directory', { uri, depth, skipStat })
		const path = this.location(uri)
		const entries = /** @type {import("node:fs").Dirent[]} */ (
			/** @type {unknown} */ (await this.FS.readdir(path, { withFileTypes: true }))
		)
		const files = await Promise.all(
			entries.map(async (entry) => {
				let stat = new DocumentStat({
					isDirectory: entry.isDirectory(),
					isFile: entry.isFile(),
					isSymbolicLink: entry.isSymbolicLink(),
				})
				if (!skipStat) {
					try {
						const entryPath = this.FS.resolve(path, entry.name)
						const createStat =
							/** @type {typeof DBFSDir} */ (this.constructor).createDocumentStatFrom ||
							DBFSDir.createDocumentStatFrom
						Object.assign(stat, createStat(await fs.promises.lstat(entryPath)))
					} catch (err) {
						stat.error = /** @type {Error} */ (err)
					}
				}
				const file = this.FS.relative(this.location(''), this.FS.resolve(path, entry.name))
				return new DocumentEntry({
					stat,
					name: entry.name,
					path: file,
					depth,
				})
			})
		)
		files.sort((a, b) => Number(b.stat.isDirectory) - Number(a.stat.isDirectory))
		return files
	}

	/**
	 * Detects auto-locales based on first level directory names.
	 * Matches against built-in Intl language list.
	 * @returns {Promise<{locale: string, title: string, dir: string}[]>}
	 */
	async detectLocales() {
		const entries = await this.listDir('', { depth: 0, skipStat: false })
		const locales = []

		for (const entry of entries) {
			if (!entry.stat.isDirectory || entry.name.startsWith('_') || entry.name.startsWith('.'))
				continue
			try {
				const loc = new Intl.Locale(entry.name)
				const display = new Intl.DisplayNames([entry.name], {
					type: 'language',
					fallback: 'none',
				})
				// Get language name natively, capitalize first letter
				const name = display.of(entry.name)
				if (!name) continue
				const title = name.charAt(0).toUpperCase() + name.slice(1)
				/** @ts-ignore — Intl.Locale.textInfo is Stage 3, supported in Node 21+ */
				const dir = loc.textInfo?.direction === 'rtl' ? 'rtl' : 'ltr'
				locales.push({
					locale: entry.name,
					title,
					dir,
				})
			} catch (err) {
				// Not a valid BCP 47 locale tag, skip
			}
		}

		// Sort alphabetically by locale
		locales.sort((a, b) => a.locale.localeCompare(b.locale))

		return locales
	}
}
