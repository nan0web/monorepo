import GlobalMessage from './GlobalMessage.js'
import Body from './Body.js'

/**
 * CommitBody – глобальні + специфічні для `commit`
 */
export class CommitBody extends Body {
	static all = {
		help: 'Add all changes to commit',
	}
	/** @type {boolean} */
	all = false

	static message = {
		help: 'Commit message (note)',
	}
	/** @type {string} */
	message = ''

	static paths = {
		help: 'Files/directories to commit (space separated)',
	}
	/** @type {string} */
	paths = '.'

	/**
	 * @param {Partial<CommitBody>} [body={}]
	 */
	constructor(body = {}) {
		super(body)
		const { all = this.all, message = this.message, paths = this.paths } = body

		this.all = Boolean(all)
		this.message = String(message)
		this.paths = String(paths)
	}
}

/**
 * CommitMessage – `git commit`
 * @property {CommitBody} body
 */
export default class CommitMessage extends GlobalMessage {
	static Body = CommitBody
	static name = 'commit'
	static help = 'Record changes to the repository'

	/** @type {CommitBody} */
	body

	/**
	 * @param {object} [input={}]
	 * @param {Partial<CommitBody>} [input.body=new CommitBody()]
	 */
	constructor(input = {}) {
		super(input)
		this.body = input.body instanceof this.Body ? input.body : new this.Body(input.body)
	}
}
