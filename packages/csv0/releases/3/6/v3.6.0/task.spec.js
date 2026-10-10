import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Model } from '@nan0web/types'
import { parseCSV0, stringifyCSV0, CSV0Format, FormatResolver } from '../../../../src/index.js'

describe('CSV0 v3.6.0 Specification & Contracts', () => {
	describe('Canonization of head: dictionary as column schema', () => {
		it('parses head schema, maps to columns and roundtrips', () => {
			const src = `---
head:
  id: number
  active: boolean
---
id,active
1,1
2,0`
			const res = parseCSV0(src)
			assert.ok(res.head)
			assert.deepStrictEqual(res.head, { id: 'number', active: 'boolean' })
			assert.deepStrictEqual(res.columns, { id: 'number', active: 'boolean' })
			assert.deepStrictEqual(res.rows, [
				{ id: 1, active: true },
				{ id: 2, active: false },
			])

			// stringifyCSV0 should default to head in FrontMatter
			const out = stringifyCSV0(res.rows, { head: { id: 'number', active: 'boolean' } })
			assert.ok(out.includes('head:'), 'Output should contain head: in FrontMatter')
			const roundtrip = parseCSV0(out)
			assert.deepStrictEqual(roundtrip.rows, res.rows)
		})

		it('supports commented FrontMatter with head: definition (Edit CSV compatible)', () => {
			const src = `# ---
# head:
#   id: number
#   active: boolean
# ---
id,active
1,1
2,0`
			const res = parseCSV0(src)
			assert.ok(res.head)
			assert.deepStrictEqual(res.rows, [
				{ id: 1, active: true },
				{ id: 2, active: false },
			])

			const out = stringifyCSV0(res.rows, { head: { id: 'number', active: 'boolean' }, commented: true })
			assert.ok(out.startsWith('# ---\n# head:'))
			const roundtrip = parseCSV0(out)
			assert.deepStrictEqual(roundtrip.rows, res.rows)
		})
	})

	describe('Headerless body support (head: false)', () => {
		it('parses and stringifies headerless body with data only', () => {
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

		it('supports commented FrontMatter with head: false', () => {
			const src = `# ---
# head: false
# columns:
#   id: number
#   name: string
# ---
1,Alex
2,John`
			const res = parseCSV0(src)
			assert.strictEqual(res.meta.head, false)
			assert.deepStrictEqual(res.rows, [
				{ id: 1, name: 'Alex' },
				{ id: 2, name: 'John' },
			])
		})
	})

	describe('Model-as-Schema integration (model:)', () => {
		it('infers column types and hints from Model static schema', () => {
			class ProductModel extends Model {
				static sku = {
					type: 'string',
					help: 'Product SKU',
				}
				static price = {
					type: 'number',
					help: 'Unit price',
				}
				static inStock = {
					type: 'boolean',
					help: 'Availability',
				}
			}

			const resolver = new FormatResolver({
				customFormats: {
					ProductModel,
				},
			})
			const csv0 = new CSV0Format({}, { resolver })

			const src = `---
model: ProductModel
---
sku,price,inStock
A100,19.99,1
B200,5.5,0`

			const res = csv0.parse(src)
			assert.strictEqual(res.meta.model, 'ProductModel')
			assert.ok(res.head)
			assert.strictEqual(res.head.sku.type || res.head.sku, 'string')
			assert.strictEqual(res.head.price.type || res.head.price, 'number')
			assert.strictEqual(res.head.inStock.type || res.head.inStock, 'boolean')
			assert.deepStrictEqual(res.rows, [
				{ sku: 'A100', price: 19.99, inStock: true },
				{ sku: 'B200', price: 5.5, inStock: false },
			])
		})

		it('supports commented FrontMatter with model:', () => {
			class ItemModel extends Model {
				static code = { type: 'string' }
				static qty = { type: 'number' }
			}

			const resolver = new FormatResolver({
				customFormats: { ItemModel },
			})
			const csv0 = new CSV0Format({}, { resolver })

			const src = `# ---
# model: ItemModel
# ---
code,qty
X1,5`
			const res = csv0.parse(src)
			assert.deepStrictEqual(res.rows, [{ code: 'X1', qty: 5 }])
		})
	})

	describe('Formulas & Totals computation', () => {
		it('computes virtual formula columns in row data', () => {
			const src = `---
head:
  price: number
  qty: number
  total:
    formula: "price * qty"
---
price,qty
10,2
15,3`
			const res = parseCSV0(src)
			assert.deepStrictEqual(res.rows, [
				{ price: 10, qty: 2, total: 20 },
				{ price: 15, qty: 3, total: 45 },
			])
		})

		it('computes formula column placed between other columns (e.g. price, total, qty)', () => {
			const src = `---
head:
  price: number
  total:
    formula: "price * qty"
  qty: number
---
price,qty
10,2
15,3`
			const res = parseCSV0(src)
			assert.deepStrictEqual(res.rows, [
				{ price: 10, total: 20, qty: 2 },
				{ price: 15, total: 45, qty: 3 },
			])
		})

		it('computes table aggregates and totals in FrontMatter with commented # ---', () => {
			const src = `# ---
# head:
#   amount: number
# totals:
#   subtotal: "=sum(amount)"
#   vat: "=subtotal * 0.2"
#   total: "=subtotal + vat"
# ---
amount
100
200`
			const res = parseCSV0(src)
			assert.deepStrictEqual(res.rows, [
				{ amount: 100 },
				{ amount: 200 },
			])
			assert.ok(res.totals)
			assert.strictEqual(res.totals.subtotal, 300)
			assert.strictEqual(res.totals.vat, 60)
			assert.strictEqual(res.totals.total, 360)
		})
	})
})

