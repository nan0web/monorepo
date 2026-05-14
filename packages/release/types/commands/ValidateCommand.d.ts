/**
 * ValidateCommand – runs the {@link Release.validate} method for the
 * currently checked‑out release and prints a short summary.
 *
 * Usage:
 *   release validate
 *
 * Options:
 *   --ignore-fail – do not treat failed tasks as a validation error
 */
export default class ValidateCommand extends SubCommand {
	/**
	 * Execute validation.
	 *
	 * @param {Object} ctx – command context
	 */
	run(ctx: any): Promise<void>
}
import SubCommand from './SubCommand.js'
