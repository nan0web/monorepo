import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

/**
 * FileLock - Zero-dependency atomic directory-based advisory lock.
 */
export class FileLock {
	/**
	 * Acquire lock on a file path
	 * @param {string} filePath 
	 * @param {number} [timeoutMs=5000] 
	 * @returns {Promise<() => Promise<void>>} Release function
	 */
	static async lock(filePath, timeoutMs = 5000) {
		const lockPath = filePath + '.lock'
		const startTime = Date.now()
		while (true) {
			try {
				await fs.mkdir(lockPath)
				return async () => {
					try {
						await fs.rmdir(lockPath)
					} catch {}
				}
			} catch (err) {
				if (Date.now() - startTime > timeoutMs) {
					throw new Error(`Timeout acquiring lock on: ${filePath}`)
				}
				await new Promise(r => setTimeout(r, 10 + Math.random() * 20))
			}
		}
	}
}

/**
 * StatsCollector - High-performance stats collector and aggregator for llimo runs
 */
export class StatsCollector {
	/**
	 * Resolve path to the logs directory root
	 * @param {string} [customBase]
	 * @returns {string}
	 */
	static getLogsDir(customBase) {
		if (customBase) return customBase
		return path.join(os.homedir(), '.nan0web', 'logs')
	}

	/**
	 * Append a new request statistic to stats.nan0 hierarchy
	 * @param {Record<string, any>} statData 
	 * @param {string} [customBase]
	 * @returns {Promise<void>}
	 */
	static async appendStat(statData, customBase) {
		const baseDir = this.getLogsDir(customBase)
		const timestamp = statData.timestamp || new Date().toISOString()
		const dateObj = new Date(timestamp)
		
		const yyyy = String(dateObj.getUTCFullYear())
		const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
		const dd = String(dateObj.getUTCDate()).padStart(2, '0')

		const row = {
			...statData,
			timestamp
		}
		const line = JSON.stringify(row) + '\n'

		// Target paths
		const paths = [
			path.join(baseDir, yyyy, 'stats.nan0'),
			path.join(baseDir, yyyy, mm, 'stats.nan0'),
			path.join(baseDir, yyyy, mm, dd, 'stats.nan0')
		]

		if (statData.chatId) {
			paths.push(path.join(baseDir, yyyy, mm, dd, 'chat', String(statData.chatId), 'log.nan0'))
		}

		for (const targetPath of paths) {
			const dir = path.dirname(targetPath)
			await fs.mkdir(dir, { recursive: true })
			
			// Safe append with atomic directory lock
			const release = await FileLock.lock(targetPath)
			try {
				await fs.appendFile(targetPath, line, 'utf8')
			} finally {
				await release()
			}
		}
	}

	/**
	 * Get accumulated stats for today
	 * @param {string} [customBase]
	 * @returns {Promise<{ costUsd: number, tokensInput: number, tokensOutput: number, speedTps: number }>}
	 */
	static async getTodayStats(customBase) {
		const baseDir = this.getLogsDir(customBase)
		const now = new Date()
		const yyyy = String(now.getUTCFullYear())
		const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
		const dd = String(now.getUTCDate()).padStart(2, '0')
		
		const todayLogPath = path.join(baseDir, yyyy, mm, dd, 'stats.nan0')
		
		let costUsd = 0
		let tokensInput = 0
		let tokensOutput = 0
		let speedSum = 0
		let count = 0
		
		try {
			const release = await FileLock.lock(todayLogPath)
			let content = ''
			try {
				content = await fs.readFile(todayLogPath, 'utf8')
			} finally {
				await release()
			}
			
			const lines = content.split('\n')
			for (const line of lines) {
				if (!line.trim()) continue
				try {
					const data = JSON.parse(line)
					costUsd += Number(data.costUsd || 0)
					tokensInput += Number(data.tokensInput || 0)
					tokensOutput += Number(data.tokensOutput || 0)
					if (data.speedTps) {
						speedSum += Number(data.speedTps)
						count++
					}
				} catch {}
			}
		} catch {}
		
		return {
			costUsd,
			tokensInput,
			tokensOutput,
			speedTps: count > 0 ? speedSum / count : 0
		}
	}

	/**
	 * Calculate total disk usage of the logs folder in bytes
	 * @param {string} [customBase]
	 * @returns {Promise<number>}
	 */
	static async diskSpaceUsage(customBase) {
		const baseDir = this.getLogsDir(customBase)
		
		let totalBytes = 0
		const walk = async (dir) => {
			try {
				const entries = await fs.readdir(dir, { withFileTypes: true })
				for (const entry of entries) {
					const fullPath = path.join(dir, entry.name)
					if (entry.isDirectory()) {
						if (!entry.name.endsWith('.lock')) {
							await walk(fullPath)
						}
					} else {
						const stats = await fs.stat(fullPath)
						totalBytes += stats.size
					}
				}
			} catch {}
		}
		
		await walk(baseDir)
		return totalBytes
	}

	/**
	 * Rotate logs older than maxAgeDays
	 * @param {number} maxAgeDays 
	 * @param {string} [customBase]
	 * @returns {Promise<number>} Number of deleted files
	 */
	static async rotateLogs(maxAgeDays, customBase) {
		const baseDir = this.getLogsDir(customBase)
		const now = Date.now()
		const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
		
		let deletedCount = 0
		
		const walkAndClean = async (dir) => {
			try {
				const entries = await fs.readdir(dir, { withFileTypes: true })
				for (const entry of entries) {
					const fullPath = path.join(dir, entry.name)
					if (entry.isDirectory()) {
						await walkAndClean(fullPath)
						// Try to clean empty directories
						try {
							const subEntries = await fs.readdir(fullPath)
							if (subEntries.length === 0) {
								await fs.rmdir(fullPath)
							}
						} catch {}
					} else {
						const stats = await fs.stat(fullPath)
						if (now - stats.mtimeMs > maxAgeMs) {
							await fs.unlink(fullPath)
							deletedCount++
						}
					}
				}
			} catch {}
		}

		await walkAndClean(baseDir)
		return deletedCount
	}

	/**
	 * Purge/delete all logs completely
	 * @param {string} [customBase]
	 * @returns {Promise<void>}
	 */
	static async purge(customBase) {
		const baseDir = this.getLogsDir(customBase)
		try {
			await fs.rm(baseDir, { recursive: true, force: true })
		} catch {}
	}
}
