import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { OSExecutor } from './OSExecutor.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('OSExecutor & StackDetector', () => {
	it('should check if file exists and read/write file', async () => {
		const executor = new OSExecutor({ cwd: __dirname })
		const tempFile = 'temp-test-file.txt'
		
		await executor.writeFile(tempFile, 'hello world')
		const exists = await executor.exists(tempFile)
		assert.ok(exists)

		const content = await executor.readFile(tempFile)
		assert.strictEqual(content, 'hello world')

		// Cleanup
		const { exec } = await import('node:child_process')
		await new Promise(resolve => exec(`rm ${path.resolve(__dirname, tempFile)}`, resolve))
	})

	it('should execute command', async () => {
		const executor = new OSExecutor({ cwd: __dirname })
		const { code, stdout } = await executor.executeCommand('echo "test-command"')
		assert.strictEqual(code, 0)
		assert.strictEqual(stdout.trim(), 'test-command')
	})

	it('should detect project type using StackDetector & DB', async () => {
		const executor = new OSExecutor()
		const mockDb = new DB({
			predefined: [
				['some-project/package.json', '{}']
			]
		})
		await mockDb.connect()

		const platform = await executor.detectPlatform(mockDb, 'some-project')
		assert.strictEqual(platform, 'js')
	})
})
