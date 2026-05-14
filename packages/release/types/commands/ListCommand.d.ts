/**
 * ListCommand – prints a concise list of releases found in the current
 * working directory.  It works against the {@link ReleaseDB} instance
 * passed through the `db` option of the parent CLI.
 *
 * Usage:
 *   release list
 *
 * Options:
 *   --json – output JSON instead of a human‑readable list
 */
export default class ListCommand extends SubCommand {
	/**
	 * Execute the command.
	 *
	 * @param {Object} ctx – command context (contains parsed args)
	 * @returns {Promise<void>}
	 */
	run(ctx: any): Promise<void>
}
import SubCommand from './SubCommand.js'
