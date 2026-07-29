import assert from 'node:assert'
import { describe, it } from 'node:test'
import DB from '@nan0web/db'
import { BoundaryProtocol } from './BoundaryProtocol.js'

describe('BoundaryProtocol', () => {
	it('should decode text containing boundary blocks correctly', () => {
		const text = `
Some introduction text that is ignored by boundary decoder.

---boundary:apps/test/file1.txt---
This is the content of file 1.
It has multiple lines.
---boundary---

---boundary:apps/test/file2.js:10:5---
const foo = 'bar'
---boundary---
`
		const db = new DB()
		const protocol = new BoundaryProtocol(db)
		const decoded = protocol.decode(text)

		assert.strictEqual(decoded.isValid, true)
		assert.strictEqual(decoded.files.length, 2)

		assert.strictEqual(decoded.files[0].filename, 'apps/test/file1.txt')
		assert.strictEqual(
			decoded.files[0].content,
			'This is the content of file 1.\nIt has multiple lines.'
		)
		assert.strictEqual(decoded.files[0].startLine, undefined)
		assert.strictEqual(decoded.files[0].lineCount, undefined)

		assert.strictEqual(decoded.files[1].filename, 'apps/test/file2.js')
		assert.strictEqual(decoded.files[1].content, "const foo = 'bar'")
		assert.strictEqual(decoded.files[1].startLine, 10)
		assert.strictEqual(decoded.files[1].lineCount, 5)
	})

	it('should decode text with partially closed boundary blocks', () => {
		const text = `
---boundary:apps/test/file1.txt---
content 1
---boundary:apps/test/file2.txt---
content 2
---boundary---
`
		const db = new DB()
		const protocol = new BoundaryProtocol(db)
		const decoded = protocol.decode(text)

		assert.strictEqual(decoded.isValid, true)
		assert.strictEqual(decoded.files.length, 2)
		assert.strictEqual(decoded.files[0].filename, 'apps/test/file1.txt')
		assert.strictEqual(decoded.files[0].content, 'content 1')
		assert.strictEqual(decoded.files[1].filename, 'apps/test/file2.txt')
		assert.strictEqual(decoded.files[1].content, 'content 2')
	})

	it('should decode text when no boundary blocks are closed', () => {
		const text = `
---boundary:apps/test/file1.txt---
content 1
---boundary:apps/test/file2.txt---
content 2
`
		const db = new DB()
		const protocol = new BoundaryProtocol(db)
		const decoded = protocol.decode(text)

		assert.strictEqual(decoded.isValid, true)
		assert.strictEqual(decoded.files.length, 2)
		assert.strictEqual(decoded.files[0].filename, 'apps/test/file1.txt')
		assert.strictEqual(decoded.files[0].content, 'content 1')
		assert.strictEqual(decoded.files[1].filename, 'apps/test/file2.txt')
		assert.strictEqual(decoded.files[1].content, 'content 2')
	})

	it('should invalidate decode if markdown code blocks are present outside boundary blocks', () => {
		const text = `
---boundary:apps/test/file1.txt---
content
---boundary---

\`\`\`javascript
const wrong = 'code block'
\`\`\`
`
		const db = new DB()
		const protocol = new BoundaryProtocol(db)
		const decoded = protocol.decode(text)

		assert.strictEqual(decoded.isValid, false)
		assert.strictEqual(decoded.error, 'markdown_not_allowed_use_boundary')
	})

	it('should encode text by extracting links and appending them as boundary blocks', async () => {
		const db = new DB()

		const localDb = new DB({
			predefined: [
				['apps/test/file1.txt', 'file1 content'],
				['apps/test/file2.txt', 'file2 content'],
			],
		})

		const dataDb = new DB({
			predefined: [
				[
					'_/langs.nan0',
					[
						{ title: 'English', locale: 'en' },
						{ title: 'Ukrainian', locale: 'uk' },
					],
				],
				['en/workflows/test-wf.md', 'workflow text'],
				['uk/workflows/test-wf.md', 'workflow текст'],
			],
		})

		db.mount('', localDb)
		db.mount('@data', dataDb)
		await db.connect()
		await localDb.connect()
		await dataDb.connect()

		const protocol = new BoundaryProtocol(db)
		const sourceText = `
# Task
- [](apps/test/file1.txt)
- [workflow](@workflows/test-wf.md)
`
		const encoded = await protocol.encode(sourceText)

		// The original text remains unchanged at the top
		assert.ok(
			encoded.startsWith('\n# Task\n- [](apps/test/file1.txt)\n- [workflow](@workflows/test-wf.md)')
		)

		// The boundary blocks are appended at the bottom
		assert.ok(encoded.includes('---boundary:apps/test/file1.txt---'))
		assert.ok(encoded.includes('file1 content'))
		assert.ok(encoded.includes('---boundary:@data/uk/workflows/test-wf.md---'))
		assert.ok(encoded.includes('workflow текст'))
	})

	it('should resolve workflows based on locale and fallback to en if localized does not exist', async () => {
		const db = new DB()

		const dataDb = new DB({
			predefined: [
				['en/workflows/test-wf.md', 'workflow text'],
				['uk/workflows/test-wf.md', 'workflow текст'],
			],
		})

		db.mount('@data', dataDb)
		await db.connect()
		await dataDb.connect()

		// 1. UK locale
		const protocolUk = new BoundaryProtocol(db, 'uk')
		const encodedUk = await protocolUk.encode('[](@workflows/test-wf.md)')
		assert.ok(encodedUk.includes('---boundary:@data/uk/workflows/test-wf.md---'))
		assert.ok(encodedUk.includes('workflow текст'))

		// 2. EN locale
		const protocolEn = new BoundaryProtocol(db, 'en')
		const encodedEn = await protocolEn.encode('[](@workflows/test-wf.md)')
		assert.ok(encodedEn.includes('---boundary:@data/en/workflows/test-wf.md---'))
		assert.ok(encodedEn.includes('workflow text'))

		// 3. Fallback locale (e.g. 'fr' should fallback to 'en')
		const protocolFr = new BoundaryProtocol(db, 'fr')
		const encodedFr = await protocolFr.encode('[](@workflows/test-wf.md)')
		assert.ok(encodedFr.includes('---boundary:@data/en/workflows/test-wf.md---'))
		assert.ok(encodedFr.includes('workflow text'))
	})

	it('should resolve wildcards using db.readDir in resolvePaths', async () => {
		const db = new DB({
			predefined: [
				['src/App.js', 'app code'],
				['src/utils/Helper.js', 'helper code'],
				['src/utils/Helper.test.js', 'helper test code'],
			],
		})
		await db.connect()

		const protocol = new BoundaryProtocol(db)

		// 1. Directory wildcard ending with **
		const paths1 = await protocol.resolvePaths('src/**')
		assert.strictEqual(paths1.length, 3)
		assert.deepEqual(
			paths1.map((p) => p.path).sort(),
			['src/App.js', 'src/utils/Helper.js', 'src/utils/Helper.test.js'].sort()
		)

		// 2. Wildcard matching specific extension
		const paths2 = await protocol.resolvePaths('src/utils/*.js')
		assert.strictEqual(paths2.length, 2)
		assert.deepEqual(
			paths2.map((p) => p.path).sort(),
			['src/utils/Helper.js', 'src/utils/Helper.test.js'].sort()
		)

		// 3. Wildcard matching a test extension
		const paths3 = await protocol.resolvePaths('src/**/*.test.js')
		assert.strictEqual(paths3.length, 1)
		assert.strictEqual(paths3[0].path, 'src/utils/Helper.test.js')
	})

	describe('validateFileContent', () => {
		it('should validate valid and invalid JSON', () => {
			assert.deepEqual(BoundaryProtocol.validateFileContent('file.json', '{"ok": true}'), { valid: true })
			const res = BoundaryProtocol.validateFileContent('file.json', 'invalid json')
			assert.strictEqual(res.valid, false)
			assert.ok(res.error)
		})

		it('should validate valid and invalid YAML', () => {
			assert.deepEqual(BoundaryProtocol.validateFileContent('file.yaml', 'foo: bar\nlist:\n  - item'), { valid: true })
			assert.deepEqual(BoundaryProtocol.validateFileContent('file.yml', 'foo: bar'), { valid: true })
			const res = BoundaryProtocol.validateFileContent('file.yaml', 'invalid: [yaml')
			assert.strictEqual(res.valid, false)
			assert.ok(res.error)
		})

		it('should validate valid and invalid JSONL', () => {
			assert.deepEqual(BoundaryProtocol.validateFileContent('file.jsonl', '{"a":1}\n{"b":2}'), { valid: true })
			const res = BoundaryProtocol.validateFileContent('file.jsonl', '{"a":1}\ninvalid')
			assert.strictEqual(res.valid, false)
			assert.ok(res.error)
		})

		it('should bypass validation for unhandled formats like JS', () => {
			assert.deepEqual(BoundaryProtocol.validateFileContent('file.js', 'any invalid text here'), { valid: true })
			assert.deepEqual(BoundaryProtocol.validateFileContent('file.txt', 'some text'), { valid: true })
		})
	})
})
