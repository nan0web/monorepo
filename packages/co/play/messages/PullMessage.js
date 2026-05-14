import GlobalMessage from './GlobalMessage.js'
import Body from './Body.js'

/**
 * PullBody – глобальні опції + специфічні для `pull`
 */
export class PullBody extends Body {
	static remote = {
		help: 'Remote repository',
	}
	/** @type {string} */
	remote = 'origin'

	static refspec = {
		help: 'Refspec of remote branch to pull from',
	}
	/** @type {string} */
	refspec = 'HEAD'

	static directory = {
		help: 'Directory to pull into',
	}
	/** @type {string} */
	directory = '.'

	/**
	 * @param {Partial<PullBody>} [body={}]
	 */
	constructor(body = {}) {
		super(body)
		const { remote = this.remote, refspec = this.refspec, directory = this.directory } = body

		this.remote = String(remote)
		this.refspec = String(refspec)
		this.directory = String(directory)
	}
}
/**
 * PullMessage – `git pull`
 */
export default class PullMessage extends GlobalMessage {
	static Schema = PullBody
	static name = 'pull'
	static help = 'Fetch from and integrate with another repository or a local branch'

	/** @type {PullBody} */
	body

	/**
	 * @param {object} [input={}]
	 * @param {Partial<PullBody>} [input.body=new PullBody()]
	 */
	constructor(input = {}) {
		super(input)
		this.body = input.body instanceof this.Schema ? input.body : new this.Schema(input.body)
	}
}
