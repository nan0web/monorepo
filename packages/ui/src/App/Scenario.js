import App from './index.js'
import UI from './Core/UI.js'

/** @typedef {import("./Core/CoreApp.js").default} CoreApp */

/**
 * Abstract Scenario class to test app logic.
 * Scenarios run input commands and verify output.
 */
export default class Scenario {
	/** @type {CoreApp} The app to run scenarios against */
	app

	/**
	 * Creates a new Scenario instance.
	 * @param {CoreApp} app - App instance to run scenarios against
	 * @param {UI} ui - User interface
	 * @throws {TypeError} If app is not an App.Core.App instance
	 */
	constructor(app, ui) {
		if (!(app instanceof App.Core.App)) {
			throw new TypeError('Scenario requires a App.Core.App instance')
		}
		this.app = app
		this.ui = ui
	}

	/**
	 * Run scenario with input commands and expected output.
	 * @param {Array<any[]>} inputCommands - Array of command arrays
	 * @param {Array<any>} expectedOutputs - Expected outputs for each command
	 * @returns {Promise<boolean>} True if all outputs match expected
	 */
	async run(inputCommands, expectedOutputs) {
		const commandMessages = inputCommands.map((arr) => App.Command.Message.parse(arr))
		const outputs = await this.app.processCommands(commandMessages, this.ui)
		if (outputs.length !== expectedOutputs.length) return false
		for (let i = 0; i < outputs.length; i++) {
			if (JSON.stringify(outputs[i]) !== JSON.stringify(expectedOutputs[i])) {
				return false
			}
		}
		return true
	}
}
