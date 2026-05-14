import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import HumanName from './Name.js'

describe('HumanName', () => {
	it('HumanName should parse name correctly', () => {
		const cases = [
			['Петруненко Ярослав', 'Ярослав Петруненко'],
			['Анжелiка', 'Анжеліка(Анжелiка)'],
		]
		for (const [input, expected] of cases) {
			assert.equal(String(HumanName.parse(input)), expected)
		}
	})

	it('HumanName should access name lists', () => {
		// Test that the exported constants exist and are arrays
		assert.ok(Array.isArray(HumanName.ALIASES))
		assert.ok(Array.isArray(HumanName.MEN))
		assert.ok(Array.isArray(HumanName.WOMEN))

		// Test some known values
		assert.ok(HumanName.MEN.includes('Ярослав'))
		assert.ok(HumanName.WOMEN.includes('Анжеліка'))
		assert.ok(HumanName.ALIASES.length > 0)
	})

	it('HumanName should parse with custom name lists defined as static properties', () => {
		// Create a custom class with different name lists
		class CustomHumanName extends HumanName {}
		CustomHumanName.ALIASES = [['John', ['Johnny']]]
		CustomHumanName.MEN = ['John', 'Doe']
		CustomHumanName.WOMEN = ['Jane']

		const result = CustomHumanName.parse('Doe Johnny')
		// Names are sorted based on their position in the names list
		// "John" comes before "Doe" in the custom names list
		assert.equal(String(result), 'John(Johnny) Doe')

		const resultWithoutAlias = CustomHumanName.parse('Smith Jane')
		// "Jane" comes before "Doe" in the custom names list
		assert.equal(String(resultWithoutAlias), 'Jane Smith')
	})
})
