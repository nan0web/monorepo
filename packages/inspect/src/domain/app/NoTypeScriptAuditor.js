import { AuditorModel } from '../AuditorModel.js'
import { progress, result } from '@nan0web/ui'

export class NoTypeScriptAuditor extends AuditorModel {
	static UI = {
		checking: 'Checking for TypeScript files in package',
		foundTs: 'Found TypeScript file: {file}',
		clean: 'No TypeScript files found in restricted directories (Point 1 compliance)',
	}

	/**
	 * @param {string} dir
	 * @param {boolean} isJs
	 * @param {string[]} tsFiles
	 */
	async _checkDir(dir, isJs, tsFiles) {
		if (!this._.db) throw new Error('DB not found in context')
		const stat = await this._.db.statDocument(dir)
		if (!stat.isDirectory) return

		try {
			for await (const entry of this._.db.readDir(dir)) {
				if (entry.isDirectory) {
					if (isJs && entry.name === 'node_modules') continue
					if (!isJs && (entry.name === 'venv' || entry.name === '__pycache__')) continue
					if (entry.name === 'types') continue

					await this._checkDir(entry.path, isJs, tsFiles)
				} else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
					tsFiles.push(entry.path)
				}
			}
		} catch { }
	}

	async *run() {
		if (!this._.db) throw new Error('DB not found in context')
		const { db, t } = this._
		if (!db) throw new Error('DB not found in context')
		
		yield progress(t(NoTypeScriptAuditor.UI.checking))

		/** @type {string[]} */ const tsFiles = []
		const restrictedDirs = ['src', 'bin', 'play', 'snapshots', 'test']

		const pkgPath = db.resolveSync(this.dir, 'package.json')
		const pkg = await db.fetch(pkgPath, {}).catch(() => null)
		const isJs = !!pkg

		for (const restrictedDir of restrictedDirs) {
			await this._checkDir(db.resolveSync(this.dir, restrictedDir), isJs, tsFiles)
		}

		if (tsFiles.length > 0) {
			for (const file of tsFiles) {
				yield progress(t(NoTypeScriptAuditor.UI.foundTs, { file }))
			}
			return result({ tsFiles, success: false })
		}

		yield progress(t(NoTypeScriptAuditor.UI.clean))
		return result({ success: true })
	}
}
