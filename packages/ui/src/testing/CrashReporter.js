/**
 * @file CrashReporter.js — Nan0Spec serialization.
 */

/**
 * Transforms an execution trace from GeneratorRunner into a strict Nan0Spec model
 * ready to be saved as a .nan0 file for Crash Reporting and Integration Tests.
 *
 * @param {string} appName The name of the root model/app (e.g. 'ShoppingCartApp').
 * @param {object} appData The initial data provided to the app.
 * @param {import('../core/Intent.js').Intent[]} trace The array of intents executed.
 * @returns {Array<object>} The serializable Nan0Spec array.
 */
export function buildNan0SpecFromTrace(appName, appData, trace) {
	const spec = []

	// 1. Initial State
	spec.push({
		[appName]: appData ? JSON.parse(JSON.stringify(appData)) : {},
	})

	/** @type {Record<string, string>} Mapping from intent type to its primary payload field in Nan0Spec */
	const PAYLOAD_MAP = {
		ask: 'field',
		show: 'message',
		log: 'message',
		progress: 'message',
		render: 'component',
		agent: 'task'
	}

	// 2. Map trace
	for (const intent of trace) {
		if (intent.type === 'result') {
			spec.push({ result: intent.data || null })
			continue
		}

		const key = PAYLOAD_MAP[intent.type]
		if (!key) continue

		// Create the primary step { type: payload }
		const step = { [intent.type]: intent[key] }

		// Automatically include all metadata/response fields (starting with $)
		for (const [k, v] of Object.entries(intent)) {
			if (k.startsWith('$') && v !== undefined) {
				step[k] = v
			}
		}

		spec.push(step)
	}

	return spec
}
