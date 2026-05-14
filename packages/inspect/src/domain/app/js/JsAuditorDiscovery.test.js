import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { JsAuditorDiscovery } from './JsAuditorDiscovery.js'
import { AuditorModel } from '../../AuditorModel.js'
import { AuditorDiscovery } from '../Discovery.js'

describe('JsAuditorDiscovery', () => {
	it('discovers auditors from dependencies with ./inspect export', async () => {
		const db = new DB({ predefined: [
			['package.json', { 
				name: 'main-project', 
				dependencies: { '@nan0web/test-pkg': '1.0.0' } 
			}],
			['node_modules/@nan0web/test-pkg/package.json', { 
				name: '@nan0web/test-pkg',
				exports: { './inspect': './src/inspect.js' }
			}]
		] })
		await db.connect()

		const discovery = new JsAuditorDiscovery({}, { db })
		discovery.importModule = async () => ({
			TestAuditor: class extends AuditorModel {}
		})
		const results = await discovery.discover('.')
		assert.equal(results.size, 1)
	})

	it('discovers auditors from devDependencies as well', async () => {
		const db = new DB({ predefined: [
			['package.json', { 
				name: 'main-project', 
				devDependencies: { '@nan0web/dev-pkg': '1.0.0' } 
			}],
			['node_modules/@nan0web/dev-pkg/package.json', { 
				name: '@nan0web/dev-pkg',
				exports: { './inspect': './src/inspect.js' }
			}]
		] })
		await db.connect()

		const discovery = new JsAuditorDiscovery({}, { db })
		discovery.importModule = async () => ({
			TestAuditor: class extends AuditorModel {}
		})
		const results = await discovery.discover('.')
		assert.equal(results.size, 1)
	})

	it('ignores dependencies without ./inspect export', async () => {
		const db = new DB({ predefined: [
			['package.json', { 
				name: 'main-project', 
				dependencies: { 'other-pkg': '1.0.0' } 
			}],
			['node_modules/other-pkg/package.json', { 
				name: 'other-pkg'
			}]
		] })
		await db.connect()

		const discovery = new JsAuditorDiscovery({}, { db })
		const results = await discovery.discover('.')
		assert.equal(results.size, 0)
	})

	it('handles missing package.json gracefully', async () => {
		const db = new DB({ predefined: [] })
		await db.connect()

		const discovery = new JsAuditorDiscovery({}, { db })
		const results = await discovery.discover('.')
		assert.equal(results.size, 0)
	})

	it('ignores non-directory entries in node_modules', async () => {
		const db = new DB({ predefined: [
			['package.json', { 
				name: 'main-project', 
				dependencies: { 'pkg': '1.0.0' } 
			}],
			['node_modules/pkg', 'not-a-directory']
		] })
		await db.connect()

		const discovery = new JsAuditorDiscovery({}, { db })
		const results = await discovery.discover('.')
		assert.equal(results.size, 0)
	})

	it('throws ModelError if discovery fails', async () => {
		const db = new DB({ predefined: [
			['package.json', { dependencies: { '@nan0web/broken': '1.0.0' } }],
			['node_modules/@nan0web/broken/package.json', { exports: { './inspect': './src/inspect.js' } }]
		] })
		await db.connect()
		const discovery = new JsAuditorDiscovery({}, { db })
		discovery.importModule = async () => { throw new Error('Fail') }
		await assert.rejects(() => discovery.discover('.'), { name: 'ModelError' })
	})
})

describe('AuditorDiscovery (Base)', () => {
	it('returns an empty set by default', async () => {
		const discovery = new AuditorDiscovery()
		const results = await discovery.discover('.')
		assert.equal(results.size, 0)
	})
})
