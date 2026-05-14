import { describe, it } from 'node:test'
import assert from 'assert/strict'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import DB from '@nan0web/db'

import AppCore from '../../../../../../src/AppCore.js'

describe('Release v1.1.3 @nan0web/core Contract', () => {
	it('should maintain AppCore inheritance stability via .from()', () => {
		class MySubApp extends AppCore {
			run() {
				return 'CustomRun'
			}
		}

		const instance = MySubApp.from({})
		assert.ok(instance instanceof MySubApp, 'from() returns subclass instance')
		assert.equal(typeof instance.run, 'function')
		assert.equal(instance.run(), 'CustomRun', 'Subclass methods remain intact')
	})

	it('should return DB class from AppCore.DB getter', () => {
		assert.equal(AppCore.DB, DB, 'AppCore.DB returns DB class instance')
	})

	it('should use workspace:* for monorepo dependencies in package.json', () => {
		const __dirname = join(fileURLToPath(import.meta.url), '..')
		const pkgPath = join(__dirname, '../../../../../../package.json')
		const pkgFile = readFileSync(pkgPath, 'utf8')
		const pkg = JSON.parse(pkgFile)

		assert.equal(pkg.dependencies['@nan0web/db'], 'workspace:*')
		assert.equal(pkg.dependencies['@nan0web/i18n'], 'workspace:*')
		assert.equal(pkg.devDependencies['@nan0web/release'], 'workspace:*')
	})
})
