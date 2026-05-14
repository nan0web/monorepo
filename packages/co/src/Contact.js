/**
 * Contact handling class
 * Parses and formats contact information with specific URI schemes.
 *
 * @example
 * const email = new Contact({ type: Contact.EMAIL, value: "test@example.com" })
 * console.log(email.toString()) // "mailto:test@example.com"
 *
 * @class Contact
 */
export default class Contact {
	/** @type {string} */
	static ADDRESS = 'address:'
	/** @type {string} */
	static EMAIL = 'mailto:'

	/** @type {string} */
	static FACEBOOK = 'https://www.facebook.com/'
	/** @type {string} */
	static INSTAGRAM = 'https://www.instagram.com/'
	/** @type {string} */
	static LINKEDIN = 'https://www.linkedin.com/in/'
	/** @type {string} */
	static SIGNAL = 'https://signal.me/#p/'
	/** @type {string} */
	static SKYPE = 'skype:'
	/** @type {string} */
	static TELEGRAM = 'https://t.me/'
	/** @type {string} */
	static VIBER = 'viber://chat?number='
	/** @type {string} */
	static WHATSAPP = 'https://wa.me/'
	/** @type {string} */
	static X = 'https://x.com/'

	/** @type {string} */
	static TELEPHONE = 'tel:'
	/** @type {string} */
	static URL = '//'

	/** @type {string} */
	type
	/** @type {string} */
	value

	/**
	 * Create a Contact instance.
	 *
	 * @param {object} [input={}]
	 * @param {string} [input.type=Contact.ADDRESS] - One of the static URI prefixes.
	 * @param {string} [input.value=""] - The raw value without the prefix.
	 */
	constructor(input = {}) {
		const { type = Contact.ADDRESS, value = '' } = input
		this.type = String(type)
		this.value = String(value)
	}

	/**
	 * Convert the contact to its string representation.
	 *
	 * @returns {string} URI string (e.g. `mailto:test@example.com` or `address:123 Main St`).
	 */
	toString() {
		if ([Contact.URL].includes(this.type)) {
			return this.value
		}
		return this.type + this.value
	}

	/**
	 * Parse a raw string into a {@link Contact} instance.
	 *
	 * @param {string} input - Raw contact string (may include a known prefix or be a plain email/phone/url).
	 * @returns {Contact} Parsed contact object.
	 */
	static parse(input) {
		input = String(input)
		let value = input
		let type
		if ('number' === typeof input) {
			type = String(type)
		}
		type = Object.values(Contact).find((str) => input.startsWith(str)) ?? ''
		if (type) {
			value = input.slice((type ?? '').length)
		} else {
			if (/^[a-z0-9\._\-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(input)) {
				type = Contact.EMAIL
			} else if (/^[\+\-\(\)\s\d]{6,}$/.test(input)) {
				type = Contact.TELEPHONE
			} else if (/^(http|https|ftp)?:\/\//.test(input)) {
				type = Contact.URL
			} else {
				type = Contact.ADDRESS
			}
		}
		return new Contact({ type, value })
	}

	/**
	 * Factory helper – returns the argument unchanged if it is already a {@link Contact},
	 * otherwise creates a new instance.
	 *
	 * @param {any} input - Contact instance or raw data suitable for the constructor.
	 * @returns {Contact}
	 */
	static from(input) {
		if (input instanceof Contact) return input
		if ('string' === typeof input) return Contact.parse(input)
		return new this(input)
	}
}
