/**
 * SealCommand – finalises a release by writing a `retro.md` file
 * and making the release directory read‑only.  This is a *light* implementation
 * that merely creates a placeholder retro file; a real implementation would
 * also set file system permissions and maybe create a Git tag.
 *
 * Usage:
 *   release seal [--message <text>]
 *
 * Options:
 *   --message – optional retro‑reflection text
 */
export default class SealCommand extends SubCommand {
	/**
	 * Seal the current release.
	 *
	 * @param {Object} ctx – command context
	 */
	run(ctx: any): Promise<void>
}
import SubCommand from './SubCommand.js'
