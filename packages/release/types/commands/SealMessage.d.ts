export default class SealMessage extends Message {
	static Body: {
		new ({ message }?: { message?: string | undefined }): {
			/** @type {string} */
			message: string
		}
		message: {
			help: string
			defaultValue: string
		}
	}
	constructor(input?: {})
	/** @type {SealMessage.Body} */
	body: {
		new ({ message }?: { message?: string | undefined }): {
			/** @type {string} */
			message: string
		}
		message: {
			help: string
			defaultValue: string
		}
	}
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
