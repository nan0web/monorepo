import { Model } from '@nan0web/types'

/**
 * Web server adapter configuration model.
 */
export class ServerConfig extends Model {
	static adapter = { help: 'Web server adapter name', default: 'caddy' }
	static caddyfile = { help: 'Path to Caddyfile', default: 'caddy/Caddyfile' }
	static sitesDir = { help: 'Directory for generated .caddy site configs', default: 'caddy/sites' }
	static localSnippet = { help: 'Caddy snippet name for local SSL', default: 'local_dev' }

	/**
	 * @param {Partial<ServerConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Web server adapter name */ this.adapter
		/** @type {string} Path to Caddyfile */ this.caddyfile
		/** @type {string} Directory for generated .caddy site configs */ this.sitesDir
		/** @type {string} Caddy snippet name for local SSL */ this.localSnippet
	}
}

/**
 * Local DNS provider configuration model.
 */
export class DnsConfig extends Model {
	static provider = { help: 'DNS provider name', default: 'dnsmasq' }

	/**
	 * @param {Partial<DnsConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} DNS provider name */ this.provider
	}
}

/**
 * Environment directory paths configuration model.
 */
export class PathsConfig extends Model {
	static sitesAvailable = { help: 'Available sites directory', default: 'sites-available' }
	static sitesEnabled = { help: 'Enabled sites directory', default: 'sites-enabled' }
	static logs = { help: 'Logs directory', default: 'data/logs' }
	static locks = { help: 'Locks directory', default: 'data/locks' }

	/**
	 * @param {Partial<PathsConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Available sites directory */ this.sitesAvailable
		/** @type {string} Enabled sites directory */ this.sitesEnabled
		/** @type {string} Logs directory */ this.logs
		/** @type {string} Locks directory */ this.locks
	}
}

/**
 * TrayBar (SwiftBar / Argos) configuration model.
 */
export class TrayConfig extends Model {
	static binMode = {
		help: 'Command invocation mode: bin | node',
		options: ['bin', 'node'],
		default: 'node',
	}
	static binPath = { help: 'Optional explicit binary path override', default: '' }

	/**
	 * @param {Partial<TrayConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Command invocation mode: bin | node */ this.binMode
		/** @type {string} Optional explicit binary path override */ this.binPath
	}
}

/**
 * HostingConfig defines the global hosting environment schema (hosting.nan0).
 */
export class HostingConfig extends Model {
	static server = { help: 'Web server adapter configuration', default: ServerConfig }
	static dns = { help: 'Local DNS provider configuration', default: DnsConfig }
	static paths = { help: 'Relative environment paths', default: PathsConfig }
	static tray = { help: 'TrayBar command configuration', default: TrayConfig }

	/**
	 * @param {Partial<HostingConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ServerConfig} Web server adapter configuration */ this.server = new ServerConfig(data.server || {})
		/** @type {DnsConfig} Local DNS provider configuration */ this.dns = new DnsConfig(data.dns || {})
		/** @type {PathsConfig} Relative environment paths */ this.paths = new PathsConfig(data.paths || {})
		/** @type {TrayConfig} TrayBar command configuration */ this.tray = new TrayConfig(data.tray || {})
	}
}
