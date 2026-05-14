import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../../../../../../package.json', import.meta.url), 'utf-8'))

describe('v1.0.4 — Fix dependencies', () => {
	it('@nan0web/db-fs is in dependencies', () => {
		assert.ok(
			pkg.dependencies && pkg.dependencies['@nan0web/db-fs'],
			'Missing @nan0web/db-fs in dependencies',
		)
	})

	it('@nan0web/db-fs version is explicit or workspace', () => {
		const ver = pkg.dependencies['@nan0web/db-fs']
		assert.ok(typeof ver === 'string' && ver.length > 0, 'Version should be explicit or workspace')
	})
})
