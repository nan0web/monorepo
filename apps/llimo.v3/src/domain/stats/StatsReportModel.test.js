import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { StatsLogger } from '../../utils/StatsLogger.js'
import { StatsReportModel } from './StatsReportModel.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tempStatsDir = path.resolve(__dirname, 'temp_stats_dir')

async function runGenerator(gen) {
	const events = []
	while (true) {
		const { value, done } = await gen.next()
		if (value) events.push(value)
		if (done) break
	}
	return events
}

describe('StatsReportModel & StatsLogger', () => {
	it('should log metrics and report them correctly', async () => {
		// Cleanup if exists
		const { exec } = await import('node:child_process')
		await new Promise(resolve => exec(`rm -rf ${tempStatsDir}`, resolve))

		const metrics = {
			modelId: 'test-model',
			provider: 'test-provider',
			inputTokens: 100,
			outputTokens: 200,
			speed: 50,
			taskDuration: 6,
			cost: 0.003
		}

		await StatsLogger.log(metrics, tempStatsDir)

		const reportApp = new StatsReportModel({}, {
			statsBaseDir: tempStatsDir,
			t: (key) => key
		})

		const events = await runGenerator(reportApp.run())
		const resultEvent = events.find(e => e && e.type === 'result')
		
		assert.ok(resultEvent)
		assert.strictEqual(resultEvent.data.stats.length, 1)
		const stat = resultEvent.data.stats[0]
		assert.strictEqual(stat.model, 'test-model@test-provider')
		assert.strictEqual(stat.calls, 1)
		assert.strictEqual(stat.totalTokens, 300)
		assert.strictEqual(stat.avgSpeed, 50)
		assert.strictEqual(stat.cost, 0.003)
		assert.strictEqual(Number(stat.efficiency.toFixed(6)), 0.00006)

		// Cleanup
		await new Promise(resolve => exec(`rm -rf ${tempStatsDir}`, resolve))
	})
})
