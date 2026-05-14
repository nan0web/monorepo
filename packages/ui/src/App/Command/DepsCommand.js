import UiMessage from '../../core/Message/Message.js'

class DepsCommandBody {
	static fix = {
		help: 'Fix dependencies',
		defaultValue: false,
	}
	constructor(input = {}) {
		const { fix = DepsCommandBody.fix.defaultValue } = input
		this.fix = !!fix
	}
}

export class DepsCommand extends UiMessage {
	static Body = DepsCommandBody
	constructor(input = {}) {
		const { body = new DepsCommandBody() } = UiMessage.parseBody(input, DepsCommandBody)
		super(input)
		/** @type {DepsCommandBody} */
		this.body = body
	}
}

export default DepsCommand
