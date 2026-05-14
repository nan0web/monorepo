import assert from 'node:assert'
import test from 'node:test'
import { parseCSV0 } from './index.js'

test('parseCSV0 - with frontmatter', () => {
	const source = `---
title: Users Table
columns:
  - id
  - name
  - email
---
1,Yaro,Yaro@example.com
2,Bob,Bob@example.com`

	const { frontMatter, csvBody } = parseCSV0(source)
	
	assert.ok(frontMatter.includes('title: Users Table'), 'Frontmatter extracted correctly')
	assert.ok(csvBody.includes('1,Yaro,Yaro@example.com'), 'CSV body extracted correctly')
	assert.ok(!csvBody.includes('---'), 'CSV body should not include delimiters')
})

test('parseCSV0 - without frontmatter', () => {
	const source = `id,name,email\n1,Yaro,Yaro@example.com`
	
	const { frontMatter, csvBody } = parseCSV0(source)
	
	assert.strictEqual(frontMatter, '', 'Empty frontmatter expected')
	assert.strictEqual(csvBody, source, 'CSV body is identical to source')
})
