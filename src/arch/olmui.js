/**
 * The architecture document of the one-logic-multiple-ui (OLMUI) pattern.
 */
import { ModelAsApp, result, progress, show } from '@nan0web/ui'

class ModelAsAppPatched extends ModelAsApp {
	static UI = {
		errorNoDb: 'Database instance ($db) is required for {alias}.',
	}
	constructor(data = {}, options = {}) {
		super(data, { db: null, plugins: [], t: () => '', ...options })
		/** @type {string} Target directory */
		this.dir
	}
}

class AnyModelAsApp extends ModelAsAppPatched {
	static UI = { ...ModelAsAppPatched.UI }
}

/**
 * User interface using models and able to create a new model with the
 * "environment options" passed from the top application to each component as $.
 */
function AnyComponent({ $, ...props }) {
	const model = new AnyModelAsApp({}, $);
	async function render() {
		for await (const intent of model.run()) {
			if (intent.$files) { /* TODO: handle files */ }
		}
	}

	return render
}
