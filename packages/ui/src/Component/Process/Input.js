/**
 * Represents input data for the Process component.
 * Holds configuration for rendering a progress bar.
 */
class ProcessInput {
	/** @type {string} Process name to display */
	name

	/** @type {number} Current progress index */
	i

	/** @type {number} Top limit for progress normalization */
	top

	/** @type {number} Width of the progress bar */
	width

	/** @type {string} Character to use for empty space */
	space

	/** @type {string} Character to use for filled progress */
	char

	/**
	 * Creates a new ProcessInput instance.
	 * @param {object} props - Process input properties
	 * @param {string} [props.name="NaN•Coding"] - Process name
	 * @param {number} [props.i=0] - Current progress index
	 * @param {number} [props.top=9] - Top limit for progress normalization
	 * @param {number} [props.width=9] - Width of the progress bar
	 * @param {string} [props.space='•'] - Character for empty space
	 * @param {string} [props.char='*'] - Character for filled progress
	 */
	constructor(props = {}) {
		const { name = 'NaN•Coding', i = 0, top = 9, width = 9, space = '•', char = '*' } = props
		this.name = name
		this.i = i
		this.top = top
		this.width = width
		this.space = space
		this.char = char
	}

	/**
	 * Converts the input to a string representation.
	 * @returns {string} String representation of the ProcessInput
	 */
	toString() {
		return `ProcessInput(name=${this.name}, i=${this.i}, top=${this.top}, width=${this.width}, space=${this.space}, char=${this.char})`
	}

	/**
	 * Creates a ProcessInput instance from the given props.
	 * @param {ProcessInput|object} props - The properties to create from
	 * @returns {ProcessInput} A ProcessInput instance
	 */
	static from(props = {}) {
		if (props instanceof ProcessInput) return props
		return new ProcessInput(props)
	}
}

export default ProcessInput
