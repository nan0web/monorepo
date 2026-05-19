export class StackDetector {
	/**
	 * Detects the platform of the project at the given directory.
	 * @param {import('@nan0web/db').default} db
	 * @param {string} dir
	 * @returns {Promise<'js' | 'python' | 'unknown'>}
	 */
	static async detectPlatform(db, dir) {
		const pkgPath = db.resolveSync(dir, 'package.json')
		const pkgStat = await db.statDocument(pkgPath).catch(() => null)
		if (pkgStat && !pkgStat.error && pkgStat.isFile) return 'js'

		const pyprojectPath = db.resolveSync(dir, 'pyproject.toml')
		const pyproject = await db.statDocument(pyprojectPath).catch(() => null)
		if (pyproject && pyproject.isFile) return 'python'

		return 'unknown'
	}
}
