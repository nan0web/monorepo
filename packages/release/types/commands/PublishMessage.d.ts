export class PublisBody {
	static major: {
		help: string
		defaultValue: boolean
	}
	static minor: {
		help: string
		defaultValue: boolean
	}
	static patch: {
		help: string
		defaultValue: boolean
	}
	constructor({
		major,
		minor,
		patch,
	}?: {
		major?: boolean | undefined
		minor?: boolean | undefined
		patch?: boolean | undefined
	})
	/** @type {boolean} */
	major: boolean
	/** @type {boolean} */
	minor: boolean
	/** @type {boolean} */
	patch: boolean
}
export default class PublishMessage extends Message {
	static Body: typeof PublisBody
	constructor(input?: {})
	/** @type {PublisBody} */
	body: PublisBody
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
