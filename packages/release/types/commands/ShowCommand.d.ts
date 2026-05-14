/**
 * ShowCommand – prints basic information about the current release
 * (version, creation date, and a short excerpt of the markdown notes).
 *
 * Usage:
 *   release show
 *
 * Options:
 *   --full – dump the whole release.md file
 */
export default class ShowCommand extends SubCommand {
	/**
	 * Render the release information.
	 *
	 * @param {Object} ctx – command context
	 */
	run(ctx: any): Promise<void>
}
import SubCommand from './SubCommand.js'
