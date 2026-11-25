import { ModelAsApp, result, show } from '@nan0web/ui'
import { CaddyServerAdapter } from '../../adapters/CaddyServerAdapter.js'
import { SystemAdapter } from '../../adapters/SystemAdapter.js'
import { loadHostingConfig, loadSitesFromDir } from '../hostingContext.js'

/**
 * ProxyCommand manages Caddy reverse proxy lifecycle and _registry.caddy generation.
 */
export class ProxyCommand extends ModelAsApp {
	static alias = 'proxy'

	static UI = {
		title: 'Control Caddy reverse proxy (start, stop, reload, sync, validate, status, restart-dns, clear-error)',
		synced: 'Generated {path} for {count} active site(s)',
		started: 'Caddy started',
		stopped: 'Caddy stopped',
		reloaded: 'Caddy configuration reloaded',
		validated: 'Caddy configuration is valid',
		dnsRestarted: 'dnsmasq restarted',
		errorCleared: 'Proxy error cleared',
	}

	static action = {
		help: 'Proxy action: start | stop | reload | sync | validate | status | restart-dns | clear-error',
		default: 'status',
		positional: true,
	}

	static dir = {
		help: 'Environment directory (--dir)',
		default: '.',
	}

	/**
	 * @param {Partial<ProxyCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Proxy action: start | stop | reload | sync | validate | status | restart-dns | clear-error */ this.action
		/** @type {string} Environment directory (--dir) */ this.dir
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * Sync _registry.caddy from sites-enabled/*.nan0 skipping manual .caddy files.
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 * @returns {Promise<{ registryUri: string, count: number }>}
	 */
	async syncRegistry(cfg) {
		const db = this.$db
		const entries = await db.listDir(cfg.server.sitesDir)
		const manualContents = []
		for (const entry of entries) {
			if (!entry.isFile || !entry.name.endsWith('.caddy') || entry.name === '_registry.caddy') continue
			const content = await db.loadDocument(entry.uri || db.normalize(cfg.server.sitesDir, entry.name), '')
			if (typeof content === 'string') manualContents.push(content)
		}

		const activeSites = await loadSitesFromDir(db, cfg.paths.sitesEnabled)
		const adapter = new CaddyServerAdapter()
		const caddyText = adapter.generateRegistry(
			activeSites.map((s) => s.site),
			{ localSnippet: cfg.server.localSnippet, manualContents },
		)
		const registryUri = db.normalize(cfg.server.sitesDir, '_registry.caddy')
		await db.saveFile(registryUri, caddyText)
		return { registryUri, count: activeSites.length }
	}

	/**
	 * Resolve a relative URI to an absolute host path inside --dir.
	 * @param {string} [relUri]
	 * @returns {string}
	 */
	resolveEnvPath(relUri = '') {
		if (relUri && relUri.startsWith('/')) return relUri
		const db = this.$db
		if (this.dir && this.dir !== '.' && this.dir.startsWith('/')) {
			const base = this.dir.replace(/\/+$/, '')
			return relUri ? `${base}/${relUri.replace(/^\/+/, '')}` : base
		}
		if (typeof db.location === 'function') {
			const loc = db.location(relUri)
			if (loc && loc.startsWith('/')) return loc
		}
		const base = this.dir && this.dir !== '.' ? this.dir.replace(/\/+$/, '') : (db.cwd || '.')
		return relUri ? `${base}/${relUri.replace(/^\/+/, '')}` : base
	}

	/**
	 * Record proxy error to logs and return failure result.
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 * @param {string} msg
	 */
	async recordError(cfg, msg) {
		const errUri = this.$db.normalize(cfg.paths.logs, 'caddy-error.log')
		await this.$db.saveFile(errUri, `[${new Date().toISOString()}] ${msg}\n`)
		this.$system.refreshTray()
		return result({ ok: false, error: msg })
	}

	/**
	 * Execute proxy subcommand.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, unknown>}
	 */
	async *run() {
		const { t } = this._
		const db = this.$db
		const cfg = await loadHostingConfig(db)
		const envDir = this.resolveEnvPath('')
		const caddyfile = this.resolveEnvPath(cfg.server.caddyfile)
		const errUri = db.normalize(cfg.paths.logs, 'caddy-error.log')
		const lockUri = db.normalize(cfg.paths.locks, 'proxy.state')

		if (this.action === 'sync') {
			const { registryUri, count } = await this.syncRegistry(cfg)
			this.$system.refreshTray()
			yield show(t(ProxyCommand.UI.synced, { path: registryUri, count }), 'success')
			return result({ ok: true, action: 'sync', registryUri, count })
		}

		if (this.action === 'clear-error') {
			await db.dropDocument(errUri).catch(() => {})
			this.$system.refreshTray()
			yield show(t(ProxyCommand.UI.errorCleared), 'success')
			return result({ ok: true, action: 'clear-error' })
		}

		if (this.action === 'restart-dns') {
			const res = await this.$system.restartDns()
			if (!res.ok) return await this.recordError(cfg, res.error || 'dnsmasq restart failed')
			await db.dropDocument(errUri).catch(() => {})
			this.$system.refreshTray()
			yield show(t(ProxyCommand.UI.dnsRestarted), 'success')
			return result({ ok: true, action: 'restart-dns' })
		}

		if (this.action === 'status') {
			const pids = await this.$system.getCaddyPids()
			const msg = pids.length > 0 ? `Caddy is running (PID: ${pids.join(' ')})` : 'Caddy is stopped'
			yield show(msg, 'info')
			return result({ ok: true, running: pids.length > 0, pids })
		}

		if (this.action === 'stop') {
			await db.saveFile(lockUri, `${process.pid}|stopping`)
			try {
				const res = await this.$system.exec('caddy', ['stop'], { cwd: envDir })
				if (!res.ok) return await this.recordError(cfg, res.stderr || 'Caddy stop failed')
				await db.dropDocument(errUri).catch(() => {})
				yield show(t(ProxyCommand.UI.stopped), 'success')
				return result({ ok: true, action: 'stop' })
			} finally {
				await db.dropDocument(lockUri).catch(() => {})
				this.$system.refreshTray()
			}
		}

		await this.syncRegistry(cfg)
		const val = await this.$system.exec('caddy', ['validate', '--config', caddyfile], { cwd: envDir })
		if (!val.ok) return await this.recordError(cfg, val.stderr || val.stdout)

		if (this.action === 'validate') {
			await db.dropDocument(errUri).catch(() => {})
			yield show(t(ProxyCommand.UI.validated), 'success')
			return result({ ok: true, action: 'validate' })
		}

		const pids = await this.$system.getCaddyPids()
		const isReload = this.action === 'reload' && pids.length > 0
		const cmdArgs = isReload ? ['reload', '--config', caddyfile] : ['start', '--config', caddyfile]
		await db.saveFile(lockUri, `${process.pid}|${isReload ? 'reloading' : 'starting'}`)
		try {
			const runRes = await this.$system.exec('caddy', cmdArgs, { cwd: envDir })
			if (!runRes.ok) return await this.recordError(cfg, runRes.stderr || runRes.stdout)
			await db.dropDocument(errUri).catch(() => {})
			yield show(t(this.action === 'reload' ? ProxyCommand.UI.reloaded : ProxyCommand.UI.started), 'success')
			return result({ ok: true, action: this.action })
		} finally {
			await db.dropDocument(lockUri).catch(() => {})
			this.$system.refreshTray()
		}
	}
}

export default ProxyCommand
