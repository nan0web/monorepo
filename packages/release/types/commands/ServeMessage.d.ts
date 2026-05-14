export default class ServeMessage extends Message {
	static Body: {
		new ({ port }?: { port?: number | undefined }): {
			/** @type {number} */
			port: number
		}
		port: {
			help: string
			defaultValue: number
			type: string
		}
	}
	constructor(input?: {})
	/** @type {ServeMessage.Body} */
	body: {
		new ({ port }?: { port?: number | undefined }): {
			/** @type {number} */
			port: number
		}
		port: {
			help: string
			defaultValue: number
			type: string
		}
	}
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
