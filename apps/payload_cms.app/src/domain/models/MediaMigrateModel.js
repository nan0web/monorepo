import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, result } from '@nan0web/ui/core'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
	getMimeType,
	sanitizeFilename,
	scanDirectory,
	ensureFolder,
} from '../utils/mediaUtils.js'

/**
 * MediaMigrateModel - Subcommand to batch import assets into Payload CMS
 */
export class MediaMigrateModel extends ModelAsApp {
	static alias = 'media:import'

	static UI = {
		title: 'Batch Import Media & Assets into Payload CMS',
		start: 'Starting Payload CMS media import...',
		scanning: 'Scanning directory {target}...',
		uploading: 'Importing media ({index}/{total}): {file}...',
		done: 'Media import completed! Created: {created}, Updated: {updated}, Skipped: {skipped}.',
	}

	static dir = {
		help: 'Source directory containing public assets',
		default: 'public',
		positional: true,
	}

	static collection = {
		help: 'Payload CMS media collection slug',
		default: 'media',
	}

	static skipThumbnails = {
		help: 'Skip generated thumbnails and cached miniature files',
		default: true,
		type: 'boolean',
	}

	/**
	 * @param {Partial<MediaMigrateModel>} [data = {}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options = {}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dir
		/** @type {string} */ this.collection
		/** @type {boolean} */ this.skipThumbnails
		/** @type {Map<string, string|number>} */ this.foldersByPath = new Map()
	}

	/**
	 * Resolves initialized Payload CMS instance.
	 * @returns {Promise<any>}
	 */
	async getPayloadInstance() {
		if (this._?.payload) return this._.payload

		const potentialConfigPaths = [
			path.resolve(process.cwd(), 'src/payload.config.js'),
			path.resolve(process.cwd(), 'src/payload.config.ts'),
			path.resolve(process.cwd(), 'payload.config.js'),
			path.resolve(process.cwd(), 'payload.config.ts'),
		]

		for (const configPath of potentialConfigPaths) {
			try {
				await fs.access(configPath)
				const { getPayload } = await import('payload')
				const imported = await import(configPath)
				const configPromise = imported.default || imported.config || imported
				const payload = await getPayload({ config: configPromise })
				return payload
			} catch {
				// Try next candidate
			}
		}

		return null
	}

	/**
	 * Discovers media directories to scan.
	 * @param {string} rootDir
	 * @returns {Promise<string[]>}
	 */
	async resolveSearchDirs(rootDir) {
		const searchDirs = []
		const candidates = [
			path.resolve(rootDir, '..', 'bank/public'),
			path.resolve(rootDir, 'bank/public'),
			path.resolve(rootDir, 'public'),
		]

		if (this.dir && this.dir !== 'public') {
			const customPath = path.resolve(rootDir, this.dir)
			try {
				await fs.access(customPath)
				return [customPath]
			} catch {
				// fallback
			}
		}

		for (const dir of candidates) {
			try {
				const stat = await fs.stat(dir)
				if (stat.isDirectory()) {
					searchDirs.push(dir)
				}
			} catch {
				// directory does not exist
			}
		}

		return searchDirs.length > 0 ? searchDirs : [path.resolve(rootDir, 'public')]
	}

	/**
	 * Imports single file
	 * @param {any} payload
	 * @param {string} filePath
	 * @param {string} baseDir
	 */
	async importFile(payload, filePath, baseDir) {
		const filename = path.basename(filePath)
		const relativePath = path.relative(baseDir, filePath).replaceAll('\\', '/')
		const cleanRelativePath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
		const dirName = path.dirname(cleanRelativePath)
		const folderPath = dirName === '.' ? '' : dirName

		const folderId = folderPath ? await ensureFolder(payload, folderPath, this.foldersByPath) : null
		const sourcePath = cleanRelativePath
		const uri = `/${cleanRelativePath}`
		const alt = path.basename(filename, path.extname(filename))
		const safeFilename = sanitizeFilename(filename)
		let mimeType = getMimeType(filePath)
		const fileBuffer = await fs.readFile(filePath)

		if (mimeType === 'image/svg+xml') {
			const str = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 500)).trim()
			if (!str.includes('<svg') && !str.includes('<?xml')) {
				mimeType = 'text/plain'
			}
		}

		const existing = await payload.find({
			collection: this.collection || 'media',
			limit: 1,
			where: { sourcePath: { equals: sourcePath } },
			overrideAccess: true,
		})

		const data = {
			alt: alt || filename,
			sourcePath,
			uri,
			folder: folderId || undefined,
		}

		if (existing.docs[0]) {
			const updated = await payload.update({
				collection: this.collection || 'media',
				id: existing.docs[0].id,
				data,
				overrideAccess: true,
			})
			return { status: 'updated', doc: updated }
		}

		const created = await payload.create({
			collection: this.collection || 'media',
			data,
			file: {
				data: fileBuffer,
				name: safeFilename,
				mimetype: mimeType,
			},
			overrideAccess: true,
		})
		return { status: 'created', doc: created }
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const t = this._?.t || ((str, params) => {
			if (!params) return str
			return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), str)
		})

		const payload = await this.getPayloadInstance()
		const rootDir = process.cwd()
		const searchDirs = await this.resolveSearchDirs(rootDir)

		yield progress(t(MediaMigrateModel.UI.start))

		let totalFiles = []
		for (const root of searchDirs) {
			yield progress(t(MediaMigrateModel.UI.scanning, { target: root }))
			try {
				const files = await scanDirectory(root, root, {
					skipThumbnails: this.skipThumbnails !== false,
				})
				for (const f of files) {
					totalFiles.push({ ...f, baseDir: root })
				}
			} catch (e) {
				// directory missing
			}
		}

		let created = 0
		let updated = 0
		let skipped = 0
		let i = 0

		for (const file of totalFiles) {
			i++
			if (i % 10 === 0 || i === totalFiles.length) {
				yield progress(
					t(MediaMigrateModel.UI.uploading, {
						file: file.relativePath,
						index: i,
						total: totalFiles.length,
					}),
					i,
					totalFiles.length
				)
			}

			if (payload) {
				try {
					const res = await this.importFile(payload, file.fullPath, file.baseDir)
					if (res.status === 'created') created++
					if (res.status === 'updated') updated++
				} catch (err) {
					skipped++
				}
			} else {
				created++
			}
		}

		yield show(t(MediaMigrateModel.UI.done, { created, updated, skipped }), 'success')
		return result({ status: 'ok', created, updated, skipped, total: totalFiles.length })
	}
}
