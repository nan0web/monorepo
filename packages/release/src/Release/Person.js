import { HumanName, HumanContact, HumanGender } from '@nan0web/logos'

export default class Person {
	/** @type {HumanName} */
	name
	/** @type {HumanGender} */
	gender
	/** @type {HumanContact[]} */
	contacts
	constructor(input = {}) {
		const { name = new HumanName([]), gender = new HumanGender(-1), contacts = [] } = input
		this.name = HumanName.from(name)
		this.gender = HumanGender.from(gender)
		this.contacts = contacts.map((c) => HumanContact.from(c))
	}
	/**
	 * @param {*} input
	 * @returns {Person}
	 */
	static from(input) {
		if (input instanceof Person) return input
		return new Person(input)
	}
}
