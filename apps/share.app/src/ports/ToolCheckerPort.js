import { ToolChecker } from '../domain/ToolChecker.js'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Node.js Port extending ToolChecker domain ModelAsApp.
 */
export class ToolCheckerPort extends ToolChecker {
	/**
	 * Node.js implementation checking binary availability via `which`.
	 * @param {string} tool - Binary name to check.
	 * @returns {Promise<boolean>}
	 */
	static async check(tool) {
		try {
			await execAsync(`which "${tool}"`, { timeout: 5000 })
			return true
		} catch {
			return false
		}
	}
}
