import { AppPipeline } from './pipelines/AppPipeline.js'
import { LogicPipeline } from './pipelines/LogicPipeline.js'

export class PipelineRunner {
	/**
	 * @param {any} context
	 */
	constructor(context) {
		this.context = context
		/** @type {Record<string, any>} */
		this.drivers = {
			app: AppPipeline,
			logic: LogicPipeline
		}
	}

	/**
	 * @param {string} name
	 * @param {string} task
	 * @param {any} [options={}]
	 * @returns {AsyncGenerator<any, { ok: boolean; [key: string]: any }, any>}
	 */
	async *execute(name, task, options = {}) {
		const DriverClass = this.drivers[name.toLowerCase()]
		if (!DriverClass) {
			return { ok: false, error: `Pipeline ${name} not found.` }
		}

		const driver = new DriverClass(this.context)
		try {
			return yield* driver.execute(task, options)
		} catch (/** @type {any} */ e) {
			return { ok: false, error: e.message }
		}
	}
}
