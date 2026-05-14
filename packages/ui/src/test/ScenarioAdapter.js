import InputAdapter from '../core/InputAdapter.js'

/**
 * Deterministic Scenario Adapter for OLMUI Testing.
 * 
 * Drives the Model generator through a predefined script of responses,
 * enabling millisecond-fast verification of complex business logic.
 */
export default class ScenarioAdapter extends InputAdapter {
	/**
	 * @param {Array<{field: string, value: any, cancelled?: boolean}>} [scenario=[]]
	 */
	constructor(scenario = []) {
		super()
		this.scenario = scenario
		this.intents = [] // Recorded intents for verification
		this.console = {
			info: () => {},
			warn: () => {},
			error: () => {},
			debug: () => {},
			log: () => {},
		}
	}

	/**
	 * @param {import('../core/Intent.js').AskIntent} intent
	 * @returns {Promise<import('../core/Intent.js').AskResponse>}
	 */
	async askIntent(intent) {
		this.intents.push(intent)
		const match = this.scenario.find((s) => s.field === intent.field)
		if (match) {
			return { value: match.value, cancelled: !!match.cancelled }
		}
		// If no specific match, try to use the first available answer or default
		return { value: null, cancelled: false }
	}

	/** @param {import('../core/Intent.js').ProgressIntent} intent */
	async progressIntent(intent) {
		this.intents.push(intent)
	}

	/** @param {import('../core/Intent.js').ShowIntent} intent */
	async showIntent(intent) {
		this.intents.push(intent)
	}

	/** @param {import('../core/Intent.js').RenderIntent} intent */
	async renderIntent(intent) {
		this.intents.push(intent)
	}

	/** @param {import('../core/Intent.js').ResultIntent} intent */
	async resultIntent(intent) {
		this.intents.push(intent)
	}
}
