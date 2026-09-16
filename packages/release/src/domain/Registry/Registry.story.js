import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { RegistryModel } from './RegistryModel.js'

describe('RegistryModel OLMUI Scenario', () => {
	it('parses releases.txt and extracts valid project paths ignoring comments and empty lines', async () => {
		const rawContent = `# Global Registry
.
# packages
packages/release

# apps
apps/release.app
apps/3rdparty/industrialbank/bank
`
		const db = new DB({
			predefined: [
				['releases.txt', rawContent],
				['package.json', { name: '@nan0web/monorepo', version: '1.0.0' }],
				['packages/release/package.json', { name: '@nan0web/release', version: '3.3.0' }],
				['apps/release.app/package.json', { name: 'release.app', version: '0.1.0' }],
				['apps/3rdparty/industrialbank/bank/package.json', { name: '@industrialbank/bank', version: '3.3.0' }],
			],
		})
		await db.connect()

		const registry = new RegistryModel({ filePath: 'releases.txt' }, { db })
		const projects = await registry.loadProjects()

		assert.equal(projects.length, 4)
		assert.deepEqual(projects[0], {
			path: '.',
			name: '@nan0web/monorepo',
			version: '1.0.0',
		})
		assert.deepEqual(projects[1], {
			path: 'packages/release',
			name: '@nan0web/release',
			version: '3.3.0',
		})
		assert.deepEqual(projects[2], {
			path: 'apps/release.app',
			name: 'release.app',
			version: '0.1.0',
		})
		assert.deepEqual(projects[3], {
			path: 'apps/3rdparty/industrialbank/bank',
			name: '@industrialbank/bank',
			version: '3.3.0',
		})
	})

	it('handles projects without package.json gracefully', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'packages/custom-pkg\n'],
			],
		})
		await db.connect()

		const registry = new RegistryModel({ filePath: 'releases.txt' }, { db })
		const projects = await registry.loadProjects()

		assert.equal(projects.length, 1)
		assert.equal(projects[0].name, 'packages/custom-pkg')
		assert.equal(projects[0].version, '0.0.0')
	})

	it('parses raw text paths via static parsePaths utility', () => {
		const text = `
# Comment 1
/path/one
  
/path/two # inline comment
# Comment 2
/path/three
`
		const paths = RegistryModel.parsePaths(text)
		assert.deepEqual(paths, ['/path/one', '/path/two', '/path/three'])
	})
})
