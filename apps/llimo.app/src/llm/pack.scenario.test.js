import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { resolveAlias, loadConfig, packMarkdown } from './pack.js'
import { FileSystem } from '../utils/FileSystem.js'

// ─── 2. Unit Tests: resolveAlias ──────────────────────────────

describe('resolveAlias', () => {
	const aliases = {
		'@workflow': '../../packages/test/docs/workflows',
		'@templates': '../templates',
	}

	it('resolves known alias prefix', () => {
		const result = resolveAlias('@workflow/architecture.md', aliases)
		assert.equal(result, '../../packages/test/docs/workflows/architecture.md')
	})

	it('resolves exact alias (no trailing path)', () => {
		const result = resolveAlias('@workflow', aliases)
		assert.equal(result, '../../packages/test/docs/workflows')
	})

	it('resolves second alias', () => {
		const result = resolveAlias('@templates/system.md', aliases)
		assert.equal(result, '../templates/system.md')
	})

	it('returns path unchanged if no alias matches', () => {
		const result = resolveAlias('src/domain/Model.js', aliases)
		assert.equal(result, 'src/domain/Model.js')
	})

	it('does not resolve partial match (e.g. @workflowX)', () => {
		const result = resolveAlias('@workflowX/something.md', aliases)
		assert.equal(result, '@workflowX/something.md')
	})

	it('handles empty aliases gracefully', () => {
		const result = resolveAlias('@workflow/x.md', {})
		assert.equal(result, '@workflow/x.md')
	})
})

// ─── 3. Integration Tests: loadConfig ─────────────────────────

describe('loadConfig', () => {
	it('returns empty aliases when no .llimorc exists', async () => {
		const fs = new FileSystem({ cwd: '/tmp/nonexistent-dir-for-test' })
		const config = await loadConfig(fs)
		assert.ok(config.aliases)
		assert.equal(typeof config.aliases, 'object')
	})

	it('loads local .llimorc from current project', async () => {
		const fs = new FileSystem()
		const config = await loadConfig(fs)
		// Our project has .llimorc with @workflow alias
		assert.ok(config.aliases['@workflow'], 'Expected @workflow alias to be defined in .llimorc')
		assert.ok(
			config.aliases['@workflow'].includes('test/docs/workflows'),
			'Expected @workflow to point to test/docs/workflows'
		)
	})
})

// ─── 4. Scenario Tests: packMarkdown with aliases (Full-Cycle) ───

describe('packMarkdown OLMUI Scenario', () => {
	it('Scenario: single file via @workflow alias', async () => {
		const input = '- [check](@workflow/check.md)'
		const { text, errors } = await packMarkdown({ input })

		// Should have resolved the alias and injected the file content
		assert.ok(text.length > 100, `Expected packed text to contain file content, got ${text.length} chars`)
		assert.ok(text.includes('check'), 'Should contain the filename in the packed output')
		assert.deepStrictEqual(errors, [], 'No errors expected')
	})

	it('Scenario: glob pattern via @workflow alias', async () => {
		const input = '- [all](@workflow/check*.md)'
		const { text, errors } = await packMarkdown({ input })

		// Should match check.md and check-all.md
		assert.ok(text.includes('check.md') || text.includes('check-all.md'), 'Should pack check workflows')
		assert.deepStrictEqual(errors, [])
	})

	it('Scenario: unknown alias falls through to relative path', async () => {
		const input = '- [nonexistent](@unknown/file.md)'
		const { text, errors } = await packMarkdown({ input })

		// Should produce an error since the file does not exist
		assert.ok(errors.length > 0 || text.includes('ERROR'), 'Expected error for unresolved alias')
	})

	it('Scenario: real file without alias works unchanged', async () => {
		const input = '- [pkg](package.json)'
		const { text, errors } = await packMarkdown({ input })

		assert.ok(text.includes('"name"'), 'Should contain package.json contents')
		assert.deepStrictEqual(errors, [])
	})
})

