import { describe, it } from 'node:test'
import assert from 'node:assert'
import NaN0 from '../../../../../domain/NaN0.js'

describe('NaN0 v1.7.2 Release Specifications', () => {
	it('Fix A: Should parse basic Array-in-Array correctly without syntax error', () => {
		const input = `- rows:\n  -\n    - Yaro`
		const result = NaN0.parse(input)
		assert.deepStrictEqual(result, [{ rows: [['Yaro']] }])
	})

	it('Fix B: Should stringify and parse complex Table Component Snapshot (Multiline array elements)', () => {
		const snapshot = `- render:
  ui-table:
    columns:
      - Name
      - Role
    rows:
      -
        - Yaro
        - Creator
      -
        - NaN0
        - System
- result: {}`
		const expected = [
			{
				render: {
					'ui-table': {
						columns: ['Name', 'Role'],
						rows: [
							['Yaro', 'Creator'],
							['NaN0', 'System'],
						],
					},
				},
			},
			{
				result: {},
			},
		]

		const stringified = NaN0.stringify(expected)
		const reparsed = NaN0.parse(stringified)
		assert.deepStrictEqual(reparsed, expected)
		assert.deepStrictEqual(stringified, snapshot)
	})

	it('Fix C: Should serialize empty objects and arrays accurately within arrays', () => {
		const input = [[], {}]
		const stringified = NaN0.stringify(input)
		assert.strictEqual(stringified, `- []\n- {}`)

		const parsed = NaN0.parse(stringified)
		assert.deepStrictEqual(parsed, input)
	})

	it('Fix D: Should handle compound structures where an array element contains both normal keys and nested arrays', () => {
		const input = [
			{
				label: 'Root',
				children: [{ label: 'Child 1' }, { label: 'Child 2' }],
			},
		]
		const stringified = NaN0.stringify(input)
		const parsed = NaN0.parse(stringified)
		assert.deepStrictEqual(parsed, input)
	})
})
