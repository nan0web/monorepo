import DBFS from '@nan0web/db-fs'

/**
 * ReleaseDB – thin wrapper around DBFS that adds a convenient `releases`
 * getter returning all release directories discovered under the root.
 *
 * The underlying DBFS stores a `Map` called `data` where each key is a
 * relative file path (e.g. "1/0/v1.0.0/release.js").
 */
class ReleaseDB extends DBFS {
	/**
	 * @param {string} uri
	 * @returns {ReleaseDB}
	 */
	extract(uri) {
		return new ReleaseDB(super.extract(uri))
	}
	/**
	 * @param {string} version
	 * @returns {ReleaseDB}
	 */
	extractVersion(version) {
		const found = version.match(/^v(\d+)\.(\d+)\.(\d+)$/)
		if (!found) {
			throw new Error('Incorrect version')
		}
		const arr = version.slice(1).split('.')
		const path = [arr[0], arr[1], version, ''].join('/')
		return ReleaseDB.from(this.extract(path))
	}
	/**
	 * @returns {Array<string>} List of discovered release root paths
	 */
	get releases() {
		const paths = new Set()
		for (const key of this.data.keys()) {
			// Expected structure: major/minor/vX.Y.Z/…
			const parts = key.split('/')
			if (parts.length > 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
				paths.add(`${parts[0]}/${parts[1]}/${parts[2]}`)
			}
		}
		return Array.from(paths)
	}
	/**
	 * @param {object} input
	 * @returns {ReleaseDB}
	 */
	static from(input) {
		if (input instanceof ReleaseDB) return input
		return new ReleaseDB(input)
	}
}
export default ReleaseDB
