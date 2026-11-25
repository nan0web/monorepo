import { ModelAsApp, result, show } from '@nan0web/ui'
import { SystemAdapter } from '../../adapters/SystemAdapter.js'
import { findSite, loadHostingConfig, resolveEnvPath } from '../hostingContext.js'

/**
 * Detect package manager for a project directory using $db.stat (Zero-FS).
 * @param {import('@nan0web/db').default} db
 * @param {string} appDir
 * @returns {Promise<string>}
 */
async function detectPackageManager(db, appDir) {
	if (await db.stat(db.resolveSync(appDir, '', 'pnpm-lock.yaml'))) return 'pnpm'
	if (await db.stat(db.resolveSync(appDir, '..', 'pnpm-lock.yaml'))) return 'pnpm'
	if (await db.stat(db.resolveSync(appDir, '', 'bun.lockb'))) return 'bun'
	if (await db.stat(db.resolveSync(appDir, '', 'bun.lock'))) return 'bun'
	if (await db.stat(db.resolveSync(appDir, '', 'yarn.lock'))) return 'yarn'
	return 'npm'
}

/**
 * AppCommand manages per-site dev/prod servers, Docker Compose dependencies, logs and IDE actions.
 */
export class AppCommand extends ModelAsApp {
	static alias = 'app'

	static UI = {
		title: 'Control site application servers (start-dev, start-prod, build-and-start, build-and-start-bg, stop, docker-up, terminal, finder, clear-error)',
		siteNotFound: 'Enabled site for target {target} not found',
		stopped: 'Stopped process on port {port}',
		dockerUp: 'Docker services started for {domain}',
		errorCleared: 'Cleared error log for port {port}',
		notifyTitle: 'Dev Proxy',
		notifyErrorTitle: 'Dev Proxy Error',
		dockerFailed: 'Docker failed for {domain}',
		building: 'Building {domain}...',
		buildFailed: 'Build failed for {domain}',
		online: '🟢 {domain} ONLINE (:{port})',
		checkLogs: 'Check logs for {domain}',
	}

	static action = {
		help: 'Action: start-dev | start-prod | build-and-start | build-and-start-bg | stop | docker-up | terminal | finder | clear-error',
		default: 'stop',
		positional: true,
	}

	static target = {
		help: 'Target port or domain name',
		default: '',
		positional: true,
	}

	static dir = {
		help: 'Environment directory (--dir)',
		default: '.',
	}

	/**
	 * @param {Partial<AppCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Action: start-dev | start-prod | build-and-start | build-and-start-bg | stop | docker-up | terminal | finder | clear-error */ this.action
		/** @type {string} Target port or domain name */ this.target
		/** @type {string} Environment directory (--dir) */ this.dir
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * Ensure Docker Compose services if configured on the site.
	 * @param {import('../SiteConfig.js').SiteConfig} site
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 * @returns {Promise<boolean>}
	 */
	async ensureDocker(site, cfg) {
		const { t } = this._
		const dockerDir = site.dockerDir
		if (!dockerDir) return true
		const hasCompose = (await this.$db.stat(this.$db.resolveSync(dockerDir, '', 'docker-compose.yml')))
			|| (await this.$db.stat(this.$db.resolveSync(dockerDir, '', 'docker-compose.yaml')))
		if (!hasCompose) return true

		await this.setLockStep(cfg, site, 'docker', 'Starting Docker...')
		const res = await this.$system.ensureDocker(dockerDir, site.dockerServices)
		const errUri = this.$db.normalize(cfg.paths.logs, `port-${site.port}-error.log`)
		if (!res.ok) {
			await this.$db.saveFile(errUri, `[${new Date().toISOString()}] ${res.error}\n`)
			this.$system.notify(t(AppCommand.UI.notifyErrorTitle), t(AppCommand.UI.dockerFailed, { domain: site.domain }))
			return false
		}
		await this.$db.dropDocument(errUri).catch(() => {})
		return true
	}

	/**
	 * Execute start-dev, start-prod or build-and-start-bg in background.
	 * @param {import('../SiteConfig.js').SiteConfig} site
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 */
	async startBackground(site, cfg) {
		const { t } = this._
		if (!(await this.ensureDocker(site, cfg))) return { ok: false, error: 'Docker startup failed' }
		await this.$system.stopPort(site.port)
		const pm = await detectPackageManager(this.$db, site.dir)
		const isDev = this.action === 'start-dev'
		const script = site.getScript(isDev ? 'dev' : 'start')
		const logUri = this.$db.normalize(cfg.paths.logs, `${isDev ? 'dev' : 'prod'}-${site.port}.log`)
		const logPath = resolveEnvPath(this.$db, this.dir, logUri)

		if (!isDev && this.action === 'build-and-start-bg') {
			await this.setLockStep(cfg, site, 'build', 'Building app...')
			this.$system.notify(t(AppCommand.UI.notifyTitle), t(AppCommand.UI.building, { domain: site.domain }))
			const buildRes = await this.$system.exec(pm, ['run', site.getScript('build')], { cwd: site.dir, timeout: 180000 })
			if (!buildRes.ok) {
				await this.$db.saveFile(this.$db.normalize(cfg.paths.logs, `port-${site.port}-error.log`), `${buildRes.stdout}\n${buildRes.stderr}\n`)
				this.$system.notify(t(AppCommand.UI.notifyErrorTitle), t(AppCommand.UI.buildFailed, { domain: site.domain }))
				return { ok: false, error: buildRes.stderr || 'Build failed' }
			}
		}

		await this.setLockStep(cfg, site, 'boot', 'Starting server...')
		const args = isDev && script === 'dev' ? ['run', 'dev', '--', '-p', String(site.port)] : ['run', script]
		await this.$system.spawnDetached(pm, args, { cwd: site.dir, env: { PORT: String(site.port) }, logFile: logPath })
		const online = await this.$system.waitForPort(site.port, 12)
		if (!online) {
			await this.$db.saveFile(this.$db.normalize(cfg.paths.logs, `port-${site.port}-error.log`), `[${new Date().toISOString()}] Port ${site.port} failed to start. Check ${logPath}\n`)
		}
		this.$system.notify(
			t(AppCommand.UI.notifyTitle),
			online ? t(AppCommand.UI.online, { domain: site.domain, port: site.port }) : t(AppCommand.UI.checkLogs, { domain: site.domain }),
		)
		return { ok: online, port: site.port, domain: site.domain }
	}

	/**
	 * Update structured lock state for a site and immediately refresh tray.
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 * @param {import('../SiteConfig.js').SiteConfig} site
	 * @param {string} step
	 * @param {string} detail
	 */
	async setLockStep(cfg, site, step, detail) {
		const lockUri = this.$db.normalize(cfg.paths.locks, `port-${site.port}.state`)
		await this.$db.saveDocument(lockUri, {
			pid: process.pid,
			action: this.action,
			step,
			detail,
		})
		this.$system.refreshTray()
	}

	/**
	 * Execute an async task while holding the site lock and refreshing the tray on completion.
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 * @param {import('../SiteConfig.js').SiteConfig} site
	 * @param {() => Promise<any>} fn
	 */
	async withSiteLock(cfg, site, fn) {
		const lockUri = this.$db.normalize(cfg.paths.locks, `port-${site.port}.state`)
		try {
			return await fn()
		} finally {
			await this.$db.dropDocument(lockUri).catch(() => {})
			this.$system.refreshTray()
		}
	}

	/**
	 * Execute app subcommand.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, unknown>}
	 */
	async *run() {
		const { t } = this._
		const db = this.$db
		const cfg = await loadHostingConfig(db)
		const found = await findSite(db, cfg, this.target)

		if (!found) {
			if (this.action === 'stop' && /^\d+$/.test(this.target)) {
				await this.$system.stopPort(this.target)
				this.$system.refreshTray()
				yield show(t(AppCommand.UI.stopped, { port: this.target }), 'success')
				return result({ ok: true, action: 'stop', port: Number(this.target) })
			}
			yield show(t(AppCommand.UI.siteNotFound, { target: this.target }), 'error')
			return result({ ok: false, error: AppCommand.UI.siteNotFound })
		}

		const { site } = found
		if (this.action === 'clear-error') {
			await db.dropDocument(db.normalize(cfg.paths.logs, `port-${site.port}-error.log`)).catch(() => {})
			this.$system.refreshTray()
			yield show(t(AppCommand.UI.errorCleared, { port: site.port }), 'success')
			return result({ ok: true, action: 'clear-error', port: site.port })
		}
		if (this.action === 'stop') {
			await this.$system.stopPort(site.port)
			this.$system.refreshTray()
			yield show(t(AppCommand.UI.stopped, { port: site.port }), 'success')
			return result({ ok: true, action: 'stop', port: site.port })
		}
		if (this.action === 'docker-up') {
			const ok = await this.withSiteLock(cfg, site, () => this.ensureDocker(site, cfg))
			yield show(t(AppCommand.UI.dockerUp, { domain: site.domain }), ok ? 'success' : 'error')
			return result({ ok, action: 'docker-up', domain: site.domain })
		}
		if (this.action === 'docker-down') {
			const res = await this.withSiteLock(cfg, site, async () => {
				await this.setLockStep(cfg, site, 'docker', 'Stopping Docker...')
				return this.$system.stopDocker(site.dockerDir, site.dockerServices)
			})
			yield show(t(AppCommand.UI.stopped, { port: site.port }), res.ok ? 'success' : 'error')
			return result({ ok: res.ok, action: 'docker-down', domain: site.domain })
		}
		if (this.action === 'terminal') {
			await this.$system.openTerminal(site.dir)
			return result({ ok: true, action: 'terminal' })
		}
		if (this.action === 'finder') {
			await this.$system.openFileManager(site.dir)
			return result({ ok: true, action: 'finder' })
		}
		if (this.action === 'build-and-start') {
			await this.ensureDocker(site, cfg)
			await this.$system.stopPort(site.port)
			const pm = await detectPackageManager(db, site.dir)
			const cmd = `export PORT=${site.port} && ${pm} run ${site.getScript('build')} && ${pm} run ${site.getScript('start')}`
			await this.$system.openTerminal(site.dir, cmd)
			return result({ ok: true, action: 'build-and-start' })
		}

		const res = await this.withSiteLock(cfg, site, () => this.startBackground(site, cfg))
		return result({ ...res, action: this.action })
	}
}

export default AppCommand
