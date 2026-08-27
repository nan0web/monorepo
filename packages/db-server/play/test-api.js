/**
 * @file play/test-api.js - Integration test script for DBServer REST API
 *
 * Usage:
 *   node play/test-api.js [port]
 */
import assert from 'node:assert'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import DB from '@nan0web/db'
import DBFs from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import DBServer from '../src/DBServer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname, '../../../apps/3rdparty/industrialbank/bank/data')

async function runIntegrationTest() {
	const requestedPort = Number(process.argv[2]) || 0
	console.log(`[test-api] Starting DBServer integration test on real data at: ${dataDir}`)

	const driver = new DBFs.Driver({ root: dataDir })
	const db = new DB({ root: dataDir, driver })

	const srv = await DBServer.create({
		db,
		port: requestedPort,
		logger: new NoConsole(),
	})

	const baseUrl = `http://localhost:${srv.server.port}`

	try {
		// 1. Test /health
		console.log('Testing GET /health...')
		const healthRes = await fetch(`${baseUrl}/health`)
		assert.strictEqual(healthRes.status, 200)
		const healthJson = await healthRes.json()
		assert.strictEqual(healthJson.status, 'ok')
		console.log('✓ /health OK')

		// 2. Test /api/help
		console.log('Testing GET /api/help...')
		const helpRes = await fetch(`${baseUrl}/api/help`)
		assert.strictEqual(helpRes.status, 200)
		const helpJson = await helpRes.json()
		assert.strictEqual(helpJson.openapi, '3.0.0')
		console.log('✓ /api/help OpenAPI spec OK')

		// 3. Test GET /api/documents/api.yaml
		console.log('Testing GET /api/documents/api.yaml...')
		const docRes = await fetch(`${baseUrl}/api/documents/api.yaml`)
		assert.strictEqual(docRes.status, 200)
		const docJson = await docRes.json()
		assert.ok(docJson.title || docJson.$layout || docJson.api)
		console.log('✓ GET /api/documents/api.yaml OK (Persisted YAML loaded correctly)')

		// 4. Test GET /api/directory/.
		console.log('Testing GET /api/directory/. ...')
		const dirRes = await fetch(`${baseUrl}/api/directory/.`)
		assert.strictEqual(dirRes.status, 200)
		const dirJson = await dirRes.json()
		assert.ok(Array.isArray(dirJson))
		assert.ok(dirJson.length > 0)
		console.log(`✓ GET /api/directory/. OK (Found ${dirJson.length} entries)`)

		// 5. Test GET /api/stat/api.yaml
		console.log('Testing GET /api/stat/api.yaml...')
		const statRes = await fetch(`${baseUrl}/api/stat/api.yaml`)
		assert.strictEqual(statRes.status, 200)
		const statJson = await statRes.json()
		assert.strictEqual(statJson.isFile, true)
		console.log('✓ GET /api/stat/api.yaml OK')

		console.log('\n🎉 ALL REAL-DATA INTEGRATION TESTS PASSED SUCCESSFULLY!\n')
	} finally {
		await srv.close()
	}
}

runIntegrationTest().catch((err) => {
	console.error('\n❌ INTEGRATION TEST FAILED:', err)
	process.exit(1)
})
