/**
 * @file GeneratorRunner — Universal Adapter Loop with Timeout, Abort, and Contract Enforcement.
 *
 * This is the core engine that runs any OLMUI async generator (Model.run())
 * through a set of adapter handlers. It enforces:
 *
 * 1. Intent validation (the "Judge" — Ярослав Мудрий).
 * 2. Timeout / Abort support (Іван Сірко).
 * 3. Type-safe handler dispatch (Борис Патон).
 *
 * Every UI Adapter (CLI, Lit, Chat, Test) uses this runner
 * instead of writing its own while(true) loop.
 */

import { validateIntent, result } from './Intent.js'
import { IntentErrorModel } from './IntentErrorModel.js'

/**
 * @typedef {Object} AdapterHandlers
 * @property {(intent: import('./Intent.js').AskIntent) => Promise<import('./Intent.js').AskResponse>} ask
 *   Handler for 'ask' intents. Must return { value: ... }.
 * @property {(intent: import('./Intent.js').ProgressIntent) => void | Promise<void>} [progress]
 *   Handler for 'progress' intents. Optional (defaults to no-op).
 * @property {(intent: import('./Intent.js').ShowIntent) => void | Promise<void>} [show]
 *   Handler for 'show' intents. Optional (defaults to no-op).
 * @property {(intent: import('./Intent.js').LogIntent) => void | Promise<void>} [log]
 *   Handler for 'log' intents. Optional.
 * @property {(intent: import('./Intent.js').AgentIntent) => Promise<import('./Intent.js').AgentResponse>} [agent]
 *   Handler for 'agent' intents (AI Subagents). Optional (fallback to show if not implemented).
 * @property {(intent: import('./Intent.js').RenderIntent) => void | Promise<void>} [render]
 *   Handler for 'render' intents (visual component injection). Optional.
 * @property {(intent: import('./Intent.js').ResultIntent) => void | Promise<void>} [result]
 *   Handler for the final 'result'. Optional (defaults to no-op).
 */

/**
 * @typedef {Object} RunnerOptions
 * @property {number} [timeoutMs=0]
 *   Maximum milliseconds to wait for an adapter handler to respond.
 *   Default is 0 (disabled) — web forms may wait indefinitely.
 *   Set to a positive value for CLI/Chat adapters where hanging is unacceptable.
 * @property {AbortSignal} [signal]
 *   External AbortSignal for cancellation from outside.
 * @property {import('./Intent.js').Intent[]} [trace]
 *   Array where all executed intents will be sequentially recorded.
 *   Useful for generating 'crash reports' or Nan0Spec files on failure.
 */

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't resolve in time.
 * If ms <= 0, timeout is disabled (promise runs without time limit).
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} label - Description for the timeout error.
 * @returns {Promise<T>}
 */
function withTimeout(promise, ms, label) {
	if (!ms || ms <= 0) return promise

	return new Promise((resolve, reject) => {
		const timer = globalThis.setTimeout(() => {
			const error = IntentErrorModel.error('timeout', { label, ms })
			reject(error)
		}, ms)

		promise.then(
			(val) => {
				globalThis.clearTimeout(timer)
				resolve(val)
			},
			(err) => {
				globalThis.clearTimeout(timer)
				reject(err)
			},
		)
	})
}

/**
 * Runs an OLMUI async generator through the provided adapter handlers.
 *
 * This function is the SINGLE point of execution for all adapters.
 * It guarantees:
 * - Every yielded intent is validated (contract enforcement).
 * - Every 'ask' intent gets a response or times out (if timeoutMs > 0).
 * - External abort signals are respected.
 * - The final result is returned.
 *
 * @template T
 * @param {AsyncGenerator<import('./Intent.js').Intent, import('./Intent.js').ResultIntent, import('./Intent.js').IntentResponse>} generator
 *   The model's async generator (from Model.run()).
 * @param {AdapterHandlers} handlers
 *   Platform-specific handlers for each intent type.
 * @param {RunnerOptions} [options={}]
 *   Runner configuration (timeout, abort signal).
 * @returns {Promise<T>}
 *   The final result data from the generator.
 */
export async function runGenerator(generator, handlers, options = {}) {
	const { timeoutMs = 0, signal } = options

	// Validate that at least 'ask' handler is provided (Ярослав Мудрий's law)
	if (!handlers || typeof handlers.ask !== 'function') {
		throw IntentErrorModel.error('adapter_missing_ask')
	}

	/** @type {import('./Intent.js').IntentResponse | Error | undefined} */
	let nextVal = undefined

	while (true) {
		// ─── Check external abort signal ───
		if (signal?.aborted) {
			await generator.return(/** @type {any} */ (result(null)))
			const error = IntentErrorModel.error('aborted')
			error.name = 'AbortError'
			throw error
		}

		let nextEvent
		try {
			if (nextVal instanceof Error) {
				nextEvent = await generator.throw(nextVal)
			} else {
				nextEvent = await generator.next(nextVal)
			}
		} catch (e) {
			// If the generator didn't catch the CancelError, we gracefully abort the runner.
			const err = /** @type {Error} */ (e)
			if (err.name === 'CancelError') {
				return /** @type {T} */ (null)
			}
			throw e // Bubble up unexpected runtime errors
		}

		const { value: intent, done } = nextEvent

		// ─── Generator completed (return statement) ───
		if (done) {
			if (handlers.result) {
				await handlers.result(intent)
			}
			return intent?.data
		}

		// ─── Validate intent structure (the Judge) ───
		validateIntent(intent)

		// Record intent into the global trace if provided (for Crash Reports in Nan0Spec format).
		if (options.trace && Array.isArray(options.trace)) {
			options.trace.push(intent)
		}

		// ─── Dispatch to adapter handler ───
		switch (intent.type) {
			case 'ask': {
				const response = await withTimeout(
					handlers.ask(intent),
					timeoutMs,
					`ask("${intent.field}")`,
				)

				// Validate response shape (Борис Патон's weld check)
				if (!response || typeof response !== 'object' || !('value' in response)) {
					throw IntentErrorModel.error('ask_wrong_response', {
						field: intent.field,
						actual: JSON.stringify(response),
					})
				}

				// ─── Handle cancellation (ESC / back navigation) ───
				if (response.cancelled) {
					// Prepare CancelError to be thrown INTO the generator on the next loop iteration.
					// This allows the Model to elegantly intercept ESC using try...catch!
					const err = new Error('User cancelled interaction')
					err.name = 'CancelError'
					nextVal = err
					break
				}

				// Run field validation if schema has a validator
				if (!intent.model) {
					/** @type {import('./Intent.js').FieldSchema} */
					const fieldSchema = /** @type {import('./Intent.js').FieldSchema} */ (intent.schema)
					if (fieldSchema.validate) {
						const validationResult = fieldSchema.validate(response.value)
						if (validationResult !== true) {
							throw IntentErrorModel.error('validation_failed', {
								field: intent.field,
								reason: validationResult,
							})
						}
					}
				}

				if (options.trace && Array.isArray(options.trace)) {
					const lastTrace = options.trace[options.trace.length - 1]
					if (lastTrace && lastTrace.type === 'ask') {
						// Store raw data for Crash Reports & Nan0Spec serialization
						lastTrace.$value =
							typeof response.value === 'object' && response.value !== null
								? JSON.parse(JSON.stringify(response.value))
								: response.value
					}
				}

				// Instantiate Model-as-Schema class with collected data
				if (intent.model && typeof intent.schema === 'function') {
					const ModelClass = /** @type {new (data: any) => any} */ (intent.schema)
					response.value = new ModelClass(response.value)
				}

				nextVal = response
				break
			}

			case 'progress': {
				if (handlers.progress) {
					await handlers.progress(intent)
				}
				nextVal = undefined
				break
			}

			case 'show': {
				if (handlers.show) {
					await handlers.show(intent)
				}
				nextVal = undefined
				break
			}

			case 'log': {
				if (handlers.log) {
					await handlers.log(intent)
				}
				nextVal = undefined
				break
			}

			case 'render': {
				if (handlers.render) {
					await handlers.render(intent)
				}
				nextVal = undefined
				break
			}

			case 'agent': {
				if (handlers.agent) {
					const response = await handlers.agent(intent)

					if (options.trace && Array.isArray(options.trace)) {
						const lastTrace = options.trace[options.trace.length - 1]
						if (lastTrace && lastTrace.type === 'agent') {
							// Record agent response for full trace replayability
							/** @type {any} */ ;(lastTrace).$success = response.success
							if (response.files) /** @type {any} */ (lastTrace).$files = response.files
							if (response.message) /** @type {any} */ (lastTrace).$message = response.message
						}
					}

					nextVal = response
				} else {
					// Fallback to show if agent goes unsupported by adapter
					if (handlers.show) {
						await handlers.show({
							type: 'show',
							level: 'warn',
							message: `[Agent Task] ${intent.task}`,
						})
					}
					nextVal = { success: false, message: 'Agent not supported by current UI adapter' }
				}
				break
			}

			case 'result': {
				if (handlers.result) {
					await handlers.result(intent)
				}
				nextVal = undefined
				break
			}

			default:
				throw IntentErrorModel.error('unhandled_intent', { type: /** @type {any} */ (intent).type })
		}
	}
}
