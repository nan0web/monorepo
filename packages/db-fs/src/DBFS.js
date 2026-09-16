import FS from './FSAdapter.js'
import FSDriver from './FSDriver.js'
import DBFSStream from './DBFS/parts/DBFSStream.js'

/**
 * Main filesystem database class for local document storage and retrieval.
 * Thin facade extending the layered inheritance chain:
 * DBFS (facade) → DBFSStream → DBFSDir → DBFSDoc → DBFSPath → DBFSBase → DB
 *
 * @class
 * @extends {DBFSStream}
 */
class DBFS extends DBFSStream {
	static FS = FS
	static Driver = FSDriver

	/**
	 * Fixes path separators for Windows systems.
	 * @param {string} path The path to fix.
	 * @returns {string} The path with forward slashes.
	 */
	static winFix(path) {
		return '/' === this.FS.sep ? path : path.replaceAll(this.FS.sep, '/')
	}

	/**
	 * Creates a DBFS instance from input parameters.
	 * @param {object} input The input parameters for DBFS.
	 * @returns {DBFS} A new or existing DBFS instance.
	 */
	static from(input) {
		if (input instanceof DBFS) return input
		return new DBFS(input)
	}
}

export default DBFS
