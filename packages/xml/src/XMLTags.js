/**
 * Simple container for default XML tag names and a helper to close tags.
 * @class
 */
export default class XMLTags {
	/** @type {string} */
	$default = 'element'
	/** @type {string} */
	books = 'book'
	/** @type {string} */
	library = 'section'
	/** @type {string} */
	catalog = 'item'
	/** @type {string} */
	employees = 'employee'
	/** @type {string} */
	department = 'member'

	/**
	 * Return a closing string for a tag.
	 * If the tag starts with a question mark it is treated as a processing
	 * instruction and closed with `?>`, otherwise a normal closing tag is used.
	 * @param {string} tag - Tag name.
	 * @returns {string} Closing string.
	 */
	$selfClosed(tag) {
		if (tag.startsWith('?')) return '?>'
		return `></${tag}>`
	}
}
