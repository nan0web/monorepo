import { empty } from '@nan0web/types'
import WelcomeInput from './Input.js'

/**
 * Renders a welcome message for a user.
 * @param {WelcomeInput|object} props - Welcome component properties
 * @returns {string[][]} Rendered welcome message as array of strings
 * @throws {Error} If no user data is provided
 */
function Welcome(props = {}) {
	const input = WelcomeInput.from(props)
	if (empty(input)) {
		throw new Error('User is required')
	}

	return [['Welcome', ' ', input.user.name, '!'], ['What can we do today great?'], ['']]
}

Welcome.Input = WelcomeInput
Welcome.ask = async () => ''

export default Welcome
