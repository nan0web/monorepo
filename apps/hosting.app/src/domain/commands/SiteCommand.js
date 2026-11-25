import { ModelAsApp, result, show } from '@nan0web/ui'
import { SiteConfig } from '../SiteConfig.js'
import { loadHostingConfig, loadSitesFromDir } from '../hostingContext.js'

/**
 * SiteCommand manages site configurations in sites-available and sites-enabled.
 */
export class SiteCommand extends ModelAsApp {
	static alias = 'site'

	static UI = {
		title: 'Manage site configurations (list, add, enable, disable)',
		usage: 'Usage: nan0host site <list|add|enable|disable> [domain] [port] [dir]',
		listed: 'Found {count} site(s)',
		added: 'Site {domain} (:{port}) added and enabled',
		enabled: 'Site {domain} enabled',
		disabled: 'Site {domain} disabled',
		notFound: 'Site {domain} not found',
	}

	static action = {
		help: 'Action: list | add | enable | disable',
		default: 'list',
		positional: true,
	}

	static domain = {
		help: 'Target domain name (e.g. app.test)',
		default: '',
		positional: true,
	}

	static port = {
		help: 'Local application port',
		default: 0,
		positional: true,
	}

	static appDir = {
		help: 'Application working directory',
		default: '',
		positional: true,
	}

	static dir = {
		help: 'Environment directory (--dir)',
		default: '.',
	}

	/**
	 * @param {Partial<SiteCommand>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Action: list | add | enable | disable */ this.action
		/** @type {string} Target domain name (e.g. app.test) */ this.domain
		/** @type {number} Local application port */ this.port = Number(data.port || 0)
		/** @type {string} Application working directory */ this.appDir
		/** @type {string} Environment directory (--dir) */ this.dir
	}

	/**
	 * Execute site subcommand.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, unknown>}
	 */
	async *run() {
		const { t } = this._
		const db = this.$db
		const cfg = await loadHostingConfig(db)

		if (this.action === 'add') {
			const site = new SiteConfig({ domain: this.domain, port: this.port, dir: this.appDir })
			const availUri = db.normalize(cfg.paths.sitesAvailable, `${this.domain}.nan0`)
			const enabledUri = db.normalize(cfg.paths.sitesEnabled, `${this.domain}.nan0`)
			await db.saveDocument(availUri, site)
			await db.saveDocument(enabledUri, site)
			yield show(t(SiteCommand.UI.added, { domain: this.domain, port: this.port }), 'success')
			return result({ ok: true, action: 'add', site })
		}

		if (this.action === 'enable') {
			const availUri = db.normalize(cfg.paths.sitesAvailable, `${this.domain}.nan0`)
			const doc = await db.loadDocument(availUri, null)
			if (!doc) {
				yield show(t(SiteCommand.UI.notFound, { domain: this.domain }), 'error')
				return result({ ok: false, error: SiteCommand.UI.notFound })
			}
			const enabledUri = db.normalize(cfg.paths.sitesEnabled, `${this.domain}.nan0`)
			await db.saveDocument(enabledUri, doc)
			yield show(t(SiteCommand.UI.enabled, { domain: this.domain }), 'success')
			return result({ ok: true, action: 'enable', domain: this.domain })
		}

		if (this.action === 'disable') {
			const enabledUri = db.normalize(cfg.paths.sitesEnabled, `${this.domain}.nan0`)
			await db.dropDocument(enabledUri)
			yield show(t(SiteCommand.UI.disabled, { domain: this.domain }), 'success')
			return result({ ok: true, action: 'disable', domain: this.domain })
		}

		const sites = await loadSitesFromDir(db, cfg.paths.sitesEnabled)
		yield show(t(SiteCommand.UI.listed, { count: sites.length }), 'info')
		for (const item of sites) {
			yield show(`• ${item.site.domain} :${item.site.port} (${item.site.type})`, 'info')
		}
		return result({ ok: true, action: 'list', sites: sites.map((s) => s.site) })
	}
}

export default SiteCommand
