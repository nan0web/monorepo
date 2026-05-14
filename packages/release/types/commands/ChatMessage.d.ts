export class ChatBody {
	static write: {
		help: string
		defaultValue: boolean
		type: string
	}
	static user: {
		help: string
		defaultValue: string
		type: string
	}
	constructor({
		write,
		user,
		args,
	}?: {
		write?: boolean | undefined
		user?: string | undefined
		args?: any[] | undefined
	})
	/** @type {boolean} */
	write: boolean
	/** @type {string} */
	user: string
	/** @type {string[]} */
	args: string[]
}
export default class ChatMessage extends Message {
	constructor(input?: {})
	/** @type {ChatBody} */
	body: ChatBody
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
