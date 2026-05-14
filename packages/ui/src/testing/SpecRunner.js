import assert from 'node:assert/strict'
import { runGenerator } from '../core/GeneratorRunner.js'
import { ModelAsApp } from '../domain/ModelAsApp.js'
import { result, progress } from '../core/Intent.js'
import { SpecAdapter } from './SpecAdapter.js'

export class SpecRunner extends ModelAsApp {
	static stream = { help: 'The .nan0 intent stream array', default: [] }
	static registry = { help: 'A registry of Model Classes that can be mounted', default: {} }
	static UI = {
		invalidStream: 'Invalid Nan0Spec: stream must be a non-empty array',
		invalidFirstStep: 'Invalid Nan0Spec: first step missing or invalid',
		missingAppName:
			'Invalid Nan0Spec: first step must define the AppName key (e.g. ShoppingCartApp)',
		appNotFound:
			"SpecRunner: AppName '{app}' not found in provided registry. Did you forget to import it?",
		invalidGenerator: "SpecRunner: Model '{app}' does not have a valid run() async generator",
		running: 'Running {app}...',
		unhandledSteps: 'Model finished execution, but stream still has {count} unhandled steps',
	}

	/** @type {typeof import('node:assert/strict')} */
	#assert

	/**
	 * @param {Partial<SpecRunner>} [data={}]
	 * @param {Partial<import('../index.js').ModelAsAppOptions> & { assert?: typeof import('node:assert/strict') }} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, /** @type {import('../index.js').ModelAsAppOptions} */ (options))
		this.#assert = options.assert || assert
		/** @type {Array<object>} The Nan0Spec stream */
		this.stream
		/** @type {Record<string, any>} The registry of Model Classes */
		this.registry
	}

	/**
	 * Convenience method to load a .nan0 file and run a specific scenario.
	 * 
	 * 💡 Note on Expectations:
	 * You do NOT need to write manual assertions when using this method. 
	 * The `for await (const _ of runner.run()) {}` loop drives the generator,
	 * but ALL assertions are handled automatically inside `SpecAdapter.js`.
	 * 
	 * Whenever the App yields an intent (`ask`, `show`, `result`), `SpecAdapter`
	 * intercepts it and compares it strictly against the next step in the `.nan0` file.
	 * - If it matches, the test continues (and `$value` is injected back into the App).
	 * - If it mismatches, it throws an `assert.fail()` which fails the Node.js test immediately.
	 * - If the App finishes early, it throws an `unhandledSteps` error.
	 * 
	 * @param {string} fileDir The directory containing the file (e.g., import.meta.dirname)
	 * @param {string} fileName The name of the .nan0 file
	 * @param {string} scenarioName The name of the scenario to run
	 * @param {Record<string, any>} registry The Model Class registry
	 * @param {Partial<import('../index.js').ModelAsAppOptions>} [options={}] Additional runner context options
	 * @throws {Error} If the scenario is missing or if expectations fail during execution
	 */
	static async executeFile(fileDir, fileName, scenarioName, registry, options = {}) {
		const DB = (await import('@nan0web/db-fs')).DBFS
		const db = new DB({ root: fileDir })
		const doc = await db.loadDocument(fileName)
		const scenarios = Array.isArray(doc) ? doc : [doc]
		const scenario = scenarios.find((s) => s.name === scenarioName) || scenarios[0]

		if (!scenario) throw new Error(`Scenario ${scenarioName} not found in ${fileName}`)
		if (!scenario.story) throw new Error(`Scenario ${scenarioName} has no story array`)

		const runner = new this({ stream: scenario.story, registry }, options)
		for await (const _ of runner.run()) {
			// Iterate completely
		}
	}

	/**
	 * @throws {Error}
	 * @returns {AsyncGenerator<import('../core/Intent.js').Intent, import('../core/Intent.js').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		const stream = this.stream
		const registry = this.registry

		if (!Array.isArray(stream) || stream.length === 0) {
			throw new Error(t(SpecRunner.UI.invalidStream))
		}

		// Clone the stream so we can shift without destroying the original reference
		const localStream = [...stream]

		const firstStep = localStream.shift()
		if (!firstStep || typeof firstStep !== 'object') {
			throw new Error(t(SpecRunner.UI.invalidFirstStep))
		}

		const appName = Object.keys(firstStep).find((k) => !k.startsWith('$'))
		if (!appName) {
			throw new Error(t(SpecRunner.UI.missingAppName))
		}

		const ModelClass = /** @type {any} */ (registry[appName])
		if (!ModelClass) {
			throw new Error(t(SpecRunner.UI.appNotFound, { app: appName }))
		}

		const appData = firstStep[appName] || {}
		const adapter = new SpecAdapter(localStream, { assert: this.#assert })

		// Create the model, passing our own context so it inherits translations etc
		const model = new ModelClass(appData, this._)
		const generator = typeof model.run === 'function' ? model.run() : null

		if (!generator || typeof generator.next !== 'function') {
			throw new Error(t(SpecRunner.UI.invalidGenerator, { app: appName }))
		}

		try {
			yield progress(t(SpecRunner.UI.running, { app: appName }))
			await runGenerator(generator, {
				ask: adapter.ask.bind(adapter),
				show: adapter.show.bind(adapter),
				log: adapter.log.bind(adapter),
				progress: adapter.progress.bind(adapter),
				render: adapter.render.bind(adapter),
				agent: adapter.agent.bind(adapter),
				result: adapter.result.bind(adapter),
			})
		} catch (err) {
			// Bubbling assertion errors correctly
			throw err
		}

		// The stream must be fully consumed
		if (localStream.length > 0) {
			assert.fail(t(SpecRunner.UI.unhandledSteps, { count: localStream.length }))
		}

		return result({ success: true, appName })
	}

	/**
	 * Run a Nan0Spec sequence programmatically (for unit tests).
	 *
	 * @param {Array<object>} stream The .nan0 intent stream array
	 * @param {Record<string, any>} registry A registry of Model Classes that can be mounted
	 * @param {typeof import('node:assert/strict')} [asserter] Custom assertion library
	 */
	static async execute(stream, registry, asserter = assert) {
		const runner = new SpecRunner({ stream, registry }, { assert: asserter })
		const it = runner.run()
		while (true) {
			const { value, done } = await it.next()
			if (done) return value?.data
		}
	}
}

export default SpecRunner
