import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Maps file extension to standard MIME type.
 * @param {string} filePath
 * @returns {string}
 */
export function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase()
	switch (ext) {
		// Images
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg'
		case '.png':
			return 'image/png'
		case '.webp':
			return 'image/webp'
		case '.svg':
			return 'image/svg+xml'
		case '.gif':
			return 'image/gif'
		case '.ico':
			return 'image/x-icon'
		case '.bmp':
			return 'image/bmp'

		// Documents
		case '.pdf':
			return 'application/pdf'
		case '.xlsx':
			return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		case '.xls':
			return 'application/vnd.ms-excel'
		case '.docx':
			return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		case '.doc':
			return 'application/msword'
		case '.pptx':
			return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
		case '.ppt':
			return 'application/vnd.ms-powerpoint'
		case '.csv':
			return 'text/csv'
		case '.txt':
			return 'text/plain'
		case '.html':
		case '.htm':
		case '.aspx':
			return 'text/html'
		case '.xml':
			return 'application/xml'

		// Archives
		case '.zip':
			return 'application/zip'
		case '.rar':
			return 'application/vnd.rar'
		case '.7z':
			return 'application/x-7z-compressed'
		case '.tar':
			return 'application/x-tar'
		case '.gz':
			return 'application/gzip'

		// Media
		case '.mp4':
			return 'video/mp4'
		case '.mp3':
			return 'audio/mpeg'
		case '.webm':
			return 'video/webm'
		case '.ogg':
			return 'audio/ogg'
		case '.wav':
			return 'audio/wav'

		default:
			return 'application/octet-stream'
	}
}

/**
 * Sanitizes a filename for cross-platform and web safety.
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
	try {
		const decoded = decodeURIComponent(filename)
		return decoded
			.replaceAll(' ', '_')
			.replaceAll('%20', '_')
			.replace(/[^a-zA-Z0-9_.-]/g, '_')
			.replace(/_+/g, '_')
	} catch {
		return filename.replaceAll(' ', '_').replaceAll('%20', '_').replace(/[^a-zA-Z0-9_.-]/g, '_')
	}
}

/**
 * Determines whether a file path is a generated thumbnail/miniature.
 * @param {string} filePath
 * @returns {boolean}
 */
export function isThumbnail(filePath) {
	const normalized = filePath.replaceAll('\\', '/')
	const parts = normalized.split('/')
	if (parts.some((p) => /^(thumb|thumbs|thumbnails|mini|cache)$/i.test(p))) {
		return true
	}
	const nameWithoutExt = path.basename(filePath, path.extname(filePath))
	if (/@\d+([x-]\d+)?/i.test(nameWithoutExt)) return true
	if (/@\w+/i.test(nameWithoutExt)) return true
	if (/[-_](thumb|thumbnail|mini|preview|small|medium|large|\d+x\d+)$/i.test(nameWithoutExt)) return true
	return false
}

/**
 * Recursively scans directory for asset files.
 * @param {string} dirPath
 * @param {string} baseDir
 * @param {object} [options]
 * @returns {Promise<Array<{fullPath: string, relativePath: string, filename: string, ext: string}>>}
 */
export async function scanDirectory(dirPath, baseDir = dirPath, options = {}) {
	const { excludeExtensions = ['.json'], excludePrefixes = ['.'], skipThumbnails = false } = options
	const fileList = []

	async function walk(current) {
		try {
			const entries = await fs.readdir(current, { withFileTypes: true })
			for (const entry of entries) {
				const fullPath = path.join(current, entry.name)
				if (entry.isDirectory()) {
					if (skipThumbnails && /^(thumb|thumbs|thumbnails|mini|cache)$/i.test(entry.name)) {
						continue
					}
					if (!excludePrefixes.some((p) => entry.name.startsWith(p))) {
						await walk(fullPath)
					}
				} else if (entry.isFile()) {
					const ext = path.extname(entry.name).toLowerCase()
					const isExcludedExt = excludeExtensions.includes(ext)
					const isExcludedPrefix = excludePrefixes.some((p) => entry.name.startsWith(p))
					const isThumb = skipThumbnails && isThumbnail(fullPath)
					if (!isExcludedExt && !isExcludedPrefix && !isThumb) {
						const relativePath = path.relative(baseDir, fullPath).replaceAll('\\', '/')
						fileList.push({
							fullPath,
							relativePath,
							filename: entry.name,
							ext,
						})
					}
				}
			}
		} catch {
			// Ignore unreadable dirs
		}
	}

	await walk(dirPath)
	return fileList
}

/**
 * Ensures recursive folder structure exists in Payload `payload-folders`.
 * @param {any} payload
 * @param {string} folderPath
 * @param {Map<string, string|number>} [foldersByPath]
 * @returns {Promise<string|number|null>}
 */
export async function ensureFolder(payload, folderPath, foldersByPath = new Map()) {
	if (!folderPath || folderPath === '.' || folderPath === '/') return null
	const parts = folderPath.split('/').filter(Boolean)
	let parentId = null
	let currentPath = ''

	for (const name of parts) {
		currentPath = currentPath ? `${currentPath}/${name}` : name
		if (!foldersByPath.has(currentPath)) {
			try {
				const existing = await payload.find({
					collection: 'payload-folders',
					limit: 1,
					where: parentId
						? { and: [{ name: { equals: name } }, { folder: { equals: parentId } }] }
						: { and: [{ name: { equals: name } }, { folder: { exists: false } }] },
					overrideAccess: true,
				})

				const folder = existing.docs[0] || (await payload.create({
					collection: 'payload-folders',
					data: parentId ? { name, folder: parentId } : { name },
					overrideAccess: true,
				}))
				foldersByPath.set(currentPath, folder.id)
			} catch (err) {
				console.warn(`  ⚠️ Could not create folder [${currentPath}]: ${err.message}`)
			}
		}
		parentId = foldersByPath.get(currentPath)
	}
	return parentId
}

/**
 * Resolves full path from nested folder ID.
 * @param {string|number} folderId
 * @param {Map<string|number, any>} folderMap
 * @returns {string|null}
 */
export function resolveFolderPath(folderId, folderMap) {
	if (!folderId) return null
	const folder = folderMap.get(folderId)
	if (!folder) return `unknown(${folderId})`

	const parentId = typeof folder.folder === 'object' && folder.folder !== null
		? folder.folder.id
		: folder.folder

	if (parentId) {
		const parentPath = resolveFolderPath(parentId, folderMap)
		return parentPath ? `${parentPath}/${folder.name}` : folder.name
	}
	return folder.name
}
