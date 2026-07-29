import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseBoundaries, applyBoundaries } from './BoundaryParser.js'

describe('BoundaryParser', () => {
	it('parses single boundary', () => {
		const raw = `
---boundary:src/test.js---
console.log('hi')
---boundary---
`
		const files = parseBoundaries(raw)
		assert.equal(Object.keys(files).length, 1)
		assert.equal(files['src/test.js'], "console.log('hi')")
	})

	it('parses multiple boundaries', () => {
		const raw = `
some text here
---boundary:file1.md---
header 1
---boundary---
and some here
---boundary:file2.txt---
content 2
---boundary---
end
`
		const files = parseBoundaries(raw)
		assert.equal(Object.keys(files).length, 2)
		assert.equal(files['file1.md'], 'header 1')
		assert.equal(files['file2.txt'], 'content 2')
	})

	it('handles snippet format with validation', () => {
		const raw = `
---boundary:src/Button.js:33:3---
line 1
line 2
line 3
---boundary---
`
		const files = parseBoundaries(raw)
		assert.equal(files['src/Button.js:33:3'], 'line 1\nline 2\nline 3')
	})

	it('throws on snippet length mismatch', () => {
		const raw = `
---boundary:src/Button.js:33:3---
only one line
---boundary---
`
		assert.throws(() => parseBoundaries(raw), /expects 3 lines, but got 1/)
	})

	it('applies full files and snippet boundaries to original files', () => {
		const original = {
			'src/Button.js': 'line A\nline B\nline C\nline D\nline E',
			'src/Label.js': 'old label content',
		}
		const raw = `
---boundary:src/Button.js:2:2---
new line B
new line C
---boundary---
---boundary:src/Label.js---
new label content
---boundary---
---boundary:src/NewFile.js---
hello world
---boundary---
`
		const parsed = parseBoundaries(raw)
		const updated = applyBoundaries(original, parsed)

		assert.equal(updated['src/Button.js'], 'line A\nnew line B\nnew line C\nline D\nline E')
		assert.equal(updated['src/Label.js'], 'new label content')
		assert.equal(updated['src/NewFile.js'], 'hello world')
	})

	it('throws on out-of-bounds startLine in applyBoundaries', () => {
		const original = {
			'src/Button.js': 'line A',
		}
		const parsed = {
			'src/Button.js:10:1': 'new line',
		}
		assert.throws(() => applyBoundaries(original, parsed), /Invalid startLine 10/)
	})

	it('returns empty object when no boundaries found', () => {
		const raw = 'Just some text without any markers'
		const files = parseBoundaries(raw)
		assert.deepEqual(files, {})
	})

	it('throws on unclosed boundary', () => {
		const raw = `
---boundary:src/test.js---
console.log('never ending...')
`
		assert.throws(() => parseBoundaries(raw), /not closed with "---boundary---"/)
	})

	it('throws on unclosed header', () => {
		const raw = `
---boundary:src/test.js
`
		assert.throws(() => parseBoundaries(raw), /header not closed/)
	})
})
