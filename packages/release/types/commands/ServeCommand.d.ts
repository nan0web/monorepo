/**
 * ServeCommand – runs a tiny static file server that serves all files
 * inside the current release folder.  It is useful for quick local
 * inspection of assets, markdown, and generated test files.
 *
 * Usage:
 *   release serve [--port <number>]
 */
export default class ServeCommand extends SubCommand {
	/**
	 * Start the static server.
	 *
	 * @param {Object} ctx – command context
	 */
	run(ctx: any): Promise<void>
}
import SubCommand from './SubCommand.js'
