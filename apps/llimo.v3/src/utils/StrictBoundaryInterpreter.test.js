import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { StrictBoundaryInterpreter } from './StrictBoundaryInterpreter.js'

describe('StrictBoundaryInterpreter', () => {
	it('should parse valid boundary blocks correctly', () => {
		const source = `
Some explanation text here.
---boundary:src/main.js---
console.log("hello");
---boundary:src/main.js---
Other notes.
---boundary:src/config.json:1:5---
{
  "key": "value"
}
---boundary---
`
		const result = StrictBoundaryInterpreter.parse(source)
		assert.ok(result.isValid)
		assert.strictEqual(result.files.length, 2)
		assert.strictEqual(result.files[0].filename, 'src/main.js')
		assert.strictEqual(result.files[0].content, 'console.log("hello");')
		assert.strictEqual(result.files[1].filename, 'src/config.json')
		assert.strictEqual(result.files[1].content, '{\n  "key": "value"\n}')
		assert.strictEqual(result.files[1].startLine, 1)
		assert.strictEqual(result.files[1].lineCount, 5)
	})

	it('should reject markdown code blocks outside boundary', () => {
		const source = `
Here is my change:
\`\`\`js
console.log("hello");
\`\`\`
`
		const result = StrictBoundaryInterpreter.parse(source)
		assert.ok(!result.isValid)
		assert.strictEqual(result.error, 'markdown_not_allowed_use_boundary')
	})

	it('should parse inline boundary markers by splitting them onto separate lines', () => {
		const source = `We need to see directory.---boundary:@ls---
---
---boundary:@validate---
data/_/langs.nan0
releases/1/0/v1.0.0/release.md
package.json
---boundary---`
		const result = StrictBoundaryInterpreter.parse(source)
		assert.ok(result.isValid)
		assert.strictEqual(result.files.length, 2)
		assert.strictEqual(result.files[0].filename, '@ls')
		assert.strictEqual(result.files[0].content, '---')
		assert.strictEqual(result.files[1].filename, '@validate')
		assert.strictEqual(result.files[1].content, 'data/_/langs.nan0\nreleases/1/0/v1.0.0/release.md\npackage.json')
	})
})
