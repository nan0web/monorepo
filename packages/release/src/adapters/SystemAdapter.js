import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createServer } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)

/**
 * SystemAdapter encapsulates OS-level side effects (IDE launch, JXA, HTTP server)
 * so domain models stay pure OLMUI and 100% testable in-memory.
 */
export class SystemAdapter {
	/**
	 * @returns {NodeJS.Platform}
	 */
	getPlatform() {
		return process.platform
	}

	/**
	 * Launch Antigravity IDE for target directory.
	 * @param {string} targetDir
	 * @param {string} [bin]
	 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
	 */
	async openIde(targetDir, bin = join(homedir(), '.local', 'bin', 'agy')) {
		const { stdout = '', stderr = '' } = await execFileAsync(bin, [targetDir])
		return { ok: true, stdout, stderr }
	}

	/**
	 * Execute JXA script via osascript on macOS.
	 * @param {string} script
	 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
	 */
	async runJxa(script) {
		const { stdout = '', stderr = '' } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', script])
		return { ok: true, stdout, stderr }
	}

	/**
	 * Start a lightweight Node.js HTTP server.
	 * @param {number} port
	 * @param {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void} handler
	 * @returns {Promise<import('node:http').Server>}
	 */
	async startHttpServer(port, handler) {
		const server = createServer(handler)
		await new Promise((resolve, reject) => {
			server.once('error', reject)
			server.listen(port, () => resolve(undefined))
		})
		return server
	}
}

export default SystemAdapter
