import { AppPipelineModel } from './pipelines/AppPipelineModel.js'
import { LogicPipelineModel } from './pipelines/LogicPipelineModel.js'
import { InspectPipelineModel } from './pipelines/InspectPipelineModel.js'

export class PipelineRunner {
	/**
	 * @param {any} context
	 */
	constructor(context) {
		this.context = context
		/** @type {Record<string, any>} */
		this.drivers = {
			app: AppPipelineModel,
			logic: LogicPipelineModel,
			inspect: InspectPipelineModel
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

		const driver = new DriverClass({ task, name, ...options }, this.context)
		try {
			return yield* driver.run()
		} catch (/** @type {any} */ e) {
			return { ok: false, error: e.message }
		}
	}
}
