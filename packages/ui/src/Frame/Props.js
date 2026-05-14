import { typeOf, ObjectWithAlias } from '@nan0web/types'

/**
 * Represents default styling properties for Frame rendering.
 * Every tag must be a separate value in the array of rows/columns.
 * If you want to apply the same props to multiple values, you can use an array of values.
 * If you want to apply different props to multiple values, you can use an object with the props.
 * If you want to apply props to a single value, you can use a string with the props in XML format.
 * Parser checks every atom for its beginning and end and if it's a tag, it applies the props to the value.
 *
 * @example
 * const defaultProps = new FrameProps({
 * 	color: "red",
 * 	bgColor: "blue",
 * 	bold: true,
 * 	italic: true,
 * 	underline: true,
 * 	strikethrough: true,
 * })
 * or by aliases:
 * const defaultProps = new FrameProps({
 * 	fg: "red",
 * 	bg: "blue",
 * 	b: true,
 * 	i: true,
 * 	u: true,
 * 	s: true,
 * })
 * from an array of strings:
 * const rows = [
 * 	["Hello", "World"],
 * 	["<fg=red>Hello</>", "<bg=blue>World</>"],
 * 	["<b>Hello</b>", "<i>World</i>"],
 * 	["<u>Hello</u>", "<s>World</s>"],
 * 	["<b fg=red>Hello</b>", "<i bg=blue>World</i>"],
 * 	["<b i>Hello</b>", "<i b>World</i>"],
 * 	["<b i s>Some</b>", ["thing", {b: true, i: true, s: true}]],
 * 	[["Hello", "World", {b: true}]],
 * ]
 * const defaultProps = new FrameProps(rows)
 */
class FrameProps extends ObjectWithAlias {
	/**
	 * Property aliases for shorthand notation.
	 * @type {Record<string, string>}
	 */
	static ALIAS = {
		fg: 'color',
		bg: 'bgColor',
		b: 'bold',
		i: 'italic',
		u: 'underline',
		s: 'strikethrough',
	}

	/**
	 * @param {object} props - Frame properties
	 * @param {string} [props.color=""] - Text color
	 * @param {string} [props.bgColor=""] - Background color
	 * @param {boolean} [props.bold=false] - Bold text flag
	 * @param {boolean} [props.italic=false] - Italic text flag
	 * @param {boolean} [props.underline=false] - Underline text flag
	 * @param {boolean} [props.strikethrough=false] - Strikethrough text flag
	 */
	constructor(props = {}) {
		super()
		const {
			color = '',
			bgColor = '',
			bold = false,
			italic = false,
			underline = false,
			strikethrough = false,
		} = props
		
		/** @type {string} Text color */
		this.color = color
		
		/** @type {string} Background color */
		this.bgColor = bgColor
		
		/** @type {boolean} Bold text flag */
		this.bold = bold
		
		/** @type {boolean} Italic text flag */
		this.italic = italic
		
		/** @type {boolean} Underline text flag */
		this.underline = underline
		
		/** @type {boolean} Strikethrough text flag */
		this.strikethrough = strikethrough
	}
}

export default FrameProps
