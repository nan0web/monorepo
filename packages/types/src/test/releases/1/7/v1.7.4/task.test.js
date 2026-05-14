import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { NaN0 } from '../../../../../index.js'

describe('Release v1.7.4 Contract', () => {
	it('should correctly stringify and parse multiline strings in array objects', () => {
		const data = {
			content: [
				{
					p: 'Якщо Ви віддаєте перевагу покупкам в Інтернеті,\nспеціально для вас ми розробили картку Віртуал\nта гарантуємо максимальну безпеку розрахунків.',
				},
			],
		}

		const stringified = NaN0.stringify(data)
		assert.ok(
			stringified.includes('p: |'),
			'Multiline string inside array object should contain | marker',
		)

		const parsed = NaN0.parse(stringified)
		assert.deepStrictEqual(parsed, data, 'Parsed data should match original data')
	})
})
