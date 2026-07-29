import { OlmuiThemingAuditor } from './OlmuiThemingAuditor.js'
import { result, show, progress } from '../../core/Intent.js'

export class JsOlmuiThemingAuditor extends OlmuiThemingAuditor {
	/**
	 * @returns {AsyncGenerator<import('../../core/Intent.js').Intent, import('../../core/Intent.js').ResultIntent, any>}
	 */
	async *run() {
		const { t } = /** @type {any} */ (this)._
		yield show(t(OlmuiThemingAuditor.UI.starting, { dir: this.dir }))

		const fsDb = /** @type {any} */ (this)._.db
		if (!fsDb) {
			yield show(t(OlmuiThemingAuditor.UI.errorDb), 'error')
			return result({ ok: false, code: 500, reason: 'no_db' })
		}

		const files = []
		const targetDir = fsDb.resolveSync(this.dir)

		try {
			for await (const entry of fsDb.browse(targetDir, {
				depth: Infinity,
				ignore: ['node_modules', 'dist', 'build', 'play', 'test', '.*'],
			})) {
				if (entry.isFile && /\.(js|jsx|ts|tsx|css)$/.test(entry.name)) {
					files.push(entry.path)
				}
			}
		} catch (e) {
			// Directory might be missing
		}

		if (files.length === 0) {
			yield show(t(OlmuiThemingAuditor.UI.noFiles, { dir: this.dir }), 'error')
			return result({ ok: false, code: 404, reason: 'no_files' })
		}

		const errors = []
		const rawColorRegex = /(?<!var\([^)]*)(#(?:[0-9a-fA-F]{3,4}){1,2}\b|\brgba?\(|\bhsla?\()/g
		const rawSizeRegex = /(?<!var\([^)]*)\b([2-9]px|[1-9]\d+px|[0-9.]+(?:rem|em))\b/g

		for (const file of files) {
			const content = await fsDb.fetch(file)
			const contentString = typeof content === 'string' ? content : JSON.stringify(content)
			const fileErrors = []

			rawColorRegex.lastIndex = 0
			let colorMatch
			while ((colorMatch = rawColorRegex.exec(contentString)) !== null) {
				fileErrors.push(t(OlmuiThemingAuditor.UI.errorColor, { match: colorMatch[1] }))
			}

			rawSizeRegex.lastIndex = 0
			let sizeMatch
			while ((sizeMatch = rawSizeRegex.exec(contentString)) !== null) {
				fileErrors.push(t(OlmuiThemingAuditor.UI.errorSize, { match: sizeMatch[1] }))
			}

			const displayFile = file.startsWith('@app/') ? file.slice(5) : file

			if (fileErrors.length > 0) {
				yield show(
					t(OlmuiThemingAuditor.UI.auditFailed, { file: displayFile, errors: fileErrors.join('; ') }),
					'error',
				)
				errors.push(...fileErrors.map((e) => ({ file: displayFile, error: e })))
			} else {
				yield progress(t(OlmuiThemingAuditor.UI.auditPassed, { file: displayFile }))
			}
		}

		if (errors.length > 0) {
			yield show(t(OlmuiThemingAuditor.UI.doneErrors, {}), 'error')
			return result({ ok: false, code: 400, reason: 'unthemed_tokens', errors })
		}

		yield show(t(OlmuiThemingAuditor.UI.doneSuccess, {}), 'success')
		return result({ ok: true, code: 200 })
	}
}

export default JsOlmuiThemingAuditor
