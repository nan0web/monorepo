/**
 * HostCommand – starts a minimal HTTP server that serves the current
 * release markdown and a tiny JSON status endpoint.
 *
 * Usage:
 *   release host [--port <number>] [--webui]
 */
export default class HostCommand extends SubCommand {
	/**
	 * Run the host server.
	 *
	 * @param {Object} ctx – command context
	 */
	run(ctx: any): Promise<void>
}
import SubCommand from './SubCommand.js'
