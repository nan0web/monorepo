import Body from './Body.js'
import InitMessage from './InitMessage.js'
import CommitMessage from './CommitMessage.js'
import PushMessage from './PushMessage.js'
import PullMessage from './PullMessage.js'
import GlobalMessage from './GlobalMessage.js'

/**
 * GitBody – глобальні опції + `--version`
 */
export class GitBody extends Body {
	static version = {
		help: 'Show git version',
	}
	/** @type {boolean} */
	version = false

	/**
	 * @param {Partial<GitBody>} [body={}]
	 */
	constructor(body = {}) {
		super(body)
		const { version = this.version } = body
		this.version = Boolean(version)
	}
}

/**
 * GitMessage – головна команда `git`
 */
export default class GitMessage extends GlobalMessage {
	static name = 'git'
	static help = 'Distributed version control system'
	static Body = GitBody
	static Children = [InitMessage, CommitMessage, PushMessage, PullMessage]
}
