import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CheckIntent } from './CheckIntent.js'
import DB from '@nan0web/db'

describe('CheckIntent Multi-Format & Self-Healing Story Tests', () => {
	it('should validate JSON and JSONL files', async () => {
		const predefined = [
			['data/valid.json', '{"name": "test", "count": 10}\n'],
			['data/valid.jsonl', '{"line": 1}\n{"line": 2}\n'],
		]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const check = new CheckIntent(
			{ files: ['data/valid.json', 'data/valid.jsonl'] },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
			}
		)

		const events = []
		for await (const ev of check.run()) {
			events.push(ev)
		}

		const success = events.find((e) => e.type === 'show' && e.level === 'success')
		assert.ok(success, 'Should report success for valid JSON and JSONL')

		await mockFs.disconnect()
	})

	it('should fail fast on invalid JSON syntax', async () => {
		const predefined = [['data/invalid.json', '{"name": "test", broken, }\n']]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const check = new CheckIntent(
			{ files: ['data/invalid.json'] },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
			}
		)

		const events = []
		for await (const ev of check.run()) {
			events.push(ev)
		}

		const error = events.find((e) => e.type === 'show' && e.level === 'error')
		assert.ok(error, 'Should report error for broken JSON')
		assert.match(error.message, /invalid\.json/)

		await mockFs.disconnect()
	})

	it('should validate SRT and VTT subtitle timestamps and structure', async () => {
		const validSrt = `1
00:00:01,000 --> 00:00:04,000
Привіт, світе!

2
00:00:05,000 --> 00:00:08,000
Це субтитри.
`
		const predefined = [['subs/test.srt', validSrt]]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const check = new CheckIntent(
			{ files: ['subs/test.srt'] },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
			}
		)

		const events = []
		for await (const ev of check.run()) {
			events.push(ev)
		}

		const success = events.find((e) => e.type === 'show' && e.level === 'success')
		assert.ok(success, 'Should report success for valid SRT')

		await mockFs.disconnect()
	})

	it('should fail on malformed SRT subtitle file', async () => {
		const brokenSrt = `1
invalid_time_marker
Привіт!
`
		const predefined = [['subs/broken.srt', brokenSrt]]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const check = new CheckIntent(
			{ files: ['subs/broken.srt'] },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
			}
		)

		const events = []
		for await (const ev of check.run()) {
			events.push(ev)
		}

		const error = events.find((e) => e.type === 'show' && e.level === 'error')
		assert.ok(error, 'Should report error for broken SRT')
		assert.match(error.message, /broken\.srt/)

		await mockFs.disconnect()
	})

	it('should validate Markdown unclosed code blocks and frontmatter', async () => {
		const validMd = `---
title: Valid Doc
---
# Heading
\`\`\`bash
echo 1
\`\`\`
`
		const brokenMd = `# Broken Doc
\`\`\`bash
echo "unclosed code block"
`
		const predefined = [
			['docs/valid.md', validMd],
			['docs/broken.md', brokenMd],
		]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const check = new CheckIntent(
			{ files: ['docs/broken.md'] },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
			}
		)

		const events = []
		for await (const ev of check.run()) {
			events.push(ev)
		}

		const error = events.find((e) => e.type === 'show' && e.level === 'error')
		assert.ok(error, 'Should detect unclosed code block in Markdown')
		assert.match(error.message, /broken\.md/)

		await mockFs.disconnect()
	})
})
