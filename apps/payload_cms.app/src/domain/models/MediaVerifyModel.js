import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, result } from '@nan0web/ui/core'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
	getMimeType,
	scanDirectory,
	resolveFolderPath,
} from '../utils/mediaUtils.js'

/**
 * MediaVerifyModel - Subcommand to audit & verify media integrity in Payload CMS
 */
export class MediaVerifyModel extends ModelAsApp {
	static alias = 'media:verify'

	static UI = {
		title: 'Payload CMS Media & Asset Integrity Verifier',
		start: 'Starting media integrity audit...',
		loadingDb: 'Loading media and folder collections from database...',
		scanningDisk: 'Scanning disk assets in {target}...',
		verifying: 'Verifying MIME types and folder hierarchy...',
		done: 'Audit completed! DB Media: {dbCount}, Disk Files: {diskCount}, Corrupted MIME: {corrupted}, Misaligned: {misaligned}.',
	}

	static dir = {
		help: 'Public assets directory on disk',
		default: 'public',
		positional: true,
	}

	static category = {
		help: 'Folder category prefix in Payload CMS',
		default: 'public',
		alias: 'c',
	}

	static collection = {
		help: 'Payload CMS media collection slug',
		default: 'media',
	}

	static foldersCollection = {
		help: 'Payload CMS folders collection slug',
		default: 'payload-folders',
	}

	static output = {
		help: 'Output path for generated markdown audit report',
		alias: 'o',
	}

	static skipThumbnails = {
		help: 'Skip generated thumbnails and cached miniature files',
		default: true,
		type: 'boolean',
	}

	/**
	 * @param {Partial<MediaVerifyModel>} [data = {}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options = {}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.dir
		/** @type {string} */ this.category
		/** @type {string} */ this.collection
		/** @type {string} */ this.foldersCollection
		/** @type {string} */ this.output
		/** @type {boolean} */ this.skipThumbnails
	}

	/**
	 * Executes the audit.
	 * @param {any} payload
	 * @param {Array<{root: string, category?: string}>} searchDirs
	 */
	async runAudit(payload, searchDirs = []) {
		const [mediaResult, foldersResult] = await Promise.all([
			payload.find({ collection: this.collection || 'media', limit: 100000, pagination: false, depth: 0 }),
			payload.find({ collection: this.foldersCollection || 'payload-folders', limit: 100000, pagination: false, depth: 0 }),
		])

		const dbMediaDocs = mediaResult.docs
		const dbFolderDocs = foldersResult.docs

		const folderMap = new Map()
		for (const f of dbFolderDocs) {
			folderMap.set(f.id, f)
		}

		const folderPathById = new Map()
		for (const f of dbFolderDocs) {
			folderPathById.set(f.id, resolveFolderPath(f.id, folderMap))
		}

		const diskFiles = []
		for (const item of searchDirs) {
			const root = typeof item === 'string' ? item : item.root

			try {
				await fs.access(root)
			} catch {
				continue
			}

			const files = await scanDirectory(root, root, {
				skipThumbnails: this.skipThumbnails !== false,
			})
			for (const f of files) {
				const cleanRelative = f.relativePath.startsWith('/') ? f.relativePath.slice(1) : f.relativePath
				const sourcePath = cleanRelative
				const dirName = path.dirname(cleanRelative)
				const expectedFolderPath = dirName === '.' ? '' : dirName
				const expectedMimeType = getMimeType(f.fullPath)
				diskFiles.push({
					...f,
					sourcePath,
					expectedFolderPath,
					expectedMimeType,
				})
			}
		}

		const diskMapBySourcePath = new Map()
		for (const f of diskFiles) {
			diskMapBySourcePath.set(f.sourcePath, f)
		}

		const dbMapBySourcePath = new Map()
		const dbMapByUri = new Map()
		for (const doc of dbMediaDocs) {
			if (doc.sourcePath) {
				const clean = doc.sourcePath.startsWith('/') ? doc.sourcePath.slice(1) : doc.sourcePath
				dbMapBySourcePath.set(clean, doc)
			}
			if (doc.uri) {
				const cleanUri = doc.uri.startsWith('/') ? doc.uri.slice(1) : doc.uri
				dbMapByUri.set(cleanUri, doc)
			}
		}

		// Check 1: Mimetype Integrity
		const mimeAnomalies = []
		const nonImageFilesCorrupted = []
		for (const doc of dbMediaDocs) {
			const filename = doc.filename || doc.sourcePath || ''
			const ext = path.extname(filename).toLowerCase()
			const expectedMime = getMimeType(filename)
			const actualMime = doc.mimeType || doc.mimetype

			const isNonImageDoc = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.pptx', '.ppt', '.zip', '.rar', '.7z', '.html', '.htm', '.csv', '.txt', '.xml'].includes(ext)

			if (isNonImageDoc && actualMime && actualMime.startsWith('image/')) {
				nonImageFilesCorrupted.push({
					id: doc.id,
					filename,
					ext,
					actualMime,
					expectedMime,
					sourcePath: doc.sourcePath,
				})
			} else if (actualMime && expectedMime && actualMime !== expectedMime && expectedMime !== 'application/octet-stream') {
				mimeAnomalies.push({
					id: doc.id,
					filename,
					ext,
					actualMime,
					expectedMime,
					sourcePath: doc.sourcePath,
				})
			}
		}

		// Check 2: Missing Files
		const missingInDb = []
		for (const df of diskFiles) {
			if (!dbMapBySourcePath.has(df.sourcePath) && !dbMapByUri.has(df.sourcePath)) {
				missingInDb.push(df)
			}
		}

		const missingOnDisk = []
		for (const doc of dbMediaDocs) {
			const key = doc.sourcePath || doc.uri
			if (key && !diskMapBySourcePath.has(key)) {
				missingOnDisk.push(doc)
			}
		}

		// Check 3: Folder Alignment
		const folderMisalignments = []
		const unassignedFolders = []

		for (const doc of dbMediaDocs) {
			const cleanSource = doc.sourcePath ? (doc.sourcePath.startsWith('/') ? doc.sourcePath.slice(1) : doc.sourcePath) : ''
			const diskFile = cleanSource ? diskMapBySourcePath.get(cleanSource) : null
			const folderId = typeof doc.folder === 'object' && doc.folder !== null ? doc.folder.id : doc.folder

			if (!folderId) {
				unassignedFolders.push({
					id: doc.id,
					filename: doc.filename || doc.sourcePath,
					sourcePath: doc.sourcePath,
				})
				continue
			}

			const actualFolderPath = folderPathById.get(folderId)
			if (diskFile) {
				if (actualFolderPath !== diskFile.expectedFolderPath) {
					folderMisalignments.push({
						id: doc.id,
						filename: doc.filename || diskFile.filename,
						sourcePath: doc.sourcePath,
						expectedFolderPath: diskFile.expectedFolderPath,
						actualFolderPath,
					})
				}
			}
		}

		// Extension Distribution
		const extCount = {}
		for (const doc of dbMediaDocs) {
			const ext = path.extname(doc.filename || doc.sourcePath || '').toLowerCase() || 'no-ext'
			extCount[ext] = (extCount[ext] || 0) + 1
		}

		return {
			dbMediaCount: dbMediaDocs.length,
			dbFolderCount: dbFolderDocs.length,
			diskFilesCount: diskFiles.length,
			missingInDb,
			missingOnDisk,
			nonImageFilesCorrupted,
			mimeAnomalies,
			folderMisalignments,
			unassignedFolders,
			extCount,
		}
	}

	/**
	 * Generates a Markdown audit report.
	 * @param {object} auditResult
	 * @param {object} [options]
	 * @returns {string}
	 */
	generateMarkdownReport(auditResult, options = {}) {
		const { title = 'Payload CMS Media & Asset Integrity Audit Report' } = options
		const reportDate = new Date().toISOString()

		return `# 🛡️ ${title}

> **Generated:** ${reportDate}  
> **Scope:** Public media & asset directories vs Payload CMS collections (\`${this.collection || 'media'}\`, \`${this.foldersCollection || 'payload-folders'}\`).

---

## 📊 1. Executive Summary

| Metric | Count | Status |
| :--- | :--- | :--- |
| **Total Media in Database** | **${auditResult.dbMediaCount.toLocaleString()}** | ✅ Indexed |
| **Total Media Folders in Database** | **${auditResult.dbFolderCount.toLocaleString()}** | ✅ Hierarchy Ready |
| **Total Asset Files on Disk** | **${auditResult.diskFilesCount.toLocaleString()}** | 📁 Scanned |
| **Missing in DB (Unimported Disk Files)** | **${auditResult.missingInDb.length}** | ${auditResult.missingInDb.length === 0 ? '🟢 100% Coverage' : '⚠️ Attention Required'} |
| **Missing on Disk (Orphan DB Records)** | **${auditResult.missingOnDisk.length}** | ${auditResult.missingOnDisk.length === 0 ? '🟢 Clean' : '⚠️ Orphan Records'} |
| **Corrupted Non-Image Mimetypes** | **${auditResult.nonImageFilesCorrupted.length}** | ${auditResult.nonImageFilesCorrupted.length === 0 ? '🟢 100% Valid' : '❌ Critical'} |
| **Folder Hierarchy Misalignments** | **${auditResult.folderMisalignments.length}** | ${auditResult.folderMisalignments.length === 0 ? '🟢 100% Aligned' : '⚠️ Misaligned'} |
| **Unassigned Folder Records** | **${auditResult.unassignedFolders.length}** | ${auditResult.unassignedFolders.length === 0 ? '🟢 Clean' : '⚠️ Root/Unassigned'} |

---

## 📑 2. File Extension Distribution in Database

| Extension | Count |
| :--- | :--- |
${Object.entries(auditResult.extCount)
	.sort((a, b) => b[1] - a[1])
	.map(([ext, count]) => `| \`${ext}\` | ${count.toLocaleString()} |`)
	.join('\n')}

---

## 🔬 3. Deep Verification Details

### 3.1 Mimetype Integrity Check
- **Detected Corruptions:** ${auditResult.nonImageFilesCorrupted.length}
${
	auditResult.nonImageFilesCorrupted.length === 0
		? '✅ *All non-image documents (.pdf, .xlsx, .zip, .html, .docx, etc.) have valid native mimetypes.*'
		: auditResult.nonImageFilesCorrupted.slice(0, 20).map((c) => `- \`${c.filename}\` (Expected: \`${c.expectedMime}\`, Actual: \`${c.actualMime}\`)`).join('\n')
}

### 3.2 Missing Files Audit
- **Disk files not in DB:** ${auditResult.missingInDb.length}
${
	auditResult.missingInDb.length === 0
		? '✅ *100% of all public assets on disk are registered and indexed in Payload CMS.*'
		: auditResult.missingInDb.slice(0, 20).map((f) => `- \`${f.sourcePath}\``).join('\n')
}

- **DB records not found on Disk:** ${auditResult.missingOnDisk.length}
${
	auditResult.missingOnDisk.length === 0
		? '✅ *No orphan records found.*'
		: auditResult.missingOnDisk.slice(0, 20).map((d) => `- ID: \`${d.id}\`, Path: \`${d.sourcePath || d.uri}\``).join('\n')
}

### 3.3 Folder Hierarchy Alignment Check
- **Misaligned folders:** ${auditResult.folderMisalignments.length}
- **Unassigned media:** ${auditResult.unassignedFolders.length}
${
	auditResult.folderMisalignments.length === 0 && auditResult.unassignedFolders.length === 0
		? '✅ *100% of media records accurately mirror their relative directory path in folders.*'
		: auditResult.folderMisalignments.slice(0, 20).map((m) => `- \`${m.filename}\`: Expected \`${m.expectedFolderPath}\`, Got \`${m.actualFolderPath}\``).join('\n')
}
`
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t, payload } = this._
		const targetDir = path.resolve(process.cwd(), this.dir || 'public')
		const category = this.category || path.basename(targetDir)

		yield progress(t(MediaVerifyModel.UI.start))

		if (!payload) {
			yield show('No Payload instance injected. Skipping database check.', 'warning')
			return result({ status: 'skipped' })
		}

		yield progress(t(MediaVerifyModel.UI.loadingDb))
		yield progress(t(MediaVerifyModel.UI.scanningDisk, { target: targetDir }))
		yield progress(t(MediaVerifyModel.UI.verifying))

		const audit = await this.runAudit(payload, [{ root: targetDir, category }])

		if (this.output) {
			const reportPath = path.resolve(process.cwd(), this.output)
			const reportMd = this.generateMarkdownReport(audit)
			await fs.writeFile(reportPath, reportMd, 'utf8')
		}

		yield show(
			t(MediaVerifyModel.UI.done, {
				dbCount: audit.dbMediaCount,
				diskCount: audit.diskFilesCount,
				corrupted: audit.nonImageFilesCorrupted.length,
				misaligned: audit.folderMisalignments.length,
			}),
			'success'
		)

		return result({ status: 'ok', audit })
	}
}
