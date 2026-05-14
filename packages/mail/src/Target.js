import Address from './Address.js'

/**
 * @type {Map<string, string[]>}
 */
class Target extends Map {
	static ADDRESS_FIELDS = ['to', 'cc', 'bcc']

	constructor() {
		super()
		// Initialize arrays for each address type
		Target.ADDRESS_FIELDS.forEach((field) => this.set(field, []))
	}

	/**
	 * Adds an email address to the specified field (to, cc, bcc)
	 * @param {string|Address|Array<string|Address>} address - The address in string or AddressAtom format.
	 * @param {string} type - The field type ('to', 'cc', 'bcc')
	 */
	add(address, type = 'to') {
		if (!Target.ADDRESS_FIELDS.includes(type)) {
			throw new Error(`Invalid address type: ${type}`)
		}

		const arr = Array.isArray(address) ? address : [address]
		arr.forEach((a) => {
			const addressArray = this.get(type)
			if (addressArray) {
				addressArray.push(Address.from(a))
			} else {
				throw new Error(`Failed to add address: ${a}`)
			}
		})
	}

	/**
	 * @param {object} item
	 */
	addObject(item) {
		if (Object.keys(item).some((k) => Target.ADDRESS_FIELDS.includes(k))) {
			for (const key in item) {
				this.add(item[key], key)
			}
		} else if (item.type && item.address) {
			this.add(Address.from(item.address), item.type)
		} else if (item instanceof Target) {
			for (const key of Target.ADDRESS_FIELDS) {
				this.add(item.get(key), key)
			}
		} else {
			this.add(Address.from(item))
		}
	}

	/**
	 * Converts the address to a nodemailer-compatible format.
	 * @returns {object} - The formatted object for nodemailer.
	 */
	formatForNodemailer() {
		const format = (arr) => arr.map((addr) => `${addr}`)
		return {
			to: format(this.get('to')).join(', '),
			cc: format(this.get('cc')).join(', '),
			bcc: format(this.get('bcc')).join(', '),
		}
	}

	/**
	 * @returns {string}
	 */
	toString() {
		const output = []
		this.forEach((value, key) => {
			output.push([key, value.map(String).join(', ')].join(': '))
		})
		return output.join('\n')
	}

	/**
	 * @param {string|object|Array} source
	 * @returns {Target}
	 */
	static from(source) {
		const target = new Target()
		if (typeof source === 'object') {
			if (Array.isArray(source)) {
				for (const item of source) {
					if (!item) continue
					if (typeof item === 'string') {
						target.add(Address.from(item), 'to')
					} else if (typeof item === 'object') {
						target.addObject(item)
					}
				}
			} else {
				target.addObject(source)
			}
		} else if (typeof source === 'string') {
			target.add(Address.from(source))
		}
		return target
	}
}

export default Target
