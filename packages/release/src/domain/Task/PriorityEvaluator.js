/**
 * @typedef {(task: import('./TaskModel.js').TaskModel | Record<string, any>, context?: { tasks?: any[], date?: string }) => number} PriorityEvaluatorFn
 */

/**
 * Built-in priority evaluators for table and pool task formats.
 */
export class PriorityEvaluator {
	/**
	 * Table priority: round((V * U) / C, 1).
	 * @type {PriorityEvaluatorFn}
	 */
	static table(task) {
		const m = task?.metrics || task || {}
		const v = Number(m.V ?? 0)
		const u = Number(m.U ?? 0)
		const c = Number(m.C ?? 1) || 1
		return Math.round(((v * u) / c) * 10) / 10
	}

	/**
	 * Pool priority: 100 * L + 10 * F * (1 + D) + S.
	 * @type {PriorityEvaluatorFn}
	 */
	static pool(task) {
		const m = task?.metrics || task || {}
		const l = Number(m.L ?? 0)
		const f = Number(m.F ?? 0)
		const d = Number(m.D ?? 0)
		const s = Number(m.S ?? 0)
		return 100 * l + 10 * f * (1 + d) + s
	}

	/**
	 * Evaluate task priority using custom or default evaluator.
	 * @param {import('./TaskModel.js').TaskModel | Record<string, any>} task
	 * @param {PriorityEvaluatorFn} [evaluator]
	 * @param {{ tasks?: any[], date?: string }} [context]
	 * @returns {number}
	 */
	static evaluate(task, evaluator = PriorityEvaluator.table, context = {}) {
		if (typeof evaluator !== 'function') {
			return PriorityEvaluator.table(task, context)
		}
		const value = Number(evaluator(task, context))
		return Number.isFinite(value) ? value : 0
	}
}

export default PriorityEvaluator
