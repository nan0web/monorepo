import { WebCommand } from './WebCommand.js'

/**
 * PreviewCommand - Subcommand to generate, serve and preview PM-as-Code Web Dashboard.
 */
export class PreviewCommand extends WebCommand {
	static alias = 'preview'

	static UI = {
		title: 'PM-as-Code Web Dashboard Preview',
		loading: 'Aggregating release telemetry and preparing Web Dashboard preview...',
		generated: '✨ Web Dashboard успішно згенеровано: {$path}',
		serving: '🌐 Web Dashboard запущено: http://localhost:{$port} (Натисніть Ctrl+C для зупинки)',
	}

	static port = {
		help: 'Port to serve HTML dashboard over HTTP',
		default: 3333,
		type: 'number',
		alias: 'p',
	}

	static open = {
		help: 'Automatically open in browser',
		default: true,
		type: 'boolean',
	}

	/**
	 * @param {Partial<PreviewCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super({ port: 3333, open: true, ...data }, options)
	}
}

export default PreviewCommand
