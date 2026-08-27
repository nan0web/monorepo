import { DriveModel, FileEntryModel } from '../models/DriveModel.js'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

/**
 * DriveIndexerService - Scans directory tree, collects file sizes, and generates offline Drive catalog.
 */
export class DriveIndexerService {
	/**
	 * @param {object} [options]
	 * @param {Function} [options.walker] - Custom filesystem walker for testing.
	 * @param {object} [options.db] - DB client to persist catalogs.
	 */
	constructor(options = {}) {
		this.walker = options.walker || DriveIndexerService.defaultWalker
		this.db = options.db || null
	}

	/**
	 * Scans drive directory and generates DriveModel + FileEntryModel array.
	 * @param {object} params
	 * @param {string} params.driveId
	 * @param {string} params.name
	 * @param {string} params.mountPoint
	 * @returns {Promise<{ drive: DriveModel, files: FileEntryModel[], totalFiles: number, totalBytes: number }>}
	 */
	async indexDrive({ driveId, name, mountPoint }) {
		const rawFiles = await this.walker(mountPoint)

		let totalBytes = 0
		const files = rawFiles.map((f) => {
			totalBytes += Number(f.size || 0)
			return new FileEntryModel({
				driveId,
				relativePath: f.relativePath,
				size: f.size,
				hash: f.hash || `sha256:${DriveIndexerService.hashString(f.relativePath + f.size)}`,
				mtime: f.mtime || new Date().toISOString(),
			})
		})

		const drive = new DriveModel({
			id: driveId,
			name: name || path.basename(mountPoint),
			mountPoint,
			totalSpace: totalBytes * 2, // approximation
			freeSpace: totalBytes,
			status: 'connected',
			lastIndexedAt: new Date().toISOString(),
		})

		return {
			drive,
			files,
			totalFiles: files.length,
			totalBytes,
		}
	}

	/**
	 * Helper quick string hasher.
	 * @param {string} str
	 * @returns {string}
	 */
	static hashString(str) {
		return crypto.createHash('sha256').update(str).digest('hex')
	}

	/**
	 * Default directory walker implementation using node:fs.
	 * @param {string} rootDir
	 * @returns {Promise<Array<{ relativePath: string, size: number, hash?: string, mtime?: string }>>}
	 */
	static async defaultWalker(rootDir) {
		const results = []
		if (!fs.existsSync(rootDir)) return results

		function walk(currentDir) {
			const entries = fs.readdirSync(currentDir, { withFileTypes: true })
			for (const entry of entries) {
				if (entry.name.startsWith('.')) continue
				const fullPath = path.join(currentDir, entry.name)
				if (entry.isDirectory()) {
					walk(fullPath)
				} else if (entry.isFile()) {
					const stat = fs.statSync(fullPath)
					const relPath = path.relative(rootDir, fullPath)
					results.push({
						relativePath: relPath,
						size: stat.size,
						mtime: stat.mtime.toISOString(),
					})
				}
			}
		}

		walk(rootDir)
		return results
	}
}
