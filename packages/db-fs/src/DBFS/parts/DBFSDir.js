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
	 * @param {any} [context=this.context]
	 * @returns {Promise<DocumentEntry[]>} The list of directory entries.
	 */
	async listDir(uri, { depth = 0, skipStat = false } = {}, context = this.context) {
		const mount = this._findMount(uri)
		if (mount) {
			const entries = await mount.db.listDir(mount.subUri, { depth, skipStat }, context)
			const normalized = this.normalize(uri)
			let prefix = ''
			for (const [p] of this.mounts) {
				if (p === '' || normalized === p || normalized.startsWith(p + '/')) {
					prefix = p
					break
				}
			}
			return entries.map((e) => {
				e.path = this.resolveSync(prefix, e.path)
				if (e.parent) {
					e.parent = this.resolveSync(prefix, e.parent)
				}
				return e
			})
		}
		this.console.debug('Listing directory', { uri, depth, skipStat })
		const path = this.location(uri)
		const rawEntries = /** @type {import("node:fs").Dirent[]} */ (
			/** @type {unknown} */ (await this.FS.readdir(path, { withFileTypes: true }))
		)

		// Expand 2-character Base36 shard bucket directories transparently
		/** @type {Array<{name: string, isDirectory: boolean, isFile: boolean, isSymbolicLink: boolean, fullPath: string}>} */
		const entries = []
		for (const entry of rawEntries) {
			const entryPath = this.FS.resolve(path, entry.name)
			let isShard = false
			if (entry.isDirectory() && /^[a-z0-9]{2}$/.test(entry.name)) {
				try {
					const subEntries = await this.FS.readdir(entryPath, { withFileTypes: true })
					if (subEntries.some((s) => s.name.includes('~'))) {
						isShard = true
						for (const sub of subEntries) {
							entries.push({
								name: sub.name,
								isDirectory: sub.isDirectory(),
								isFile: sub.isFile(),
								isSymbolicLink: sub.isSymbolicLink(),
								fullPath: this.FS.resolve(entryPath, sub.name),
							})
						}
					}
				} catch {
					// In case of unreadable directory
				}
			}
			if (!isShard) {
				entries.push({
					name: entry.name,
					isDirectory: entry.isDirectory(),
					isFile: entry.isFile(),
					isSymbolicLink: entry.isSymbolicLink(),
					fullPath: entryPath,
				})
			}
		}

		const files = await Promise.all(
			entries.map(async (entry) => {
				let stat = new DocumentStat({
					isDirectory: entry.isDirectory,
					isFile: entry.isFile,
					isSymbolicLink: entry.isSymbolicLink,
				})
				if (!skipStat) {
					try {
						const createStat =
							/** @type {typeof DBFSDir} */ (this.constructor).createDocumentStatFrom ||
							DBFSDir.createDocumentStatFrom
						Object.assign(stat, createStat(await fs.promises.lstat(entry.fullPath)))
					} catch (err) {
						stat.error = /** @type {Error} */ (err)
					}
				}
				const rawRelFile = this.FS.relative(this.location(''), entry.fullPath)
				const unsharedRel = this.unshardPath(rawRelFile)
				const unsharedName = this.constructor.unshardSegment
					? this.constructor.unshardSegment(entry.name)
					: entry.name.replaceAll('~', ':')

				return new DocumentEntry({
					stat,
					name: unsharedName,
					path: unsharedRel,
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
