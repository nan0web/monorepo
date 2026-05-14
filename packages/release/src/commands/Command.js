import DBFS from '@nan0web/db-fs'
import { OutputMessage } from '@nan0web/co'
import Logger from '@nan0web/log'
import { runSpawn } from '@nan0web/test'
import { UiMessage } from '@nan0web/ui'

/** @typedef {import("@nan0web/test/types/exec/runSpawn").SpawnResult} SpawnResult */

export default class Command extends UiMessage {
	/** @type {DBFS} */
	fs
	/** @type {Logger} */
	logger

	/**
	 * @param {Partial<UiMessage> & {  }} [input={}]
	 */
	constructor(input = {}) {
		super(input)
		const { fs, logger } = UiMessage.parseBody(input, this.Body)
		this.fs = fs ?? DBFS.from({})
		this.logger = Logger.from(logger ?? {})
	}
	get Body() {
		return /** @type {typeof Command} */ (this.constructor).Body
	}
	/**
	 * Run the command.
	 * @param {string} cmd
	 * @param {string[]} [args=[]]
	 * @param {string} [fail=""]
	 * @returns {Promise<SpawnResult>}
	 * @throws {Error}
	 */
	async _run(cmd, args = [], fail = '') {
		const result = await runSpawn(cmd, args)
		if (0 !== result.code) {
			this.logger.error(result.error)
			throw new Error(fail)
		}
		return result
	}

	/** @returns {AsyncGenerator<OutputMessage>} */
	async *run() {
		throw new Error('Must be extended')
	}
}
