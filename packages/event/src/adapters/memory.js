import EventContext from '../types/EventContext.js'

/**
 * Creates an in-memory event adapter
 * @returns {import("../types/index.js").EventBus}
 */
export function createMemoryAdapter() {
	const listeners = new Map()

	return {
		on(event, fn) {
			const fns = listeners.get(event) || []
			fns.push(fn)
			listeners.set(event, fns)
		},

		off(event, fn) {
			const fns = listeners.get(event)
			if (fns) {
				listeners.set(
					event,
					fns.filter((f) => f !== fn),
				)
			}
		},

		async emit(event, data = {}) {
			const ctx = data instanceof EventContext ? data : EventContext.from({ type: event, data })
			const fns = listeners.get(event) || []
			for (const fn of fns) {
				if (ctx.defaultPrevented) break
				await fn(ctx)
			}
			return ctx
		},
	}
}
