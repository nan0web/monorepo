#!/usr/bin/env node

import process from 'node:process'
import { parseCSV0, stringifyCSV0 } from '../src/index.js'

async function runDemo() {
	console.log('--- 📊 CSV0 Playground Demo ---')

	const sample = `---
head:
  id: number
  item: string
  price: number
  qty: number
  total:
    formula: "price * qty"
totals:
  subtotal: "=sum(total)"
---
id,item,price,qty
1,Keyboard,50,2
2,Mouse,25,4`

	console.log('\n[1] Parsing sample CSV0 with formulas and totals:\n')
	console.log(sample)

	const parsed = parseCSV0(sample)
	console.log('\n[2] Parsed Rows with computed formulas:')
	console.table(parsed.rows)

	console.log('\n[3] Computed Totals:')
	console.log(parsed.totals)

	console.log('\n[4] Re-stringifying back to CSV0 format:')
	const output = stringifyCSV0(parsed.rows, {
		head: parsed.head,
		meta: { title: 'Purchase Order' },
	})
	console.log(output)
}

runDemo().catch((err) => {
	console.error('Play demo error:', err)
	process.exit(1)
})
