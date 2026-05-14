export default class HostMessage extends Message {
	static Body: {
		new ({ port, webui }?: { port?: number | undefined; webui?: boolean | undefined }): {
			/** @type {number} */
			port: number
			/** @type {boolean} */
			webui: boolean
		}
		port: {
			help: string
			defaultValue: number
			type: string
		}
		webui: {
			help: string
			defaultValue: boolean
			type: string
		}
	}
	constructor(input?: {})
	/** @type {HostMessage.Body} */
	body: {
		new ({ port, webui }?: { port?: number | undefined; webui?: boolean | undefined }): {
			/** @type {number} */
			port: number
			/** @type {boolean} */
			webui: boolean
		}
		port: {
			help: string
			defaultValue: number
			type: string
		}
		webui: {
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
