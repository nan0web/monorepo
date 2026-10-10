import assert from 'node:assert'
import { describe, it } from 'node:test'
import { parseCSV, stringifyCSV, parseCSV0, stringifyCSV0 } from '../../../../../index.js'

describe('Pure CSV helpers and CSV0 Regression (v3.6.0)', () => {
	describe('parseCSV / stringifyCSV pure helpers', () => {
		it('handles delimiters, empty content, and preserves cell escaping', () => {
			assert.deepStrictEqual(parseCSV('a,b\n1,"x,y"'), [['a', 'b'], [1, 'x,y']])
			assert.deepStrictEqual(parseCSV('a\tb\n1\t2', '\t'), [['a', 'b'], [1, 2]])
			assert.deepStrictEqual(parseCSV(''), [])
			const text = stringifyCSV([{ a: 1, b: 'x,y' }])
			assert.strictEqual(text, 'a,b\n1,"x,y"')
			assert.strictEqual(stringifyCSV('raw'), 'raw')
		})

		it('strictly aligns rows with HEAD columns regardless of object key order', () => {
			const scrambled = [
				{ name: 'Alex', age: 30 },
				{ age: 25, name: 'John' },
			]
			assert.strictEqual(stringifyCSV(scrambled), 'name,age\nAlex,30\nJohn,25')
		})
	})

	describe('Commented FrontMatter (Edit CSV compatible)', () => {
		it('parses commented # --- FrontMatter block', () => {
			const src = '# ---\n# title: T\n# columns:\n#   id: number\n#   ok: boolean\n# ---\nid,ok\n1,1\n2,0'
			const r = parseCSV0(src)
			assert.strictEqual(r.meta.title, 'T')
			assert.deepStrictEqual(r.rows, [
				{ id: 1, ok: true },
				{ id: 2, ok: false },
			])
		})

		it('roundtrips commented FrontMatter with stringifyCSV0', () => {
			const out = stringifyCSV0([{ id: 1 }], { columns: { id: 'number' }, title: 'U', commented: true })
			assert.ok(out.startsWith('# ---\n# '))
			const back = parseCSV0(out)
			assert.strictEqual(back.meta.title, 'U')
			assert.deepStrictEqual(back.rows, [{ id: 1 }])
		})
	})

	describe('Plain CSV fallback', () => {
		it('plain CSV without FrontMatter yields parsed rows', () => {
			const r = parseCSV0('id,name\n1,Alex\n2,John')
			assert.deepStrictEqual(r.rows, [
				{ id: 1, name: 'Alex' },
				{ id: 2, name: 'John' },
			])
		})
	})

	describe('head: dictionary and head: false', () => {
		it('canonizes head: dictionary and supports commented # --- form', () => {
			const src = `# ---\n# head:\n#   id: number\n#   active: boolean\n# ---\nid,active\n1,1\n2,0`
			const res = parseCSV0(src)
			assert.ok(res.head)
			assert.deepStrictEqual(res.head, { id: 'number', active: 'boolean' })
			assert.deepStrictEqual(res.columns, { id: 'number', active: 'boolean' })
			assert.deepStrictEqual(res.rows, [
				{ id: 1, active: true },
				{ id: 2, active: false },
			])

			const out = stringifyCSV0(res.rows, { head: { id: 'number', active: 'boolean' } })
			assert.ok(out.includes('head:'), 'Output should contain head: in FrontMatter')
			const roundtrip = parseCSV0(out)
			assert.deepStrictEqual(roundtrip.rows, res.rows)
		})

		it('handles head: false (headerless body with data only)', () => {
			const src = `---
head: false
columns:
  id: number
  name: string
---
1,Alex
2,John`
			const res = parseCSV0(src)
			assert.strictEqual(res.meta.head, false)
			assert.deepStrictEqual(res.rows, [
				{ id: 1, name: 'Alex' },
				{ id: 2, name: 'John' },
			])

			const out = stringifyCSV0(res.rows, { head: false, columns: { id: 'number', name: 'string' } })
			assert.ok(out.includes('head: false'))
			assert.ok(!out.includes('id,name\n'))
			assert.ok(out.includes('1,Alex'))
		})
	})

	describe('Formulas and Totals calculation', () => {
		it('computes row formulas and table totals with commented FrontMatter', () => {
			const src = `# ---
# head:
#   price: number
#   qty: number
#   total:
#     formula: "price * qty"
# totals:
#   subtotal: "=sum(total)"
#   vat: "=subtotal * 0.2"
#   grandTotal: "=subtotal + vat"
# ---
price,qty
10,2
15,3`
			const res = parseCSV0(src)
			assert.deepStrictEqual(res.rows, [
				{ price: 10, qty: 2, total: 20 },
				{ price: 15, qty: 3, total: 45 },
			])
			assert.ok(res.totals)
			assert.strictEqual(res.totals.subtotal, 65)
			assert.strictEqual(res.totals.vat, 13)
			assert.strictEqual(res.totals.grandTotal, 78)
		})

		it('computes formula column placed in the middle of head schema (e.g. price, total, qty)', () => {
			const src = `# ---
# head:
#   price: number
#   total:
#     formula: "price * qty"
#   qty: number
# ---
price,qty
10,2
15,3`
			const res = parseCSV0(src)
			assert.deepStrictEqual(res.rows, [
				{ price: 10, total: 20, qty: 2 },
				{ price: 15, total: 45, qty: 3 },
			])
		})
	})
})


