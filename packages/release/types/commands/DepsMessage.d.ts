/** @typedef {import("@nan0web/co").MessageInput} MessageInput */
export class DepsBody {
	static fix: {
		help: string
		defaultValue: boolean
	}
	constructor(input?: {})
	/** @type {boolean} */
	fix: boolean
}
export default class DepsMessage extends Message {
	static Body: typeof DepsBody
	/** @param {MessageInput & { body?: Partial<DepsBody> }} [input={}] */
	constructor(
		input?:
			| (import('@nan0web/co/types/Message').MessageInput & {
					body?: Partial<DepsBody> | undefined
			  })
			| undefined,
	)
	/** @type {DepsBody} */
	body: DepsBody
	/** @returns {AsyncGenerator<OutputMessage>} */
	run(): AsyncGenerator<OutputMessage>
}
export type MessageInput = import('@nan0web/co').MessageInput
import { Message } from '@nan0web/co'
import { OutputMessage } from '@nan0web/co'
