import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('Release v3.4.3: Model-as-App & UI-Payload Sandbox Contracts', () => {
	it('PayloadApp provides strict $db getter with localized error when missing', async () => {
		const { PayloadApp } = await import('../../../../src/domain/PayloadApp.js')
		const appNoDb = new PayloadApp({}, { t: (k, p) => `ERR_NO_DB:${p?.alias || ''}` })
		assert.throws(() => appNoDb.$db, {
			message: /ERR_NO_DB:PayloadApp/,
		})

		const mockDb = { name: 'mock' }
		const appWithDb = new PayloadApp({}, { db: mockDb })
		assert.equal(appWithDb.$db, mockDb)
	})

	it('PayloadApp lazily imports payload only during getPayloadInstance or $payload', async () => {
		const { PayloadApp } = await import('../../../../src/domain/PayloadApp.js')
		const appWithInstance = new PayloadApp({}, { payload: { version: '3.0.0' } })
		assert.equal(await appWithInstance.getPayloadInstance(), appWithInstance._.payload)
		assert.equal(appWithInstance.$payload, appWithInstance._.payload)
	})

	it('SeedModel operates purely through $db and does not access direct filesystem', async () => {
		const { SeedModel } = await import('../../../../src/domain/SeedModel.js')
		const entries = [
			{ path: '@cwd/data/departments.json' }
		]
		const mockDb = {
			Directory: { isConfig: () => false, isDirectory: () => false },
			async *browse() {
				for (const e of entries) yield e
			},
			async fetch() {
				return [{ id: 'dept-1', title: 'IT' }]
			}
		}

		const seedApp = new SeedModel({}, { db: mockDb })
		assert.equal(seedApp.$db, mockDb)
		const files = await seedApp.readSeedFiles('data')
		assert.deepEqual(files, ['@cwd/data/departments.json'])
	})

	it('play sandbox main.js exists and exposes DEMO_MAP scenarios', async () => {
		const playMain = await import('../../../../play/main.js')
		assert.ok(playMain.DEMO_MAP, 'play/main.js must export DEMO_MAP')
		assert.ok(typeof playMain.DEMO_MAP.table === 'function', 'DEMO_MAP must contain table scenario')
	})
})
