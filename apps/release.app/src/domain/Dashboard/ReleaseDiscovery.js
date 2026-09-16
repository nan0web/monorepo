import { extractTasks } from './ReleaseParser.js'

/**
 * Parse semver string into [major, minor, patch] numbers
 * @param {string} [v='']
 * @returns {[number, number, number]}
 */
export function parseSemver(v = '') {
	const match = String(v).match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
	if (!match) return [0, 0, 0]
	return [
		parseInt(match[1] || '0', 10),
		parseInt(match[2] || '0', 10),
		parseInt(match[3] || '0', 10),
	]
}

/**
 * Compare two semver strings in descending order
 * @param {string} [a='']
 * @param {string} [b='']
 * @returns {number}
 */
export function compareSemverDesc(a = '', b = '') {
	const pa = parseSemver(a)
	const pb = parseSemver(b)
	if (pa[0] !== pb[0]) return pb[0] - pa[0]
	if (pa[1] !== pb[1]) return pb[1] - pa[1]
	return pb[2] - pa[2]
}

/**
 * Format release version to path segments e.g. "1.0.0" -> "1/0/v1.0.0"
 * @param {string} [version='']
 * @returns {string}
 */
export function versionToPath(version = '') {
	const clean = version.replace(/^v/, '')
	const parts = clean.split('.').slice(0, 2)
	return [...parts, `v${clean}`].join('/')
}

/**
 * Check whether a document exists in the virtual database
 * @param {any} db
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function documentExists(db, path) {
	try {
		const doc = await db.loadDocument(path, null)
		return doc !== null && doc !== undefined
	} catch {
		return false
	}
}

/**
 * Load release doc (release.md, task.md, plan.md) and extract tasks
 * @param {any} db
 * @param {string} releaseDir
 * @returns {Promise<{ releaseContent: string, sourceDoc: string, tasks: import('./ReleaseParser.js').TaskItem[] }>}
 */
export async function loadReleaseDoc(db, releaseDir) {
	let releaseContent = ''
	let sourceDoc = `${releaseDir}/release.md`
	for (const docFile of ['release.md', 'task.md', 'plan.md']) {
		try {
			const content = await db.loadDocument(`${releaseDir}/${docFile}`, '')
			if (content) {
				releaseContent = content
				sourceDoc = `${releaseDir}/${docFile}`
				break
			}
		} catch {}
	}
	return { releaseContent, sourceDoc, tasks: releaseContent ? extractTasks(releaseContent) : [] }
}

/**
 * Discover release version directories using database listDir
 * @param {any} db
 * @param {string} projectRoot
 * @returns {Promise<Array<{ version: string, path: string }>>}
 */
export async function discoverReleases(db, projectRoot) {
	const results = []
	const releasesUri = `${projectRoot}releases`.replace(/^\/+/, '') || 'releases'

	try {
		if (typeof db.listDir === 'function') {
			const queue = [{ uri: releasesUri, depth: 0 }]
			while (queue.length > 0) {
				const item = queue.shift()
				if (!item || item.depth > 3) continue
				let entries = []
				try {
					entries = await db.listDir(item.uri)
				} catch {
					continue
				}
				if (!Array.isArray(entries)) continue

				for (const entry of entries) {
					const rawName = entry.name || (entry.path || '').split('/').pop() || ''
					const name = rawName.replace(/\/$/, '')
					const isDir = Boolean(
						entry.stat?.isDirectory ||
						entry.isDirectory ||
						entry.isDir ||
						rawName.endsWith('/')
					)

					const dirMatch = name.match(/^v(\d+\.\d+\.\d+[a-zA-Z0-9._-]*)/)
					if (dirMatch) {
						const version = dirMatch[1]
						const entryPath = entry.path ? entry.path.replace(/\/$/, '') : `${item.uri}/${name}`
						const normalizedPath = entryPath.replace(/^\.\//, '')
						if (!results.find((r) => r.path === normalizedPath)) {
							results.push({ version, path: normalizedPath })
						}
					} else if (isDir && !name.startsWith('.') && name !== 'node_modules' && name !== '_') {
						const nextUri = entry.path ? entry.path.replace(/\/$/, '') : `${item.uri}/${name}`
						queue.push({ uri: nextUri, depth: item.depth + 1 })
					}
				}
			}
		}
	} catch {}

	return results.sort((a, b) => compareSemverDesc(a.version, b.version))
}
