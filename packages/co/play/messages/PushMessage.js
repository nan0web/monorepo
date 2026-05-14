import GlobalMessage from './GlobalMessage.js'
import Body from './Body.js'

/**
 * PushBody – глобальні + специфічні поля для `git push`
 */
export class PushBody extends Body {
	static remote = {
		help: 'Remote repository to push to',
	}
	/** @type {string} */
	remote = 'origin'

	static refspec = {
		help: 'Refspec to push (branch or tag)',
	}
	/** @type {string} */
	refspec = 'HEAD'

	/**
	 * @param {Partial<PushBody>} [body={}]
	 */
	constructor(body = {}) {
		super(body)
		const { remote = this.remote, refspec = this.refspec } = body

		this.remote = String(remote)
		this.refspec = String(refspec)
	}
}
/**
 * PushMessage – `git push`
 */
export default class PushMessage extends GlobalMessage {
	static Schema = PushBody
	static name = 'push'
	static help = 'Update remote refs along with associated objects'

	/** @type {PushBody} */
	body

	/**
	 * @param {object} [input={}]
	 * @param {Partial<PushBody>} [input.body=new PushBody()]
	 */
	constructor(input = {}) {
		super(input)
		this.body = input.body instanceof this.Schema ? input.body : new this.Schema(input.body)
	}
}
