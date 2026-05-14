import { HumanName, HumanGender, HumanContact } from '@nan0web/logos'

class Person {
	/** @type {HumanName} */
	name
	/** @type {HumanGender} */
	gender
	/** @type {HumanContact[]} */
	contacts

	constructor(name) {
		this.name = new HumanName(name)
		this.gender = new HumanGender(-1)
		this.contacts = []
	}
}

class CLevelTeam {
	static name = 'C Level'
	static ceo = new Person(['Yaroslav', 'Wise'])
	static cfo = new Person(['Chingis'])
}

class UXTeam {
	static name = 'UX'
	static designer = new Person(['Taras', 'Shevchenko'])
}

class Company {
	static name = 'NaN•Web'
	static c = CLevelTeam
	static ux = UXTeam
}

export default Company
