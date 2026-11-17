import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import DB from '@nan0web/db'
import { InstallApp } from '../../../../src/domain/app/InstallApp.js'

describe('Release v3.9.1: Antigravity MCP Install Fix', () => {
	it('registers antigravity at ~/.gemini/config/mcp_config.json with absolute mcp.js path', async () => {
		const db = new DB()
		db.mount('@app', new DB({ root: '/Users/test/nan.web/packages/inspect' }))
		const homedir = '/Users/test'
		const cwd = '/Users/test/project'
		await db.saveDocument(`${homedir}/.gemini/config/mcp_config.json`, { mcpServers: {} })

		const app = new InstallApp({ dir: cwd, homedir }, { db })
		const editors = await app.discoverEditors()
		const agy = editors.find((e) => e.id === 'antigravity')

		assert.ok(agy, 'antigravity editor definition should exist')
		assert.equal(agy.detected, true, 'antigravity should be detected')
		assert.equal(
			agy.configUri,
			path.resolve(homedir, '.gemini/config/mcp_config.json'),
			'antigravity configUri must point to .gemini/config/mcp_config.json'
		)

		const spec = app.getMcpServerConfig()
		assert.ok(
			path.isAbsolute(spec.args[0]),
			`MCP script path must be absolute, got: ${spec.args[0]}`
		)
		assert.ok(
			spec.args[0].endsWith('src/ui/mcp.js'),
			`MCP script path must end with src/ui/mcp.js, got: ${spec.args[0]}`
		)
	})
})
