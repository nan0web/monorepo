export class ValidateBody {
	static ignoreFailTests: {
		help: string
		defaultValue: boolean
		type: string
	}
	constructor({ ignoreFailTests }?: { ignoreFailTests?: boolean | undefined })
	/** @type {boolean} */
	ignoreFailTests: boolean
}
export default class ValidateMessage extends Message {
	static Body: typeof ValidateBody
	constructor(input?: {})
	/** @type {ValidateBody} */
	body: ValidateBody
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
