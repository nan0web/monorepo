import { HostingConfig } from './HostingConfig.js'
import { SiteConfig } from './SiteConfig.js'

/**
 * Load HostingConfig from hosting.nan0 (or defaults).
 * @param {import('@nan0web/db').default} db
 * @returns {Promise<HostingConfig>}
 */
export async function loadHostingConfig(db) {
	const raw = await db.loadDocument('hosting', null)
	return new HostingConfig(raw || {})
}

/**
 * Load all SiteConfig entries from a directory (e.g. sites-enabled or sites-available).
 * @param {import('@nan0web/db').default} db
 * @param {string} dir
 * @returns {Promise<Array<{ name: string, uri: string, site: SiteConfig }>>}
 */
export async function loadSitesFromDir(db, dir) {
	const entries = await db.listDir(dir)
	const sites = []
	for (const entry of entries) {
		if (!entry.isFile && !entry.isSymbolicLink) continue
		if (!db.isData(entry.name)) continue
		const uri = entry.uri || db.normalize(dir, entry.name)
		const raw = await db.loadDocument(uri, null)
		if (!raw || !raw.domain) continue
		sites.push({
			name: db.basename(entry.name, db.extname(entry.name)),
			uri,
			site: new SiteConfig(raw),
		})
	}
	return sites
}

/**
 * Find an enabled site by port or domain.
 * @param {import('@nan0web/db').default} db
 * @param {HostingConfig} cfg
 * @param {string|number} target
 * @returns {Promise<{ name: string, uri: string, site: SiteConfig } | null>}
 */
export async function findSite(db, cfg, target) {
	const sites = await loadSitesFromDir(db, cfg.paths.sitesEnabled)
	const needle = String(target)
	return sites.find((item) => String(item.site.port) === needle || item.site.domain === needle) || null
}

/**
 * Read active lock state if its PID is still alive; otherwise clean up stale lock.
 * @param {import('@nan0web/db').default} db
 * @param {object} system
 * @param {string} lockUri
 * @returns {Promise<{ pid: string, action: string, step: string, detail: string, label: string } | null>}
 */
export async function readActiveLock(db, system, lockUri) {
	const raw = await db.loadDocument(lockUri, null)
	if (!raw) return null
	if (typeof raw === 'object') {
		const pid = String(raw.pid || '')
		if (pid && system.isPidAlive(pid)) {
			const detail = String(raw.detail || raw.label || 'Working...')
			return { pid, action: String(raw.action || ''), step: String(raw.step || ''), detail, label: detail }
		}
		await db.dropDocument(lockUri).catch(() => {})
		return null
	}
	const [pid, label] = String(raw).trim().split('|')
	if (pid && system.isPidAlive(pid)) {
		const detail = label || 'Working...'
		return { pid, action: '', step: '', detail, label: detail }
	}
	await db.dropDocument(lockUri).catch(() => {})
	return null
}

/**
 * Resolve a relative URI to an absolute host path inside --dir.
 * @param {import('@nan0web/db').default} db
 * @param {string} dir
 * @param {string} [relUri]
 * @returns {string}
 */
export function resolveEnvPath(db, dir, relUri = '') {
	if (relUri && relUri.startsWith('/')) return relUri
	if (dir && dir !== '.' && dir.startsWith('/')) {
		const base = dir.replace(/\/+$/, '')
		return relUri ? `${base}/${relUri.replace(/^\/+/, '')}` : base
	}
	if (typeof db.location === 'function') {
		const loc = db.location(relUri)
		if (loc && loc.startsWith('/')) return loc
	}
	const base = dir && dir !== '.' ? dir.replace(/\/+$/, '') : (db.cwd || '.')
	return relUri ? `${base}/${relUri.replace(/^\/+/, '')}` : base
}
