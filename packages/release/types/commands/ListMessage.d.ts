export default class ListMessage extends Message {
	static Body: {
		new ({ json }?: { json?: boolean | undefined }): {
			/** @type {boolean} */
			json: boolean
		}
		json: {
			help: string
			defaultValue: boolean
			type: string
		}
	}
	constructor(input?: {})
	/** @type {ListMessage.Body} */
	body: {
		new ({ json }?: { json?: boolean | undefined }): {
			/** @type {boolean} */
			json: boolean
		}
		json: {
			help: string
			defaultValue: boolean
			type: string
		}
	}
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
