import { Model } from '@nan0web/types'
import { Data } from '@nan0web/db'
import AgentEntryConfig from './AgentEntryConfig.js'
import StepsConfig from './StepsConfig.js'

/**
 * Unified NaN0Web configuration contract (Model-as-Schema) for nan0web.nan0.
 * Combines CoCoDev 7-step config, package agents, and nan0web.app runtime settings.
 */
export default class NaN0WebConfig extends Model {
	static title = {
		alias: 'name',
		help: 'Package or workspace name',
		default: '',
	}
	static appName = {
		alias: 'name',
		help: 'Project name',
		placeholder: 'my-app',
		default: '',
	}
	static dsn = {
		help: 'Data Source Name (folder or connection string)',
		placeholder: 'data/',
		default: 'data/',
	}
	static locale = {
		help: 'Default locale',
		placeholder: 'en',
		default: 'en',
	}
	static port = {
		help: 'Server port',
		placeholder: '3000',
		default: 3000,
	}
	static theme = {
		help: 'UI theme (light | dark | auto)',
		placeholder: 'auto',
		default: 'auto',
	}
	static aliases = {
		help: 'Virtual URI aliases (source -> target)',
		type: 'Record<string, string>',
		default: {},
		hidden: true,
	}
	static directoryIndex = {
		help: 'Directory index file name (index or README for git repos)',
		placeholder: 'index',
		default: 'index',
	}
	static ui = {
		help: 'UI adapters to load',
		type: 'string[]',
		default: [],
	}
	static ssl = {
		help: 'TLS/SSL config for HTTPS — certificate and key paths',
		type: 'object',
		default: null,
		hidden: true,
	}
	static log = {
		help: 'Configuration for access and error logs',
		type: 'object',
		default: {},
		hidden: true,
	}
	static apps = {
		help: 'Installed domain apps',
		type: 'object[]',
		hidden: true,
		default: [],
	}
	static agents = {
		help: 'Configured AI agents and their workflows/inspectors',
		type: 'AgentEntryConfig[]',
		hint: AgentEntryConfig,
		default: [],
	}
	static steps = {
		help: 'CoCoDev 7-step configuration',
		type: 'StepsConfig',
		hint: StepsConfig,
		default: {},
	}

	/**
	 * @param {Partial<NaN0WebConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Package or workspace name */
		this.title
		/** @type {string} Project name */
		this.appName
		/** @type {string} Data Source Name (folder or connection string) */
		this.dsn
		/** @type {string} Default locale */
		this.locale
		/** @type {number} Server port */
		this.port
		/** @type {string} UI theme (light | dark | auto) */
		this.theme
		/** @type {Record<string, string>} Virtual URI aliases (source -> target) */
		this.aliases
		/** @type {string} Directory index file name (index or README for git repos) */
		this.directoryIndex
		/** @type {string[]} UI adapters to load */
		this.ui = Array.isArray(this.ui) ? this.ui : []
		/** @type {object | null} TLS/SSL config for HTTPS — certificate and key paths */
		this.ssl
		/** @type {Record<string, any>} Configuration for access and error logs */
		this.log
		/** @type {Array<Record<string, any>>} Installed domain apps */
		this.apps = Array.isArray(this.apps) ? this.apps : []
		/** @type {AgentEntryConfig[]} Configured AI agents and their workflows/inspectors */
		this.agents = Array.isArray(data.agents)
			? data.agents.map((a) =>
					a instanceof AgentEntryConfig ? a : new AgentEntryConfig(a, options)
				)
			: []
		/** @type {StepsConfig} CoCoDev 7-step configuration */
		this.steps =
			data.steps instanceof StepsConfig ? data.steps : new StepsConfig(data.steps, options)
	}

	/**
	 * Loads and merges cascading nan0web.nan0 layers from a @nan0web/db instance.
	 * @param {import('@nan0web/db').default} db
	 * @param {{ layers?: string[] }} [options]
	 * @returns {Promise<NaN0WebConfig>}
	 */
	static async load(db, options = {}) {
		const layers = options.layers ?? ['@system/nan0web', '@root/nan0web', '@app/nan0web']
		/** @type {Record<string, any>} */
		let merged = {}
		for (const uri of layers) {
			const doc = await db.loadDocument(uri).catch(() => null)
			if (doc && typeof doc === 'object') {
				merged = Data.merge(merged, doc)
			}
		}
		return new NaN0WebConfig(merged, { db })
	}
}
