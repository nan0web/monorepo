import { Contact } from "@nan0web/co"

class Person {
	name
	contacts
	gpgKey
	revokedKey
	constructor(input = {}) {
		const {
			name = "",
			contacts = [],
			gpgKey = null,
			revokedKey = null
		} = input
		this.name = String(name)
		this.contacts = contacts.map(c => Contact.from(c))
		this.gpgKey = gpgKey
		this.revokedKey = revokedKey
	}
	static from(input) {
		if (input instanceof Person) return input
		return new Person(input)
	}
}

export default Person
