import GlobalMessage from './GlobalMessage.js'
import Body from './Body.js'

/**
 * InitBody – специфічні поля для `git init`
 */
export class InitBody extends Body {
	static template = {
		help: 'Template to use for initialization',
	}
	/** @type {string} */
	template = 'default'

	static path = {
		help: 'Path where to create repository',
	}
	/** @type {string} */
	path = '.'

	/**
	 * @param {Partial<InitBody>} [body={}]
	 */
	constructor(body = {}) {
		super(body)
		const { template = this.template, path = this.path } = body

		this.template = String(template)
		this.path = String(path)
	}
}

/**
 * InitMessage – представлення `git init`
 */
export default class InitMessage extends GlobalMessage {
	static Body = InitBody
	static name = 'init'
	static help = 'Initialize a new Git repository'

	/** @type {InitBody} */
	body

	/**
	 * @param {object} [input]
	 * @param {InitBody} [input.body=new InitBody()]
	 */
	constructor(input = {}) {
		super(input)
		this.body = new this.Body(input.body ?? {})
	}
}
