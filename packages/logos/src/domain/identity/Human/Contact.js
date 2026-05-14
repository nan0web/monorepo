import { Contact as BaseContact } from '@nan0web/co'

class HumanContact extends BaseContact {
	/**
	 * @param {*} input
	 * @returns {HumanContact}
	 */
	static from(input) {
		if (input instanceof HumanContact) return input
		if ('string' === typeof input) {
			return new HumanContact(super.parse(input))
		}
		return new HumanContact(input)
	}
}

export default HumanContact
