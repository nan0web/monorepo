import { Model } from '@nan0web/types'

/**
 * Docker Compose configuration model for a site.
 */
export class DockerConfig extends Model {
	static dir = { help: 'Docker Compose directory', default: '' }
	static services = { help: 'Docker Compose service names', default: [] }

	/**
	 * @param {Partial<DockerConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Docker Compose directory */ this.dir
		/** @type {string[]} Docker Compose service names */ this.services
	}
}

/**
 * Package scripts mapping model for a site.
 */
export class ScriptsConfig extends Model {
	static dev = { help: 'Dev server script', default: 'dev' }
	static start = { help: 'Production server script', default: 'start' }
	static build = { help: 'Build script', default: 'build' }

	/**
	 * @param {Partial<ScriptsConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Dev server script */ this.dev
		/** @type {string} Production server script */ this.start
		/** @type {string} Build script */ this.build
	}
}

/**
 * SiteConfig defines an individual site/application schema (sites-available/*.nan0).
 */
export class SiteConfig extends Model {
	static UI = {
		errorInvalidDomain: 'Invalid domain name',
		errorInvalidPort: 'Port must be an integer between 80 and 65535',
	}

	static domain = {
		help: 'Domain name (e.g. app.test)',
		type: 'string',
		required: true,
		validate: (v) =>
			(typeof v === 'string' && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) ||
			SiteConfig.UI.errorInvalidDomain,
	}

	static port = {
		help: 'Local application port',
		type: 'number',
		required: true,
		validate: (v) =>
			(Number.isInteger(Number(v)) && Number(v) >= 80 && Number(v) <= 65535) ||
			SiteConfig.UI.errorInvalidPort,
	}

	static type = {
		help: 'Application framework or stack type',
		options: ['Node.js', 'Next.js', 'Payload CMS', 'Vite SSG', 'Static'],
		default: 'Node.js',
	}

	static dir = { help: 'Working directory of the application', default: '' }

	static ssl = {
		help: 'SSL mode: local | letsencrypt | none',
		options: ['local', 'letsencrypt', 'none'],
		default: 'local',
	}

	static docker = { help: 'Optional Docker Compose configuration', default: DockerConfig }
	static scripts = { help: 'Package scripts mapping', default: ScriptsConfig }

	/**
	 * @param {Partial<SiteConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Domain name (e.g. app.test) */ this.domain
		/** @type {number} Local application port */ this.port = Number(data.port || 0)
		/** @type {string} Application framework or stack type */ this.type
		/** @type {string} Working directory of the application */ this.dir
		/** @type {string} SSL mode: local | letsencrypt | none */ this.ssl
		/** @type {DockerConfig | null} */
		this.docker = data.docker ? new DockerConfig(data.docker) : null
		/** @type {ScriptsConfig} */
		this.scripts = new ScriptsConfig(data.scripts || {})
	}

	/**
	 * Resolve Docker Compose working directory.
	 * @returns {string}
	 */
	get dockerDir() {
		return this.docker?.dir || this.dir
	}

	/**
	 * Resolve Docker Compose service names.
	 * @returns {string[]}
	 */
	get dockerServices() {
		return Array.isArray(this.docker?.services) ? this.docker.services : []
	}

	/**
	 * Resolve script name for a lifecycle action.
	 * @param {string} action
	 * @returns {string}
	 */
	getScript(action) {
		return this.scripts?.[action] || action
	}
}
