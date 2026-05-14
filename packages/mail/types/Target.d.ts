export default Target
/**
 * @type {Map<string, string[]>}
 */
declare class Target extends Map<any, any> {
	static ADDRESS_FIELDS: string[]
	/**
	 * @param {string|object|Array} source
	 * @returns {Target}
	 */
	static from(source: string | object | any[]): Target
	constructor()
	/**
	 * Adds an email address to the specified field (to, cc, bcc)
	 * @param {string|Address|Array<string|Address>} address - The address in string or AddressAtom format.
	 * @param {string} type - The field type ('to', 'cc', 'bcc')
	 */
	add(address: string | Address | Array<string | Address>, type?: string): void
	/**
	 * @param {object} item
	 */
	addObject(item: object): void
	/**
	 * Converts the address to a nodemailer-compatible format.
	 * @returns {object} - The formatted object for nodemailer.
	 */
	formatForNodemailer(): object
}
import Address from './Address.js'
