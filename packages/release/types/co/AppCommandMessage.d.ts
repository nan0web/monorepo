export default class AppCommandMessage {
	/**
	 * @param {*} input
	 * @returns {AppCommandMessage}
	 */
	static from(input: any): AppCommandMessage
	set opts(arg: AppCommandOptions)
	/** @returns {AppCommandOptions} */
	get opts(): AppCommandOptions
}
import AppCommandOptions from './AppCommandOptions.js'
