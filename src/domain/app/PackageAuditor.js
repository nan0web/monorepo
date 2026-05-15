import { progress, result } from '@nan0web/ui'
import {
	AuditorModel,
	CircularDependencyAuditor,
	NoTypeScriptAuditor,
	StructureAuditor,
	StackDetector,
} from '@nan0web/inspect'

export class PackageAuditor extends AuditorModel {
	static $id = '@nan0web/nan0web/PackageAuditor'

	static UI = {
		errorDbConnection: 'Cannot connect to database',
		auditing: 'Auditing package in {dir}',
		complete: 'Audit complete for {dir}',
	}

	/**
	 * @param {Partial<PackageAuditor>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const t = this._.t
		if (!this._.db) {
			return result({ error: t(PackageAuditor.UI.errorDbConnection) })
		}

		yield progress(t(PackageAuditor.UI.auditing, { dir: this.dir }))

		// 0. Stack Detection
		const detector = new StackDetector({ dir: this.dir })
		const detectorResult = await detector.run().next()
		const stack = detectorResult.value.payload.stack

		// 1. No TypeScript in src (if JS stack)
		if (['npm', 'pnpm', 'yarn'].includes(stack)) {
			const noTsAuditor = new NoTypeScriptAuditor({ dir: this.dir })
			yield* noTsAuditor.run()
		}

		// 4, 5. Structure & Playground
		const structureAuditor = new StructureAuditor({ dir: this.dir })
		yield* structureAuditor.run()

		// 8. Circular Dependencies
		const circularAuditor = new CircularDependencyAuditor({ dir: `${this.dir}/src` })
		yield* circularAuditor.run()

		yield progress(t(PackageAuditor.UI.complete, { dir: this.dir }))
		return result({}, true)
	}
}
