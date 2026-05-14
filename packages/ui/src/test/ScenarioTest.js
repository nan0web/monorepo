import { runGenerator } from '../core/GeneratorRunner.js'
import OutputAdapter from '../core/OutputAdapter.js'
import ScenarioAdapter from './ScenarioAdapter.js'

/**
 * Deterministic Scenario Test Runner.
 * Orchestrates a model against a predefined scenario, mocking I/O immediately.
 */
export class ScenarioTest {
	/**
	 * Runs an application model with a specific set of answers.
	 *
	 * @param {typeof import('../domain/ModelAsApp.js').ModelAsApp} AppClass
	 * @param {Array<{field: string, value: any, cancelled?: boolean}>} scenario
	 * @param {any} [appData={}]
	 * @returns {Promise<{ value: any, intents: any[], error?: Error | undefined }>}
	 */
	static async run(AppClass, scenario = [], appData = {}) {
		const inputAdapter = new ScenarioAdapter(scenario)

		const app = new AppClass(appData, { adapter: inputAdapter })

		let value
		let error

		try {
			// runGenerator executes the Intents returned by AppClass.run()
			value = await runGenerator(
				app.run(),
				{
					ask: inputAdapter.askIntent.bind(inputAdapter),
					progress: inputAdapter.progressIntent.bind(inputAdapter),
					show: inputAdapter.showIntent.bind(inputAdapter),
					render: inputAdapter.renderIntent.bind(inputAdapter),
					result: inputAdapter.resultIntent.bind(inputAdapter),
				},
				{ timeoutMs: 3333 },
			)
		} catch (err) {
			error = /** @type {Error} */ (err)
		}

		return {
			value,
			intents: inputAdapter.intents,
			error,
		}
	}
}

export default ScenarioTest
