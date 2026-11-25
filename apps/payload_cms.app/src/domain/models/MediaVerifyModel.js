import { PayloadApp } from '@nan0web/ui-payload/domain'
import { show, progress, result } from '@nan0web/ui/core'
import { createT } from '@nan0web/i18n'
import {
	getMimeType,
	scanDirectory,
	resolveFolderPath,
} from '../utils/mediaUtils.js'

const getExt = (p = '') => {
	const base = p.split('/').pop() || ''
	const idx = base.lastIndexOf('.')
	return idx > 0 ? base.slice(idx).toLowerCase() : ''
}

const getDir = (p = '') => {
	const idx = p.lastIndexOf('/')
	return idx > 0 ? p.slice(0, idx) : '.'
}

const getBase = (p = '') => p.split('/').filter(Boolean).pop() || ''

/**
 * Resolves translator function for report generation.
 * @param {object} options
 * @param {Function} [fallbackT]
 * @returns {Function}
 */
function resolveReportT(options = {}, fallbackT) {
	if (typeof options.t === 'function') return options.t
	if (typeof fallbackT === 'function') return fallbackT
	return createT({}, options.locale || 'en')
}

/**
 * MediaVerifyModel - Subcommand to audit & verify media integrity in Payload CMS
 */
export class MediaVerifyModel extends PayloadApp {
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
		/** @type {string} Public assets directory on disk */ this.dir
		/** @type {string} Folder category prefix in Payload CMS */ this.category
		/** @type {string} Payload CMS media collection slug */ this.collection
		/** @type {string} Payload CMS folders collection slug */ this.foldersCollection
		/** @type {string} Output path for generated markdown audit report */ this.output
		/** @type {boolean} Skip generated thumbnails and cached miniature files */ this.skipThumbnails
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
			const files = await scanDirectory(root, root, {
				skipThumbnails: this.skipThumbnails !== false,
			})
			for (const f of files) {
				const cleanRelative = f.relativePath.startsWith('/') ? f.relativePath.slice(1) : f.relativePath
				const sourcePath = cleanRelative
				const dirName = getDir(cleanRelative)
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
			const ext = getExt(filename)
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
			const ext = getExt(doc.filename || doc.sourcePath || '') || 'no-ext'
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
	 * @param {string} [options.title]
	 * @param {string} [options.locale]
	 * @param {Function} [options.t]
	 * @returns {string}
	 */
	generateMarkdownReport(auditResult, options = {}) {
		const t = resolveReportT(options, this._?.t)
		const title = options.title || t('Payload CMS Media & Asset Integrity Audit Report')
		const reportDate = new Date().toISOString()
		const col = this.collection || 'media'
		const fCol = this.foldersCollection || 'payload-folders'

		return [
			`# 🛡️ ${title}\n`,
			`> **${t('Generated')}:** ${reportDate}  `,
			`> **${t('Scope')}:** ${t('Public media & asset directories vs Payload CMS collections')} (\`${col}\`, \`${fCol}\`).\n`,
			'---\n',
			this.formatSummarySection(auditResult, t),
			'---\n',
			this.formatExtensionsSection(auditResult, t),
			'---\n',
			this.formatDetailsSection(auditResult, t),
		].join('\n')
	}

	/**
	 * Formats executive summary table section.
	 * @param {object} audit
	 * @param {Function} t
	 * @returns {string}
	 */
	formatSummarySection(audit, t) {
		const rows = [
			[t('Total Media in Database'), `**${audit.dbMediaCount.toLocaleString()}**`, `✅ ${t('Indexed')}`],
			[t('Total Media Folders in Database'), `**${audit.dbFolderCount.toLocaleString()}**`, `✅ ${t('Hierarchy Ready')}`],
			[t('Total Asset Files on Disk'), `**${audit.diskFilesCount.toLocaleString()}**`, `📁 ${t('Scanned')}`],
			[t('Missing in DB (Unimported Disk Files)'), `**${audit.missingInDb.length}**`, audit.missingInDb.length === 0 ? `🟢 ${t('100% Coverage')}` : `⚠️ ${t('Attention Required')}`],
			[t('Missing on Disk (Orphan DB Records)'), `**${audit.missingOnDisk.length}**`, audit.missingOnDisk.length === 0 ? `🟢 ${t('Clean')}` : `⚠️ ${t('Orphan Records')}`],
			[t('Corrupted Non-Image Mimetypes'), `**${audit.nonImageFilesCorrupted.length}**`, audit.nonImageFilesCorrupted.length === 0 ? `🟢 ${t('100% Valid')}` : `❌ ${t('Critical')}`],
			[t('Folder Hierarchy Misalignments'), `**${audit.folderMisalignments.length}**`, audit.folderMisalignments.length === 0 ? `🟢 ${t('100% Aligned')}` : `⚠️ ${t('Misaligned')}`],
			[t('Unassigned Folder Records'), `**${audit.unassignedFolders.length}**`, audit.unassignedFolders.length === 0 ? `🟢 ${t('Clean')}` : `⚠️ ${t('Root/Unassigned')}`],
		]
		const body = rows.map(([m, c, s]) => `| **${m}** | ${c} | ${s} |`).join('\n')
		return `## 📊 ${t('1. Executive Summary')}\n\n| ${t('Metric')} | ${t('Count')} | ${t('Status')} |\n| :--- | :--- | :--- |\n${body}\n`
	}

	/**
	 * Formats file extension distribution table.
	 * @param {object} audit
	 * @param {Function} t
	 * @returns {string}
	 */
	formatExtensionsSection(audit, t) {
		const rows = Object.entries(audit.extCount)
			.sort((a, b) => b[1] - a[1])
			.map(([ext, count]) => `| \`${ext}\` | ${count.toLocaleString()} |`)
			.join('\n')
		return `## 📑 ${t('2. File Extension Distribution in Database')}\n\n| ${t('Extension')} | ${t('Count')} |\n| :--- | :--- |\n${rows}\n`
	}

	/**
	 * Formats deep verification details section.
	 * @param {object} audit
	 * @param {Function} t
	 * @returns {string}
	 */
	formatDetailsSection(audit, t) {
		const mimeList = audit.nonImageFilesCorrupted.length === 0
			? `✅ *${t('All non-image documents (.pdf, .xlsx, .zip, .html, .docx, etc.) have valid native mimetypes.')}*`
			: audit.nonImageFilesCorrupted.slice(0, 20).map((c) => `- \`${c.filename}\` (${t('Expected')}: \`${c.expectedMime}\`, ${t('Actual')}: \`${c.actualMime}\`)`).join('\n')
		const missingDbList = audit.missingInDb.length === 0
			? `✅ *${t('100% of all public assets on disk are registered and indexed in Payload CMS.')}*`
			: audit.missingInDb.slice(0, 20).map((f) => `- \`${f.sourcePath}\``).join('\n')
		const missingDiskList = audit.missingOnDisk.length === 0
			? `✅ *${t('No orphan records found.')}*`
			: audit.missingOnDisk.slice(0, 20).map((d) => `- ID: \`${d.id}\`, ${t('Path')}: \`${d.sourcePath || d.uri}\``).join('\n')
		const alignList = audit.folderMisalignments.length === 0 && audit.unassignedFolders.length === 0
			? `✅ *${t('100% of media records accurately mirror their relative directory path in folders.')}*`
			: audit.folderMisalignments.slice(0, 20).map((m) => `- \`${m.filename}\`: ${t('Expected')} \`${m.expectedFolderPath}\`, ${t('Got')} \`${m.actualFolderPath}\``).join('\n')

		return [
			`## 🔬 ${t('3. Deep Verification Details')}\n`,
			`### ${t('3.1 Mimetype Integrity Check')}`,
			`- **${t('Detected Corruptions')}:** ${audit.nonImageFilesCorrupted.length}`,
			`${mimeList}\n`,
			`### ${t('3.2 Missing Files Audit')}`,
			`- **${t('Disk files not in DB')}:** ${audit.missingInDb.length}`,
			`${missingDbList}\n`,
			`- **${t('DB records not found on Disk')}:** ${audit.missingOnDisk.length}`,
			`${missingDiskList}\n`,
			`### ${t('3.3 Folder Hierarchy Alignment Check')}`,
			`- **${t('Misaligned folders')}:** ${audit.folderMisalignments.length}`,
			`- **${t('Unassigned media')}:** ${audit.unassignedFolders.length}`,
			alignList,
		].join('\n')
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		const targetDir = this.dir || 'public'
		const category = this.category || getBase(targetDir)

		yield progress(t(MediaVerifyModel.UI.start))

		const payload = this.$payload

		yield progress(t(MediaVerifyModel.UI.loadingDb))
		yield progress(t(MediaVerifyModel.UI.scanningDisk, { target: targetDir }))
		yield progress(t(MediaVerifyModel.UI.verifying))

		const audit = await this.runAudit(payload, [{ root: targetDir, category }])

		if (this.output) {
			const reportMd = this.generateMarkdownReport(audit)
			await this.$db.set(this.output, reportMd)
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
