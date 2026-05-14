import { SnapshotRunner as Runner } from '../domain/app/SnapshotRunner.js'
import DBFS from '@nan0web/db-fs'

/**
 * Legacy bridge for SnapshotRunner.
 * @deprecated Use SnapshotRunner model from domain/app
 */
export class SnapshotRunner {
	static async generateAndAudit(options) {
		/** @type {import('@nan0web/db').DB} */
		const db = options.db || new DBFS({ root: options.dataDir })
		const runner = new Runner(options, { db })
		if (options.getCategory) runner.getCategory = options.getCategory
		if (options.createModelStream) runner.createModelStream = options.createModelStream

		const gen = runner.run()
		let res = await gen.next()
		while (!res.done) {
			res = await gen.next()
		}
		return res.value
	}
}
