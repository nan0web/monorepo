import { ExportAuditor } from '../ExportAuditor.js'
import { progress, show } from '@nan0web/ui'

export class JsExportAuditor extends ExportAuditor {
	/**
	 * @param {import('../ExportAuditor.js').ExportError[]} errors
	 * @param {import('@nan0web/i18n').TFunction} t
	 * @param {Function} fileExists
	 * @param {Function} dirExists
	 * @param {Function} readText
	 */
	async *checkPlatformExports(errors, t, fileExists, dirExists, readText) {
		if (!this._.db) throw new Error('DB not found in context')
		// 1. Main gateway check
		yield progress(t(ExportAuditor.UI.checking_gateway, {}))
		const hasSrc = await dirExists('src')
		if (hasSrc) {
			if (!(await fileExists('src/index.js'))) {
				errors.push({ check: 'src/index.js', error: ExportAuditor.UI.missing_index })
				yield show(t(ExportAuditor.UI.missing_index, {}) || 'Missing index.js', 'error')
			} else {
				yield show(t(ExportAuditor.UI.gateway_ok, {}) || 'Gateway index: OK', 'success')
			}
		}

		// 2. Domain facade check
		yield progress(t(ExportAuditor.UI.checking_domain, {}))
		const hasDomain = await dirExists('src/domain')
		if (hasDomain) {
			if (!(await fileExists('src/domain/index.js'))) {
				errors.push({ check: 'src/domain/index.js', error: ExportAuditor.UI.missing_domain_index })
				yield show(t(ExportAuditor.UI.missing_domain_index, {}) || 'Missing domain/index.js', 'error')
			} else {
				yield show(t(ExportAuditor.UI.domain_ok, {}) || 'Domain index: OK', 'success')
			}
		} else {
			yield show(t(ExportAuditor.UI.domain_ok, {}), 'success')
		}

		// 3. UI adapter exports check
		yield progress(t(ExportAuditor.UI.checking_ui_exports, {}))
		/** @type {Record<string, string>} */
		let pkgExports = {}
		try {
			const pkg = await this._.db.loadDocument(this._.db.resolveSync(this.dir, 'package.json'))
			pkgExports = pkg.exports || {}
		} catch {
			/* ignored */
		}

		const hasUiDir = await dirExists('src/ui')
		if (hasUiDir) {
			const uiDirPath = this._.db.resolveSync(this.dir, 'src/ui')
			const uiEntries = []
			try {
				for await (const entry of this._.db.readDir(uiDirPath, { depth: 0, includeDirs: true })) {
					if (entry.isDirectory) uiEntries.push(entry.name)
				}
			} catch {}

			for (const adapter of uiEntries) {
				const adapterDir = `src/ui/${adapter}`
				if (!(await dirExists(adapterDir))) continue
				const exportKey = `./ui/${adapter}`
				if (!pkgExports[exportKey]) {
					const error = t(ExportAuditor.UI.missing_ui_export, { dir: adapterDir }) || `Missing UI export for: ${adapterDir}`
					errors.push({
						check: `exports["${exportKey}"]`,
						error,
					})
					yield show(error, 'warn')
				}
			}
		}

		if (!errors.some((e) => e.check.startsWith('exports'))) {
			yield show(t(ExportAuditor.UI.ui_ok, {}), 'success')
		}

		// 4. Default Exports Check
		const defaultExports = []
		if (hasSrc) {
			const srcPath = this._.db.resolveSync(this.dir, 'src')
			const filter = (/** @type {import('@nan0web/db').DocumentEntry} */ entry) => {
				if (entry.name.startsWith('.')) return false
				if (entry.name === 'node_modules' || entry.name === 'dist') return false
				return true
			}
			for await (const entry of this._.db.browse(srcPath, (/** @type {any} */ ({ depth: Infinity, filter })))) {
				if (entry.isFile && entry.name.endsWith('.js')) {
					const text = await readText(entry.path)
					if (text && /^\s*export\s+default\s+/m.test(text)) {
						errors.push({ check: entry.name, error: 'export default prohibited' })
						defaultExports.push(entry.name)
					}
				}
			}
		}

		const missing = errors.filter(e => e.error !== 'export default prohibited').map(e => e.check)

		return {
			exports: { missing, defaultExports }
		}
	}
}
