import { readdirSync, existsSync, renameSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * @typedef {Object} ContractEntry
 * @property {string} version - Release version (e.g. "v1.0.0")
 * @property {string} path - Absolute path to the contract file
 * @property {string} type - "spec" or "test"
 * @property {string} dir - Directory containing the contract
 */

/**
 * @typedef {Object} VersionStatus
 * @property {string} version - Release version
 * @property {'wip' | 'closed' | 'mixed'} state - Version state
 * @property {string[]} specs - Paths to spec files
 * @property {string[]} tests - Paths to test files
 */

/**
 * Рекурсивний сканер для пошуку release контрактів.
 * Підтримує вкладену структуру: releases/{major}/{minor}/v{version}/
 * та плоску: releases/v{version}/
 */
export default class Scanner {
	/** @type {string} */
	root

	/**
	 * @param {string} root - Root directory of the project
	 */
	constructor(root) {
		this.root = resolve(root)
	}

	/**
	 * Find all .spec.js files (WIP contracts)
	 * @param {string} [version] - Optional version filter
	 * @returns {ContractEntry[]}
	 */
	findSpecs(version) {
		return this.#scan(join(this.root, 'releases'), '.spec.js', version)
	}

	/**
	 * Find all .test.js files (Closed contracts)
	 * @param {string} [version] - Optional version filter
	 * @returns {ContractEntry[]}
	 */
	findTests(version) {
		const oldTests = this.#scan(join(this.root, 'releases'), '.test.js', version)
		const newTests = this.#scan(join(this.root, 'src', 'releases'), '.test.js', version)
		return [...oldTests, ...newTests]
	}

	/**
	 * Get status of all versions
	 * @returns {VersionStatus[]}
	 */
	status() {
		const specs = this.findSpecs()
		const tests = this.findTests()

		/** @type {Map<string, VersionStatus>} */
		const map = new Map()

		for (const entry of [...specs, ...tests]) {
			let status = map.get(entry.version)
			if (!status) {
				status = {
					version: entry.version,
					state: 'wip',
					specs: [],
					tests: [],
				}
				map.set(entry.version, status)
			}
			if (entry.type === 'spec') status.specs.push(entry.path)
			else status.tests.push(entry.path)
		}

		for (const status of map.values()) {
			if (status.specs.length > 0 && status.tests.length > 0) {
				status.state = 'mixed'
			} else if (status.specs.length === 0 && status.tests.length > 0) {
				status.state = 'closed'
			} else {
				status.state = 'wip'
			}
		}

		return [...map.values()].sort((a, b) => a.version.localeCompare(b.version))
	}

	/**
	 * Close a release: rename all .spec.js → .test.js
	 * @param {string} [version] - Version to close. If omitted, closes all WIP.
	 * @returns {{ closed: number, files: string[] }}
	 */
	close(version) {
		const specs = this.findSpecs(version)

		if (version && specs.length === 0) {
			// Check if the version exists at all (might already be closed)
			const tests = this.findTests(version)
			if (tests.length === 0) {
				throw new Error(`Version ${version} not found in releases/`)
			}
			return { closed: 0, files: [] }
		}

		const files = []
		for (const spec of specs) {
			const newPath = spec.path.replace('.spec.js', '.test.js')
			renameSync(spec.path, newPath)
			files.push(newPath)
		}

		return { closed: files.length, files }
	}

	/**
	 * Recursively scan directory for contract files
	 * @param {string} baseDir - Directory to scan
	 * @param {string} suffix - File suffix (.spec.js or .test.js)
	 * @param {string} [version] - Optional version filter
	 * @returns {ContractEntry[]}
	 */
	#scan(baseDir, suffix, version) {
		if (!existsSync(baseDir)) return []

		/** @type {ContractEntry[]} */
		const results = []
		this.#walkDir(baseDir, suffix, version, results)
		return results
	}

	/**
	 * @param {string} dir
	 * @param {string} suffix
	 * @param {string | undefined} version
	 * @param {ContractEntry[]} results
	 */
	#walkDir(dir, suffix, version, results) {
		let entries
		try {
			entries = readdirSync(dir, { withFileTypes: true })
		} catch {
			return
		}

		// Check if this directory is a version directory (starts with 'v' and has dots)
		const dirName = dir.split('/').pop() || ''
		const isVersionDir = /^v\d+\.\d+\.\d+/.test(dirName)

		if (isVersionDir) {
			if (version && dirName !== version) return

			for (const entry of entries) {
				if (entry.isFile() && entry.name.endsWith(suffix)) {
					results.push({
						version: dirName,
						path: join(dir, entry.name),
						type: suffix === '.spec.js' ? 'spec' : 'test',
						dir,
					})
				}
			}
			return
		}

		// Recurse into subdirectories
		for (const entry of entries) {
			if (entry.isDirectory() && !entry.name.startsWith('.')) {
				this.#walkDir(join(dir, entry.name), suffix, version, results)
			}
		}
	}
}
