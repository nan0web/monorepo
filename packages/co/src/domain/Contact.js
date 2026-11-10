import { Model } from '@nan0web/types'

/**
 * Contact handling class
 * Parses and formats contact information with specific URI schemes.
 *
 * @example
 * const email = new Contact({ type: Contact.EMAIL, value: "test@example.com" })
 * console.log(email.toString()) // "mailto:test@example.com"
 *
 * @class Contact
 * @extends Model
 */
export default class Contact extends Model {
	/** @type {string} Contact type/URI scheme */
	type = 'address:'
	/** @type {string} Contact value */
	value = ''

	static type = {
		help: 'Contact type/URI scheme',
		default: 'address:',
		type: 'string',
	}

	static value = {
		help: 'Contact value',
		default: '',
		type: 'string',
	}

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

	/**
	 * Create a Contact instance.
	 *
	 * @param {object} [data={}]
	 * @param {object} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		Object.assign(this, data)
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
	 * Format contact for human-readable text presentation.
	 * Removes scheme prefixes and formats numbers.
	 *
	 * @returns {string}
	 */
	toText() {
		if (this.type === Contact.EMAIL) {
			return this.value
		}
		if (this.type === Contact.TELEPHONE) {
			// International formatting: handles 1, 2, 3 digit country codes & short/premium numbers
			const clean = this.value.replace(/[^\d+]/g, '')
			
			// 1. Short / Emergency / Premium national numbers (e.g. Finland 112, 0600..., 0700..., 10041...)
			// If number has <= 6 digits, keep as-is
			const digitsOnly = clean.replace(/^\+/, '')
			if (digitsOnly.length <= 6) {
				return this.value.trim()
			}

			// 2. North America (NANP: +1) - exactly 11 digits
			const m1 = clean.match(/^\+?1(\d{3})(\d{3})(\d{4})$/)
			if (m1) return `+1 (${m1[1]}) ${m1[2]}-${m1[3]}`

			// 3. Post-Soviet single-digit code +7 (Kazakhstan, Russia) -> +7 (XXX) XXX-XX-XX
			const m7 = clean.match(/^\+?7(\d{3})(\d{3})(\d{2})(\d{2})$/)
			if (m7) return `+7 (${m7[1]}) ${m7[2]}-${m7[3]}-${m7[4]}`

			// 4. Known 2-digit CCs:
			// Europe: +44 UK, +49 DE, +33 FR, +34 ES, +39 IT, +48 PL, +31 NL, +32 BE, +41 CH, +43 AT, +46 SE, +47 NO
			// Africa: +20 Egypt, +27 South Africa, +25x East Africa
			// Middle East / Asia: +90 Turkey, +81 Japan, +82 Korea, +86 China
			const m2 = clean.match(/^\+?(44|49|33|34|39|48|31|32|41|43|46|47|20|27|90|81|82|86)(\d{2,3})(\d{3})(\d{3,4})$/)
			if (m2) return `+${m2[1]} (${m2[2]}) ${m2[3]}-${m2[4]}`

			// 5. Middle East 3-digit CCs starting with 9:
			// +971 UAE (+971 50 123-4567), +972 Israel, +966 Saudi Arabia, +965 Kuwait, +974 Qatar
			const m9 = clean.match(/^\+?(971|972|966|965|974|968|973)(\d{2})(\d{3})(\d{4})$/)
			if (m9) return `+${m9[1]} (${m9[2]}) ${m9[3]}-${m9[4]}`

			// 6. Post-Soviet 3-digit CCs:
			// +380 Ukraine, +375 Belarus, +370 Lithuania, +371 Latvia, +372 Estonia, +373 Moldova, +374 Armenia, +994 Azerbaijan, +995 Georgia, +996 Kyrgyzstan, +992 Tajikistan, +998 Uzbekistan
			const mPostSoviet = clean.match(/^\+?(380|375|370|371|372|373|374|994|995|996|992|998|358)(\d{2})(\d{3})(\d{4})$/)
			if (mPostSoviet) return `+${mPostSoviet[1]} (${mPostSoviet[2]}) ${mPostSoviet[3]}-${mPostSoviet[4]}`

			// 7. General 3-digit fallback
			const m3Gen = clean.match(/^\+?(\d{3})(\d{2})(\d{3})(\d{4})$/)
			if (m3Gen) return `+${m3Gen[1]} (${m3Gen[2]}) ${m3Gen[3]}-${m3Gen[4]}`

			// Fallback: return raw input
			return this.value.trim()
		}
		if (this.type === Contact.ADDRESS) {
			return this.value
		}
		return this.value || this.toString()
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
		type =
			Object.values(Contact).find((str) => typeof str === 'string' && input.startsWith(str)) ?? ''
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
