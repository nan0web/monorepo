import LogInMessage from './LogIn.js'

export class RootBody {
	/** @type {boolean} */
	debug = false
	constructor(input = {}) {
		const { debug = this.debug } = input
		this.debug = Boolean(debug)
	}
}

export default class Root {
	/** @type {RootBody} */
	body

	static name = 'auth'
	static help = 'User authentication commands'
	static Children = [LogInMessage]

	constructor(input = {}) {
		// @todo add nesting the root body to children if they have the same properties.
		this.body = new RootBody(input.body ?? {})
	}
}
