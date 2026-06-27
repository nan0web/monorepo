import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

/**
 * StatsLogger - logs AI model performance to ~/.llimo/stats.jsonl
 */
export class StatsLogger {
	/**
	 * Get absolute path to the stats.jsonl file
	 * @param {string} [customBase]
	 * @returns {string}
	 */
	static getStatsPath(customBase) {
		const baseDir = customBase || path.join(os.homedir(), '.llimo')
		return path.join(baseDir, 'stats.jsonl')
	}

	/**
	 * Log a performance metric
	 * @param {Object} metrics
	 * @param {string} metrics.modelId
	 * @param {string} metrics.provider
	 * @param {number} metrics.inputTokens
	 * @param {number} metrics.outputTokens
	 * @param {number} metrics.speed - tokens / sec
	 * @param {number} metrics.taskDuration - seconds
	 * @param {number} metrics.cost - USD
	 * @param {string} [customBase]
	 * @returns {Promise<void>}
	 */
	static async log(metrics, customBase) {
		const filePath = this.getStatsPath(customBase)
		const dir = path.dirname(filePath)

		await fs.mkdir(dir, { recursive: true })

		const efficiency = metrics.speed > 0 ? metrics.cost / metrics.speed : 0
		const record = {
			timestamp: new Date().toISOString(),
			...metrics,
			efficiency: Number(efficiency.toFixed(6)),
		}

		const line = JSON.stringify(record) + '\n'
		await fs.appendFile(filePath, line, 'utf8')
	}

	/**
	 * Read all logged stats
	 * @param {string} [customBase]
	 * @returns {Promise<Array<Object>>}
	 */
	static async readAll(customBase) {
		const filePath = this.getStatsPath(customBase)
		try {
			const content = await fs.readFile(filePath, 'utf8')
			return content
				.split('\n')
				.filter(line => line.trim())
				.map(line => JSON.parse(line))
		} catch (err) {
			return []
		}
	}
}
