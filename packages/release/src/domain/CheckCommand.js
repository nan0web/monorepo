import { ModelAsApp, result, show } from '@nan0web/ui'
import { runSpawn } from '@nan0web/test'
import { join } from 'node:path'
import { mkdirSync, rmSync, existsSync, readFileSync } from 'node:fs'

export default class CheckCommand extends ModelAsApp {
	static UI = {
		title: 'Integrity Auditor',
		icon: '🔍',
		description: 'Compares local source files with the version published on NPM.',
	}

	static name = 'check'

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { t, db = /** @type {*} */ (this._.db) } = this._
		const pkgPath = '@app/package.json'
		const pkg = await db.loadDocument(pkgPath, {})

		if (!pkg || !pkg.name) {
			yield show(t('Could not identify package name in {path}', { path: pkgPath }), 'error')
			return result({ success: false })
		}

		const name = pkg.name
		const version = pkg.version
		yield show(t('Auditing {name}@{version} vs NPM...', { name, version }), 'info')

		const appAbsDir = db.location('@app')
		yield show(t('Local path: {path}', { path: appAbsDir }))

		// 1. Create temporary directory
		const tmpDir = join(process.cwd(), '.nan0web_check_tmp')
		if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true })
		mkdirSync(tmpDir, { recursive: true })

		try {
			// 2. Download from NPM
			yield show(t('Downloading {name} from NPM registry...', { name }))
			const packRes = await runSpawn('npm', ['pack', name], { cwd: tmpDir })
			if (packRes.code !== 0) throw new Error(packRes.error || 'Failed to run npm pack')

			const tgzFile = packRes.text.trim().split('\n').pop()
			if (!tgzFile) throw new Error('Failed to find tarball name from npm pack output')
			const tgzPath = join(tmpDir, tgzFile)

			// 3. Unpack
			yield show(t('Unpacking {file}...', { file: tgzFile }))
			const tarRes = await runSpawn('tar', ['-xzf', tgzFile], { cwd: tmpDir })
			if (tarRes.code !== 0) throw new Error(tarRes.error || 'Failed to unpack tarball')

			const npmSourceDir = join(tmpDir, 'package')

			// 4. Scan Local Files
			yield show(t('Scanning local files...'))
			const localFiles = await this._scanLocal(appAbsDir)

			// 5. Compare
			const diff = {
				/** @type {string[]} */
				modified: [],
				/** @type {string[]} */
				added: [],
				/** @type {string[]} */
				deleted: [],
				matched: 0,
			}

			for (const relPath of localFiles) {
				const localAbs = join(appAbsDir, relPath)
				const npmAbs = join(npmSourceDir, relPath)

				if (!existsSync(npmAbs)) {
					diff.added.push(relPath)
					continue
				}

				const localContent = readFileSync(localAbs, 'utf8')
				const npmContent = readFileSync(npmAbs, 'utf8')

				if (localContent !== npmContent) {
					diff.modified.push(relPath)
				} else {
					diff.matched++
				}
			}

			// Check for deleted files
			const npmFiles = await this._scanDirRecursive(npmSourceDir)
			for (const relPath of npmFiles) {
				if (!localFiles.includes(relPath)) {
					diff.deleted.push(relPath)
				}
			}

			// 6. Report
			if (diff.added.length) {
				yield show(t('New files (locally only):'), 'info')
				for (const f of diff.added) yield show(`  + ${f}`, 'success')
			}

			if (diff.modified.length) {
				yield show(t('Modified files (different from NPM):'), 'info')
				for (const f of diff.modified) yield show(`  * ${f}`, 'warn')
			}

			if (diff.deleted.length) {
				yield show(t('Deleted files (missing locally):'), 'info')
				for (const f of diff.deleted) yield show(`  - ${f}`, 'error')
			}

			if (!diff.added.length && !diff.modified.length && !diff.deleted.length) {
				yield show(t('✅ Integrity check passed! All {count} files match NPM.', { count: diff.matched }), 'success')
			} else {
				yield show(t('Summary: {matched} matched, {mod} modified, {add} added, {del} deleted.', {
					matched: diff.matched,
					mod: diff.modified.length,
					add: diff.added.length,
					del: diff.deleted.length
				}), 'info')
			}

		} catch (/** @type {any} */ err) {
			yield show(err.message, 'error')
			return result({ success: false, error: err.message })
		} finally {
			if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true })
		}

		return result({ success: true })
	}

	/**
	 * @param {string} absDir
	 * @returns {Promise<string[]>}
	 */
	async _scanLocal(absDir) {
		const { readdirSync, statSync } = await import('node:fs')
		const { join, relative } = await import('node:path')

		const files = []
		const ignore = ['.git', 'node_modules', 'releases', 'dist', 'play', '.nan0web_check_tmp']

		const scan = (dir) => {
			const list = readdirSync(dir)
			for (const name of list) {
				if (ignore.includes(name)) continue
				if (name.startsWith('.')) continue

				const abs = join(dir, name)
				const stat = statSync(abs)
				if (stat.isDirectory()) {
					scan(abs)
				} else {
					files.push(relative(absDir, abs))
				}
			}
		}

		scan(absDir)
		return files
	}


	/**
	 * @param {string} base
	 * @param {string} [dir]
	 * @returns {Promise<string[]>}
	 */
	async _scanDirRecursive(base, dir = '') {
		const { readdirSync, statSync } = await import('node:fs')
		const { join } = await import('node:path')

		let results = []
		const absDir = join(base, dir)
		const list = readdirSync(absDir)

		for (const file of list) {
			const rel = join(dir, file)
			const abs = join(base, rel)
			const stat = statSync(abs)
			if (stat.isDirectory()) {
				results = results.concat(await this._scanDirRecursive(base, rel))
			} else {
				results.push(rel)
			}
		}
		return results
	}
}
