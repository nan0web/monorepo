/**
 * @file play/main.js - Start DBServer on real Industrial Bank data
 *
 * Usage:
 *   node play/main.js [port] [dataDir]
 * Example:
 *   pnpm --filter @nan0web/db-server play
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import DB from '@nan0web/db'
import DBFs from '@nan0web/db-fs'
import { LogConsole } from '@nan0web/log'
import DBServer from '../src/DBServer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultDataDir = path.resolve(__dirname, '../../../apps/3rdparty/industrialbank/bank/data')

const port = Number(process.argv[2]) || 3456
const dataDir = process.argv[3] ? path.resolve(process.argv[3]) : defaultDataDir

async function run() {
	const logger = new LogConsole()
	logger.info(`[play] Initializing DBFs provider at: ${dataDir}`)

	const driver = new DBFs.Driver({ root: dataDir })
	const db = new DB({ root: dataDir, driver })

	const server = await DBServer.create({
		db,
		port,
		host: '0.0.0.0',
		logger,
	})

	const baseUrl = `http://localhost:${server.server.port}`
	logger.info(`\n🚀 DBServer successfully running on real data!`)
	logger.info(`👉 Open OpenAPI Help / API Spec: ${baseUrl}/api/help`)
	logger.info(`👉 Health Check:                  ${baseUrl}/health`)
	logger.info(`👉 List Top Directory:            ${baseUrl}/api/directory/.`)
	logger.info(`👉 Fetch Document (e.g. uk/):     ${baseUrl}/api/documents/index.yaml\n`)
}

run().catch((err) => {
	console.error('[play] Error starting server:', err)
	process.exit(1)
})
