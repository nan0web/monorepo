import names from './names.js'
import namesMen from './names.men.js'
import namesWomen from './names.women.js'

const aliasMap = new Map(names)
const namesList = [...namesMen, ...namesWomen]

function findAlias(word, variants, aliasMap) {
	for (const variant of variants) {
		if (aliasMap.has(variant)) {
			return `${variant}(${aliasMap.get(variant)})`
		}
		for (const [name, aliases] of aliasMap) {
			if (aliases.includes(variant)) {
				return `${name}(${variant})`
			}
		}
	}
	return word
}

export default class HumanName {
	/** @type {string[]} */
	value

	/**
	 * Family tree, as long as you wish.
	 * Try to start with name and then the rest of the tree.
	 * Use () to separate name and alias.
	 * @example ["Robert(Bob)", "Smith"]
	 * @example ["Robert", "Bob", "Smith"]
	 * @example ["Іван", "Іванович", "Іванов"]
	 * @param {string[]} input
	 */
	constructor(input) {
		this.value = input
	}

	/** @returns {string} */
	get firstName() {
		const name = this.value[0] ?? ''
		if (name.includes('(') && name.endsWith(')')) {
			return name.split('(')[0]
		}
		return name
	}

	/** @returns {string} */
	get alias() {
		const name = this.value[0] ?? ''
		if (name.includes('(') && name.endsWith(')')) {
			return name.slice(0, -1).split('(')[1]
		}
		return ''
	}

	/** @returns {string} */
	get lastName() {
		if (this.value.length < 2) return ''
		return this.value[this.value.length - 1] ?? ''
	}

	toString() {
		return this.value.join(' ')
	}

	/**
	 * @param {*} input
	 * @returns {HumanName}
	 */
	static from(input) {
		if (input instanceof HumanName) return input
		if ('string' === typeof input) {
			return this.parse(input)
		}
		return new HumanName(input)
	}

	/**
	 * @param {string} str
	 * @returns {HumanName}
	 */
	static parse(str) {
		const aliasMapToUse = this.ALIASES ? new Map(this.ALIASES) : aliasMap
		const namesListToUse = this.MEN && this.WOMEN ? [...this.MEN, ...this.WOMEN] : namesList

		const words = String(str).replace(/\s+/g, ' ').split(' ')
		const output = []
		for (let word of words) {
			if (word.includes('(')) {
				output.push(word)
				continue
			}
			const variants = Array.from(
				new Set([
					word,
					word.slice(0, 1).toLocaleUpperCase() + word.slice(1),
					word.slice(0, 1).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase(),
				]),
			)
			output.push(findAlias(word, variants, aliasMapToUse))
		}
		output.sort((a, b) => {
			const indexA = namesListToUse.indexOf(a.split('(')[0])
			const indexB = namesListToUse.indexOf(b.split('(')[0])
			return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
		})
		return new HumanName(output)
	}
}

HumanName.ALIASES = names
HumanName.MEN = namesMen
HumanName.WOMEN = namesWomen
