import test from 'node:test'
import assert from 'node:assert/strict'
import HumanName from './Name.js'

test('HumanName should parse name correctly', () => {
	const cases = [
		['Петруненко Ярослав', 'Ярослав Петруненко'],
		['Анжелiка', 'Анжеліка(Анжелiка)'],
	]
	for (const [input, expected] of cases) {
		assert.equal(String(HumanName.parse(input)), expected)
	}
})
