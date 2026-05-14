export class InitBody {
	static version: {
		help: string
		required: boolean
		placeholder: string
	}
	constructor({ version }?: { version?: string | undefined })
	/** @type {string} */
	version: string
}
export default class InitMessage extends Message {
	static Body: typeof InitBody
	constructor(input?: {})
	/** @type {InitBody} */
	body: InitBody
	/**
	 * Core implementation – mirrors the legacy `InitCommand`.
	 *
	 * @returns {AsyncGenerator<OutputMessage>}
	 */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
