import { describe, it } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

describe('Release v3.0.0 - Dependency Alignment', () => {
	it('should have correct versions for @nan0web packages', async () => {
		const pkgPath = join(process.cwd(), 'package.json')
		const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))

		assert.ok(/^3\.\d+\.\d+$/.test(pkg.version), 'Version should start with 3.x')
		assert.ok(/^(\^1\.8\.0|workspace:\*)$/.test(pkg.dependencies['@nan0web/ui']), '@nan0web/ui should be ^1.8.0 or workspace:*')
		assert.ok(/^(\^2\.9\.0|workspace:\*)$/.test(pkg.dependencies['@nan0web/ui-cli']), '@nan0web/ui-cli should be ^2.9.0 or workspace:*')
	})
})
