import { describe, it } from 'node:test'
import assert from 'node:assert'
import NaN0 from '../../../../../domain/NaN0.js'

describe('Release v1.4.1 Contract (NaN0 Improvements)', () => {

	it('Should correctly infer String type from static Body schema (Schema-Aware)', () => {
		class Body {
			static value = { type: String }
			constructor(input = {}) { Object.assign(this, input) }
		}
		// "123" without the schema would be a number, but here it's forced to String
		const input = 'value: 123'
		const result = NaN0.parse(input, { Body })

		assert.strictEqual(typeof result.value, 'string')
		assert.strictEqual(result.value, '123')
	})

	it('Should correctly infer itemType in arrays (Recursive Context)', () => {
		class Body {
			static tags = { type: Array, itemType: String }
			constructor(input = {}) { Object.assign(this, input) }
		}
		const input = 'tags:\n  - 7\n  - 42'
		const result = NaN0.parse(input, { Body })

		assert.deepStrictEqual(result.tags, ['7', '42'])
	})

	it('Should preserve comment order for multiple keys (Comment Order Fix)', () => {
		const str = [
			`# C1`,
			`k1: v1`,
			`# C2`,
			`k2: v2`,
			`# C3`,
			`k3: v3`,
		].join('\n')
		const ctx = { comments: [] }
		NaN0.parse(str, ctx)

		assert.deepStrictEqual(ctx.comments, [
			{ id: 'k1', text: 'C1' },
			{ id: 'k2', text: 'C2' },
			{ id: 'k3', text: 'C3' },
		])
	})

	it('Should handle complex multiline comments with indentation', () => {
		const str = [
			`# Header comment`,
			`#   Extended info about name`,
			`name: Example`,
		].join('\n')
		const ctx = { comments: [] }
		NaN0.parse(str, ctx)

		assert.strictEqual(ctx.comments[0].text, 'Header comment\nExtended info about name')
		assert.strictEqual(ctx.comments[0].id, 'name')
	})
})
