import { ModelAsApp, show, result } from '@nan0web/ui'
import { StatsLogger } from '../../utils/StatsLogger.js'

/**
 * StatsReportModel — Reports performance, tokens usage and efficiency index of models from local logs.
 */
export class StatsReportModel extends ModelAsApp {
	static alias = 'stats'

	static UI = {
		title: 'AI Usage & Efficiency Statistics',
		noData: 'No metrics found in stats.jsonl',
		header: 'Model ID | Provider | Calls | Tot.Tokens | Avg.Speed (t/s) | Tot.Cost ($) | Efficiency (Cost/Speed)',
		separator: '---|---|---|---|---|---|---',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const { t, statsBaseDir } = /** @type {any} */ (this._)
		const stats = await StatsLogger.readAll(statsBaseDir)

		if (stats.length === 0) {
			yield show(t(StatsReportModel.UI.noData), 'warn')
			return result({ status: 'ok', stats: [] })
		}

		// Aggregate by model
		const aggregation = new Map()

		for (const record of stats) {
			const key = `${record.modelId}@${record.provider}`
			const agg = aggregation.get(key) || {
				modelId: record.modelId,
				provider: record.provider,
				calls: 0,
				totalTokens: 0,
				speedSum: 0,
				speedCount: 0,
				costSum: 0,
			}

			agg.calls++
			agg.totalTokens += (record.inputTokens || 0) + (record.outputTokens || 0)
			if (record.speed) {
				agg.speedSum += record.speed
				agg.speedCount++
			}
			agg.costSum += record.cost || 0

			aggregation.set(key, agg)
		}

		yield show(t(StatsReportModel.UI.title), 'info')
		yield show(t(StatsReportModel.UI.header))
		yield show(t(StatsReportModel.UI.separator))

		const reportRows = []
		for (const [key, agg] of aggregation.entries()) {
			const avgSpeed = agg.speedCount > 0 ? agg.speedSum / agg.speedCount : 0
			const efficiency = avgSpeed > 0 ? agg.costSum / avgSpeed : 0

			yield show(`${agg.modelId} | ${agg.provider} | ${agg.calls} | ${agg.totalTokens} | ${avgSpeed.toFixed(2)} | $${agg.costSum.toFixed(4)} | ${efficiency.toFixed(6)}`)
			reportRows.push({
				model: key,
				calls: agg.calls,
				totalTokens: agg.totalTokens,
				avgSpeed,
				cost: agg.costSum,
				efficiency
			})
		}

		return result({ status: 'ok', stats: reportRows })
	}
}
