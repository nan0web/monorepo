import { AuditorModel } from '../AuditorModel.js'
import { progress, result, show } from '@nan0web/ui'

/**
 * ReleaseAuditor — Validates release directories (task.md, task.spec.js, user.md).
 */
export class ReleaseAuditor extends AuditorModel {
	static alias = 'release'

	static recursive = {
		type: 'boolean',
		alias: 'r',
		help: 'Recursively scan subdirectories for releases',
		default: false,
	}

	static out = {
		type: 'string',
		alias: 'o',
		help: 'Path to save markdown report',
		default: '',
	}

	static report = {
		type: 'string',
		help: 'Path to save markdown report (alias for --out)',
		default: '',
	}

	/**
	 * @param {Partial<ReleaseAuditor>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Recursively scan subdirectories */ this.recursive = Boolean(data.recursive)
		/** @type {string} Path to save markdown report */ this.out = data.out || ''
		/** @type {string} Path to save markdown report */ this.report = data.report || ''
	}

	static UI = {
		title: 'Release Auditor',
		description: 'Validates release directories and required artifacts (task.spec.js, user.md).',
		starting: 'Starting Release Audit in {dir}...',
		ok: 'release:validate ok',
		missing_file: 'Missing required release file: {file} for {task}',
	}

	/**
	 * Runs the release audit.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const t = this._.t
		const db = this._.db
		const baseDir = this.dir || '.'

		yield progress(
			t(ReleaseAuditor.UI.starting, { dir: baseDir }) || `Starting Release Audit in ${baseDir}...`
		)

		const errors = []
		const checked = []
		const releasesDir = db.resolveSync(baseDir, 'releases')

		const IGNORE_DIRS = new Set(['node_modules', '.git', '.venv', '.agent', 'dist', 'types'])
		const scanRoot = this.recursive ? baseDir : releasesDir
		const taskFiles = []
		if (db.data instanceof Map && db.data.size > 0) {
			for (const key of db.data.keys()) {
				const uri = String(key)
				const segments = uri.split('/')
				if (segments.some((s) => IGNORE_DIRS.has(s))) continue
				if (uri.includes('releases/') && uri.endsWith('/task.md')) {
					taskFiles.push(uri)
				}
			}
		} else {
			const collectTaskFiles = async (dir) => {
				try {
					for await (const entry of db.readDir(dir, { depth: 0, includeDirs: true })) {
						const name = entry?.name || ''
						if (IGNORE_DIRS.has(name)) continue
						const entryPath = entry?.path || db.resolveSync(dir, name)
						if (entry?.isDirectory || entry?.stat?.isDirectory) {
							await collectTaskFiles(entryPath)
						} else if (
							entryPath.includes('releases/') &&
							(entryPath.endsWith('/task.md') || name === 'task.md')
						) {
							taskFiles.push(entryPath)
						}
					}
				} catch {
					// directory may not exist
				}
			}
			await collectTaskFiles(scanRoot)
		}

		const pkgVersions = new Map()
		const parseSemver = (v) => {
			const m = String(v || '').match(/(\d+)\.(\d+)\.(\d+)/)
			return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
		}
		const isLteSemver = (a, b) => {
			const pa = parseSemver(a)
			const pb = parseSemver(b)
			if (!pa || !pb) return false
			for (let idx = 0; idx < 3; idx++) {
				if (pa[idx] < pb[idx]) return true
				if (pa[idx] > pb[idx]) return false
			}
			return true
		}
		const getPkgVersion = async (pkgDir) => {
			if (pkgVersions.has(pkgDir)) return pkgVersions.get(pkgDir)
			let ver = null
			try {
				const pkg = await db.loadDocument(`${pkgDir}/package.json`)
				if (pkg && typeof pkg === 'object' && pkg.version) {
					ver = String(pkg.version)
				}
			} catch {
				// no package.json
			}
			pkgVersions.set(pkgDir, ver)
			return ver
		}

		for (let i = 0; i < taskFiles.length; i++) {
			const taskUri = taskFiles[i]
			yield progress(`Checking (${i + 1}/${taskFiles.length}): ${taskUri}`, i + 1, taskFiles.length)
			let content = ''
			try {
				const doc = await db.loadDocument(taskUri)
				content = typeof doc === 'string' ? doc : JSON.stringify(doc || '')
			} catch {
				continue
			}

			const dirUri = taskUri.slice(0, taskUri.lastIndexOf('/'))
			const pkgDir = dirUri.includes('/releases/') ? dirUri.split('/releases/')[0] : baseDir
			const pkgVersion = await getPkgVersion(pkgDir)
			const releaseVerMatch = dirUri.match(/v(\d+\.\d+\.\d+)$/)
			const releaseVer = releaseVerMatch ? releaseVerMatch[1] : null

			const checkExists = async (reqFile) => {
				const reqUri = `${dirUri}/${reqFile}`
				try {
					const stat = await db.statDocument(reqUri)
					return Boolean(stat && (stat.exists || stat.isFile))
				} catch {
					return false
				}
			}

			const hasSpec = await checkExists('task.spec.js')
			const hasUser = await checkExists('user.md')
			const hasRetro = await checkExists('retro.md')
			const hasTest = await checkExists('task.test.js')

			const statusMatch = content.match(/status:\s*([a-zA-Z0-9_-]+)/i)
			let status = statusMatch ? statusMatch[1].toLowerCase() : ''
			if (!status) {
				const hasDoneCheckboxes = /- \[x\]/i.test(content)
				const hasOpenCheckboxes = /- \[ \]/.test(content)
				const isReleasedByPkg = Boolean(
					releaseVer && pkgVersion && isLteSemver(releaseVer, pkgVersion)
				)
				if (hasRetro || hasTest || isReleasedByPkg || (hasDoneCheckboxes && !hasOpenCheckboxes)) {
					status = 'done'
				} else if (hasSpec) {
					status = 'in_progress'
				} else {
					status = 'planned'
				}
			}
			const isInProgress = status === 'in_progress'

			if (isInProgress) {
				if (!hasSpec) {
					errors.push({
						check: 'release',
						file: `${dirUri}/task.spec.js`,
						error: `Missing required release file: ${dirUri}/task.spec.js (for ${taskUri})`,
					})
				}
				if (!hasUser) {
					errors.push({
						check: 'release',
						file: `${dirUri}/user.md`,
						error: `Missing required release file: ${dirUri}/user.md (for ${taskUri})`,
					})
				}
			}

			checked.push({
				release: dirUri,
				status,
				hasSpec,
				hasUser,
				ok: !isInProgress || (hasSpec && hasUser),
			})
		}

		const outPath = this.out || this.report
		if (outPath) {
			const lines = [
				'# Release Validation Report',
				'',
				`- **Directory:** \`${baseDir}\``,
				`- **Recursive:** ${this.recursive}`,
				`- **Checked tasks:** ${taskFiles.length}`,
				`- **Errors:** ${errors.length}`,
				'',
			]
			if (checked.length > 0) {
				const byPkg = new Map()
				for (const item of checked) {
					const pkg = item.release.includes('/releases/')
						? item.release.split('/releases/')[0]
						: '.'
					if (!byPkg.has(pkg)) {
						byPkg.set(pkg, { total: 0, inProgress: 0, done: 0, errors: 0 })
					}
					const stats = byPkg.get(pkg)
					stats.total += 1
					if (item.status === 'in_progress') stats.inProgress += 1
					if (item.status === 'done') stats.done += 1
					if (!item.ok) stats.errors += 1
				}

				lines.push(
					'## Summary by Package',
					'',
					'| Package | Releases | In Progress | Done | Errors | Status |',
					'| :--- | :---: | :---: | :---: | :---: | :---: |'
				)
				for (const [pkg, s] of byPkg.entries()) {
					lines.push(
						`| \`${pkg}\` | ${s.total} | ${s.inProgress} | ${s.done} | ${s.errors} | ${s.errors === 0 ? '✅ OK' : '❌ FAIL'} |`
					)
				}
				lines.push('')
			}
			if (errors.length > 0) {
				lines.push('## Errors', '', '| File | Error |', '| :--- | :--- |')
				for (const err of errors) {
					lines.push(`| \`${err.file}\` | ${err.error} |`)
				}
			} else {
				lines.push('`release:validate ok`')
			}
			await db.saveDocument(outPath, lines.join('\n'))
		}

		if (outPath) {
			yield show(
				`Report saved to ${outPath} (checked: ${taskFiles.length}, errors: ${errors.length})`
			)
			return { ok: errors.length === 0, errors }
		}

		if (errors.length === 0) {
			yield show(ReleaseAuditor.UI.ok)
			yield result({ ok: true, errors: [], message: ReleaseAuditor.UI.ok })
		} else {
			for (const err of errors) {
				yield show(err.error)
			}
			yield result({ ok: false, errors })
		}
	}
}
