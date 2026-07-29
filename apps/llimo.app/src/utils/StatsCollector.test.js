import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { StatsCollector, FileLock } from './StatsCollector.js'

describe('StatsCollector and FileLock tests', () => {
	let tempDir = ''

	before(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'llimo-stats-test-'))
	})

	after(async () => {
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch {}
	})

	it('FileLock should acquire and release lock, preventing concurrent access', async () => {
		const filePath = path.join(tempDir, 'test-file.txt')
		
		const release1 = await FileLock.lock(filePath)
		
		// Attempting to lock the same path should fail/timeout
		const startTime = Date.now()
		await assert.rejects(
			async () => {
				await FileLock.lock(filePath, 200)
			},
			/Timeout acquiring lock/
		)
		const duration = Date.now() - startTime
		assert.ok(duration >= 200, 'Should wait at least the timeout duration')

		// Release lock 1
		await release1()

		// Now we should be able to lock successfully
		const release2 = await FileLock.lock(filePath)
		await release2()
	})

	it('StatsCollector should log statistics in .nan0 JSONL format under yyyy/mm/dd paths', async () => {
		const statData = {
			chatId: 'test-session-123',
			modelId: 'gpt-oss-120b',
			provider: 'cerebras',
			tokensInput: 1500,
			tokensOutput: 300,
			durationMs: 450,
			costUsd: 0.0015,
			status: 'success'
		}

		// Fixed test timestamp
		const timestamp = '2026-05-26T12:00:00.000Z'
		await StatsCollector.appendStat({ ...statData, timestamp }, tempDir)

		const yyyy = '2026'
		const mm = '05'
		const dd = '26'

		const expectedFiles = [
			path.join(tempDir, yyyy, 'stats.nan0'),
			path.join(tempDir, yyyy, mm, 'stats.nan0'),
			path.join(tempDir, yyyy, mm, dd, 'stats.nan0'),
			path.join(tempDir, yyyy, mm, dd, 'chat', statData.chatId, 'log.nan0')
		]

		for (const file of expectedFiles) {
			const exists = await fs.access(file).then(() => true).catch(() => false)
			assert.ok(exists, `Expected file to exist: ${file}`)

			const content = await fs.readFile(file, 'utf8')
			const loadedData = JSON.parse(content.trim())
			assert.equal(loadedData.chatId, statData.chatId)
			assert.equal(loadedData.modelId, statData.modelId)
			assert.equal(loadedData.timestamp, timestamp)
		}
	})

	it('StatsCollector should retrieve today\'s accumulated stats', async () => {
		const todayStat = {
			chatId: 'today-session-999',
			modelId: 'gpt-oss-120b',
			provider: 'cerebras',
			tokensInput: 100,
			tokensOutput: 50,
			durationMs: 200,
			costUsd: 0.0005,
			speedTps: 250,
			status: 'success'
		}
		
		await StatsCollector.appendStat(todayStat, tempDir)
		
		const todayResult = await StatsCollector.getTodayStats(tempDir)
		assert.ok(todayResult.costUsd >= 0.0005, 'Should accumulate cost')
		assert.ok(todayResult.tokensInput >= 100, 'Should accumulate input tokens')
		assert.ok(todayResult.tokensOutput >= 50, 'Should accumulate output tokens')
		assert.ok(todayResult.speedTps > 0, 'Should average speed')
	})

	it('StatsCollector should calculate total disk usage correctly', async () => {
		const usage = await StatsCollector.diskSpaceUsage(tempDir)
		assert.ok(usage > 0, 'Total bytes should be greater than zero')
	})

	it('StatsCollector should clean up old logs via rotateLogs', async () => {
		const oldFilePath = path.join(tempDir, '2025', 'stats.nan0')
		await fs.mkdir(path.dirname(oldFilePath), { recursive: true })
		await fs.writeFile(oldFilePath, '{"old":true}\n')

		// Artificially change modification time to 10 days ago
		const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000
		await fs.utimes(oldFilePath, new Date(tenDaysAgo), new Date(tenDaysAgo))

		// Rotate with age limit of 5 days
		const deleted = await StatsCollector.rotateLogs(5, tempDir)
		assert.equal(deleted, 1, 'Should have deleted exactly 1 old file')

		const exists = await fs.access(oldFilePath).then(() => true).catch(() => false)
		assert.ok(!exists, 'Old file should be deleted')
	})

	it('StatsCollector should purge all stats correctly', async () => {
		await StatsCollector.purge(tempDir)
		const exists = await fs.access(tempDir).then(() => true).catch(() => false)
		assert.ok(!exists, 'Logs base directory should be deleted after purge')
	})
})
