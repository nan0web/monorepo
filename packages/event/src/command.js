import event from './index.js'
import EventContext from './types/EventContext.js'

/**
 * Creates a command object with pipeline support
 * @param {string} name - Command name
 * @param {(ctx: EventContext) => Promise<void> | void} handler - Command handler
 * @returns {{on: Function, off: Function, execute: Function, bus: any}}
 */
export function createCommand(name, handler) {
	const bus = event()

	return {
		on(event, fn) {
			bus.on(event, fn)
		},

		off(event, fn) {
			bus.off(event, fn)
		},

		async execute(data) {
			const ctx = EventContext.from({
				type: 'execute',
				name,
				data,
				defaultPrevented: false,
				meta: {},
			})

			ctx.preventDefault = () => {
				ctx.defaultPrevented = true
			}

			await bus.emit('before', ctx)
			if (ctx.defaultPrevented) {
				return { ok: false, reason: 'cancelled' }
			}

			try {
				await handler(ctx)
				await bus.emit('success', ctx)
				return { ok: true, data: ctx.data }
			} catch (err) {
				const errorCtx = EventContext.from({
					...ctx,
					type: 'error',
					error: err instanceof Error ? err : new Error(String(err)),
				})

				await bus.emit('error', errorCtx)
				return {
					ok: false,
					error: errorCtx.error?.message || '',
				}
			}
		},

		bus,
	}
}
