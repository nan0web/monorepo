import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const readme = existsSync(resolve(root, 'README.md'))
	? readFileSync(resolve(root, 'README.md'), 'utf-8')
	: ''

describe('README.md — @nan0web/ui-lit', () => {
	it('README.md exists', () => {
		assert.ok(readme.length > 0, 'README.md must exist and be non-empty')
	})

	it('has package name', () => {
		assert.ok(readme.includes('@nan0web/ui-lit'), 'must reference package name')
	})

	it('has installation section', () => {
		assert.ok(
			readme.toLowerCase().includes('install') || readme.toLowerCase().includes('usage'),
			'must have install or usage section',
		)
	})

	it('has component list', () => {
		const components = ['Alert', 'Badge', 'Button', 'Input', 'Modal', 'Table', 'Tree']
		const found = components.filter((c) => readme.includes(c))
		assert.ok(found.length >= 3, `must list at least 3 components (found: ${found.join(', ')})`)
	})
})
