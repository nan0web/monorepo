/**
 * Address model.
 * Stores the information about the address of sender or recipient.
 */
class Address {
	/** @type {string} */
	address
	/** @type {string} */
	name

	/**
	 * Creates an instance of Address.
	 *
	 * @param {object} input - The input object.
	 * @param {string} input.address - The address string.
	 * @param {string} [input.name=""] - The name associated with the address.
	 */
	constructor(input) {
		const { address, name = '' } = input
		this.address = String(address)
		this.name = String(name)
	}

	/**
	 * Gets the type of address based on its format.
	 *
	 * @returns {string} The type of address ("email", "facebook", "phone", "url", or "address").
	 */
	get type() {
		if (this.address.includes('@')) return 'email'
		if (this.address.startsWith('https://') || this.address.startsWith('http://')) return 'url'
		const phone = this.address.match(/[\d\-\(\)\+\s]+/g)
		if (phone && phone.join('').length > 4) return 'phone'
		if (this.address.startsWith('tel:')) return 'tel'
		return 'address'
	}

	/**
	 * Decodes address from a string.
	 *
	 * @param {string} input - The input string.
	 * @returns {Address} The decoded Address instance.
	 */
	static #fromString(input) {
		const regex = /^(.*)\s*<(.+)>$/
		const match = input.match(regex)
		if (match) {
			const [, name, address] = match
			return new Address({ address: address.trim(), name: name.trim() })
		}
		return new Address({ address: input })
	}

	/**
	 * Returns the string representation of the Address.
	 *
	 * @returns {string} The formatted string "<address>" or "Name <address>".
	 */
	toString() {
		const arr = [`<${this.address}>`]
		if (this.name) arr.unshift(`${this.name}`.replace(/[\<\>]+/g, ''))
		return arr.join(' ')
	}

	/**
	 * Converts the Address instance to an object.
	 *
	 * @param {string[]} [fields=[]] - Optional array of fields to include in the output object.
	 * @returns {object} An object representation of the Address instance.
	 */
	toObject(fields = []) {
		if (fields.length) {
			const result = {}
			fields.forEach((f) => (result[f] = this[f]))
			return result
		}
		return {
			address: this.address,
			name: this.name,
			type: this.type,
		}
	}

	/**
	 * Decodes an address string in the format "Name <address>" or returns the input if already an Address instance.
	 *
	 * @param {string | object} input - The string containing the name and address or an object with address/name properties.
	 * @returns {Address} - An instance of Address.
	 */
	static from(input) {
		if (input instanceof Address) return input
		if ('string' === typeof input) {
			return Address.#fromString(input)
		}
		return new Address(input)
	}
}

export default Address
