import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseCSV0, stringifyCSV0 } from '../index.js'

describe('@nan0web/csv0 ProvenDoc (README.md.js)', () => {
	it('parses CSV0 with FrontMatter and columns metadata', () => {
		const raw = `---
head:
  id: number
  name: string
  active: boolean
---
id,name,active
1,Alice,1
2,Bob,0`

		const res = parseCSV0(raw)
		assert.equal(res.rows.length, 2)
		assert.equal(res.rows[0].id, 1)
		assert.equal(res.rows[0].active, true)
		assert.equal(res.rows[1].active, false)
	})

	it('stringifies data back to CSV0 format', () => {
		const rows = [{ id: 1, name: 'Alice', active: true }]
		const csv0 = stringifyCSV0(rows, { head: { id: 'number', name: 'string', active: 'boolean' } })
		assert.ok(csv0.includes('head:'))
		assert.ok(csv0.includes('1,Alice,1'))
	})
})
