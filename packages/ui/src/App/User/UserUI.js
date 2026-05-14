import { Message } from '@nan0web/co'
import App from '../Core/index.js'

/**
 * UserUI connects UserApp and View.
 * It asks user for name if not provided in command input.
 * Allows user to change user data to see another Welcome view.
 */
export default class UserUI extends App.UI {
	/**
	 * Convert raw input to Message array.
	 * If user.name provided in rawInput, use it directly.
	 * Otherwise ask user for name.
	 * @param {any} rawInput - Raw input to convert
	 * @returns {Message[]} Array of command messages
	 */
	convertInput(rawInput) {
		return [new Message({ body: rawInput })]
	}
}
