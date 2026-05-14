import ProcessInput from './Input.js'
import View from '../../View/View.js'

/**
 * Renders a progress bar based on input configuration.
 * @this {View}
 * @param {ProcessInput|object} props - Process component properties
 * @returns {string[][]} Rendered progress bar as array of strings
 */
function Process(props = {}) {
	const input = ProcessInput.from(props)
	const valid = input.top || 1
	const per = (input.i > valid ? valid : input.i) / valid
	const done = per * input.width
	const bar = input.char.repeat(done) + input.space.repeat(input.width - done)
	// Provide empty options object to satisfy Locale.format signature
	const format = this.locale.format(Number, {})
	const num = format ? format(100 * per) : 100 * per
	return [[`I am ${input.name} ${bar} ${num}`]]
}

Process.Input = ProcessInput

export default Process
