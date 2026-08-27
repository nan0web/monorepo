import { ModelAsApp } from '@nan0web/ui'

/**
 * ToolChecker domain model (Model-as-App).
 * Platform-agnostic domain application controller for checking CLI tool availability.
 */
export class ToolChecker extends ModelAsApp {
	static alias = 'tool:check'

	/**
	 * Resolves port and checks if tool exists.
	 * @param {string} tool - Binary name to check.
	 * @param {Object} [options]
	 * @returns {Promise<boolean>}
	 */
	static async check(tool, options = {}) {
		let port = options.toolChecker || options._?.toolChecker
		if (!port) {
			const { ToolCheckerPort } = await import('../ports/ToolCheckerPort.js')
			port = ToolCheckerPort
		}
		return port.check(tool, options)
	}

	/**
	 * Checks multiple tools and returns a list of missing ones.
	 * @param {Record<string, string>} tools - Map of binary name → install hint
	 * @param {Object} [options]
	 * @returns {Promise<{ tool: string, hint: string }[]>}
	 */
	static async require(tools, options = {}) {
		const missing = []
		for (const [tool, hint] of Object.entries(tools)) {
			if (!(await this.check(tool, options))) {
				missing.push({ tool, hint })
			}
		}
		return missing
	}
}