import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Checks whether external CLI tools are available and reports missing ones
 * with install instructions.
 */
export class ToolChecker {
	/**
	 * @param {string} tool - Binary name to check (e.g. 'ffmpeg', 'yt-dlp')
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

	/**
	 * Checks multiple tools and returns a list of missing ones.
	 *
	 * @param {Record<string, string>} tools - Map of binary name → install hint
	 * @returns {Promise<{ tool: string, hint: string }[]>}
	 */
	static async require(tools) {
		const missing = []
		for (const [tool, hint] of Object.entries(tools)) {
			if (!(await ToolChecker.check(tool))) {
				missing.push({ tool, hint })
			}
		}
		return missing
	}
}