import fs from "node:fs/promises"
import Logger from "@nan0web/log"

/**
 * Recursively removes a directory.
 *
 * @param {string} dir
 */
export async function cleanup(dir) {
	const logger = new Logger(Logger.detectLevel(process.argv))
	try {
		await fs.rm(dir, { recursive: true, force: true })
		logger.debug(`Removed ${dir}`)
	} catch (e) {
		logger.warn(`Failed to delete ${dir}: ${e.message}`)
	}
}
