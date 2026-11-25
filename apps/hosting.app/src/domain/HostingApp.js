import { ModelAsApp } from '@nan0web/ui'
import { SiteCommand } from './commands/SiteCommand.js'
import { AppCommand } from './commands/AppCommand.js'
import { ProxyCommand } from './commands/ProxyCommand.js'
import { TrayCommand } from './commands/TrayCommand.js'

/**
 * HostingApp - Main ModelAsApp controller for nan0host CLI.
 */
export class HostingApp extends ModelAsApp {
	static alias = 'nan0host'

	static UI = {
		title: 'Sovereign Local Hosting & Dev Proxy Controller (nan0host)',
	}

	static command = {
		help: 'Subcommand to execute (site, app, proxy, tray)',
		options: [SiteCommand, AppCommand, ProxyCommand, TrayCommand],
		positional: true,
		default: ProxyCommand,
	}

	/**
	 * @param {Partial<HostingApp>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Subcommand to execute */ this.command
	}
}

export default HostingApp
