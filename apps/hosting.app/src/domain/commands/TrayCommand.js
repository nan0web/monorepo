import { ModelAsApp, result, show } from '@nan0web/ui'
import { SystemAdapter } from '../../adapters/SystemAdapter.js'
import { TrayBarAdapter } from '../../adapters/TrayBarAdapter.js'
import { loadHostingConfig, loadSitesFromDir, readActiveLock, resolveEnvPath } from '../hostingContext.js'

/**
 * TrayCommand collects environment status via $db + SystemAdapter and prints SwiftBar/Argos menu.
 */
export class TrayCommand extends ModelAsApp {
	static alias = 'tray'

	static UI = {
		title: 'Render SwiftBar / Argos tray menu output',
	}

	static dir = {
		help: 'Environment directory (--dir)',
		default: '.',
	}

	static binMode = {
		help: 'Command invocation mode: bin | node',
		default: '',
	}

	static binPath = {
		help: 'Explicit binary path override',
		default: '',
	}

	/**
	 * @param {Partial<TrayCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { system?: SystemAdapter }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Environment directory (--dir) */ this.dir
		/** @type {string} Command invocation mode: bin | node */ this.binMode
		/** @type {string} Explicit binary path override */ this.binPath
		/** @type {SystemAdapter} */ this.$system = options.system || new SystemAdapter()
	}

	/**
	 * Resolve a relative URI to an absolute host path inside --dir.
	 * @param {string} [relUri]
	 * @returns {string}
	 */
	resolveEnvPath(relUri = '') {
		return resolveEnvPath(this.$db, this.dir, relUri)
	}

	/**
	 * Build state object for a single site.
	 * @param {import('../SiteConfig.js').SiteConfig} site
	 * @param {import('../HostingConfig.js').HostingConfig} cfg
	 * @returns {Promise<object>}
	 */
	async buildSiteState(site, cfg) {
		const db = this.$db
		const pids = await this.$system.getPortPids(site.port)
		const lock = await readActiveLock(db, this.$system, db.normalize(cfg.paths.locks, `port-${site.port}.state`))
		const errUri = db.normalize(cfg.paths.logs, `port-${site.port}-error.log`)
		const hasError = Boolean((await db.stat(errUri))?.exists)
		const logCandidates = [`prod-${site.port}.log`, `dev-${site.port}.log`, `port-${site.port}-error.log`]
		const logFiles = []
		for (const name of logCandidates) {
			const uri = db.normalize(cfg.paths.logs, name)
			const absPath = db.resolveSync ? db.resolveSync(this.dir, '', cfg.paths.logs, name) : `${this.dir}/${uri}`
			const st = await db.stat(uri).catch(() => null)
			const exists = Boolean(st?.exists) || (this.$system.fileExists ? await this.$system.fileExists(absPath) : false)
			if (exists) {
				logFiles.push({ name, path: db.location && st?.exists ? db.location(uri) : absPath })
			}
		}

		const dockerDir = site.dockerDir
		const hasDocker = Boolean(
			dockerDir &&
				((await db.stat(db.resolveSync(dockerDir, '', 'docker-compose.yml')))?.exists ||
					(await db.stat(db.resolveSync(dockerDir, '', 'docker-compose.yaml')))?.exists),
		)

		const dockerUp = hasDocker && this.$system.isDockerComposeRunning
			? await this.$system.isDockerComposeRunning(dockerDir, site.dockerServices)
			: undefined

		return {
			domain: site.domain,
			port: site.port,
			online: pids.length > 0,
			pid: pids[0] || '',
			isBusy: Boolean(lock),
			activeAction: lock?.action || '',
			activeStep: lock?.step || '',
			lockLabel: lock?.label || '',
			hasError,
			errorLog: hasError ? (db.location ? db.location(errUri) : `${this.dir}/${errUri}`) : '',
			logFile: logFiles[0]?.path || '',
			logFiles,
			hasDocker,
			dockerUp,
			dir: site.dir || false,
			scripts: site.scripts,
		}
	}

	/**
	 * Execute tray subcommand.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, unknown>}
	 */
	async *run() {
		const db = this.$db
		const cfg = await loadHostingConfig(db)
		const caddyPids = await this.$system.getCaddyPids()
		const dnsOk = await this.$system.isDnsOk()
		const proxyErrUri = db.normalize(cfg.paths.logs, 'caddy-error.log')
		const proxyErrRaw = await db.loadDocument(proxyErrUri, '')
		const errorSummary = typeof proxyErrRaw === 'string' ? proxyErrRaw.split('\n')[0].trim() : ''
		const proxyLock = await readActiveLock(db, this.$system, db.normalize(cfg.paths.locks, 'proxy.state'))
		const proxyState = proxyLock?.label || ''

		const enabled = await loadSitesFromDir(db, cfg.paths.sitesEnabled)
		const sites = []
		for (const item of enabled) {
			sites.push(await this.buildSiteState(item.site, cfg))
		}

		const hasDockerSites = sites.some((s) => s.hasDocker)
		const dockerRunning = hasDockerSites && typeof this.$system.isDockerRunning === 'function'
			? await this.$system.isDockerRunning()
			: true
		const cliPaths = typeof this.$system.resolveCliPaths === 'function'
			? this.$system.resolveCliPaths()
			: { binPath: 'nan0host', nodePath: process.execPath }
		const logsDir = this.resolveEnvPath(cfg.paths.logs)
		const proxyLog = errorSummary ? this.resolveEnvPath(proxyErrUri) : logsDir

		const { t } = this._
		const output = TrayBarAdapter.render({
			envDir: this.dir,
			binPath: this.binPath || cfg.tray?.binPath || cliPaths.binPath,
			nodePath: cliPaths.nodePath,
			binMode: this.binMode || cfg.tray?.binMode || 'node',
			sitesDir: this.resolveEnvPath(cfg.server.sitesDir),
			logsDir,
			proxyLog,
			caddyRunning: caddyPids.length > 0,
			caddyPids,
			dnsOk,
			dockerRunning,
			proxyState,
			errorSummary,
			errorLog: errorSummary ? this.resolveEnvPath(proxyErrUri) : '',
			sites,
		}, t)

		yield show(output, 'info')
		return result({ ok: true, output, sitesCount: sites.length })
	}
}

export default TrayCommand
