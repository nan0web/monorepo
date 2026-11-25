import { ModelAsApp, show, result } from '@nan0web/ui'
import { FractalContactBookModel } from './FractalContactBookModel.js'
import { ChatRepoModel, resolveChatShardUri } from './ChatRepoModel.js'
import { CrystallizeModel } from './CrystallizeModel.js'
import { PeerGitSyncModel } from './PeerGitSyncModel.js'

/**
 * Resolves target repository URI from explicit repo or chatId prefix sharding.
 * @param {string} repo
 * @param {string} chatId
 * @returns {string}
 */
function resolveTargetRepo(repo, chatId) {
	if (repo) return repo
	if (chatId) return resolveChatShardUri(chatId)
	return resolveChatShardUri('default')
}

/**
 * Subcommand: Register a contact in a 7iOS we/ circle.
 */
export class InitCommand extends ModelAsApp {
	static alias = 'init'
	static UI = {
		initialized: 'Initialized contact {$soulId} in circle {$circle}',
		bootstrapped: 'Day 1 tree: {$count} files ({$mode})',
	}
	static author = { help: 'Contact soulId', default: '' }
	static circle = { help: '7iOS circle', default: '7i' }
	static bootstrap = { help: 'Bootstrap Day 1 tree from tour/01', default: false }
	static tourDir = { help: 'Tour template directory', default: 'docs/uk/tour/01' }
	static dryRun = { help: 'Simulate initialization without writing files', default: false }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Contact soulId */ this.author
		/** @type {string} 7iOS circle */ this.circle
		/** @type {boolean} Bootstrap Day 1 tree */ this.bootstrap
		/** @type {string} Tour template directory */ this.tourDir
		/** @type {boolean} Dry run mode */ this.dryRun
	}

	async *run() {
		const book = new FractalContactBookModel({}, { db: this.$db })
		if (this.bootstrap || !this.author) {
			const summary = await book.bootstrapDayOneTree({
				tourDir: this.tourDir,
				dryRun: Boolean(this.dryRun),
			})
			const mode = summary.dryRun ? 'dry-run' : 'created'
			yield show(this._.t(InitCommand.UI.bootstrapped, { count: summary.created.length, mode }), 'success')
			return result({ ok: true, ...summary })
		}
		const contact = await book.addContact({
			soulId: this.author,
			circle: this.circle,
			name: this.author,
			dryRun: Boolean(this.dryRun),
		})
		yield show(this._.t(InitCommand.UI.initialized, contact), 'success')
		return result({ ok: true, dryRun: Boolean(this.dryRun), contact })
	}
}

/**
 * Subcommand: Send a message to a sharded chat repository.
 */
export class SendCommand extends ModelAsApp {
	static alias = 'send'
	static UI = { sent: 'Message saved: {$uri}' }
	static repo = { help: 'Explicit repository URI', default: '' }
	static chatId = { help: 'Chat ID for prefix sharding', default: '' }
	static author = { help: 'Author soulId', default: '' }
	static text = { help: 'Message text', default: '' }
	static timestamp = { help: 'ISO timestamp', default: '' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Explicit repository URI */ this.repo
		/** @type {string} Chat ID for prefix sharding */ this.chatId
		/** @type {string} Author soulId */ this.author
		/** @type {string} Message text */ this.text
		/** @type {string} ISO timestamp */ this.timestamp
	}

	async *run() {
		const targetRepo = resolveTargetRepo(this.repo, this.chatId)
		const opts = { db: this.$db }
		const chat = new ChatRepoModel({ repo: targetRepo }, opts)
		const msg = await chat.sendMessage({
			author: this.author,
			text: this.text,
			timestamp: this.timestamp || new Date().toISOString(),
		})
		const sync = new PeerGitSyncModel({ repo: targetRepo }, opts)
		await sync.recordPeerCommit({ soulId: this.author, messageUri: msg.uri })
		yield show(this._.t(SendCommand.UI.sent, { uri: msg.uri }), 'success')
		return result({ ok: true, message: msg })
	}
}

/**
 * Subcommand: View messages for a given date.
 */
export class ViewCommand extends ModelAsApp {
	static alias = 'view'
	static repo = { help: 'Explicit repository URI', default: '' }
	static chatId = { help: 'Chat ID for prefix sharding', default: '' }
	static date = { help: 'Date YYYY-MM-DD', default: '' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Explicit repository URI */ this.repo
		/** @type {string} Chat ID for prefix sharding */ this.chatId
		/** @type {string} Date YYYY-MM-DD */ this.date
	}

	async *run() {
		const targetRepo = resolveTargetRepo(this.repo, this.chatId)
		const chat = new ChatRepoModel({ repo: targetRepo }, { db: this.$db })
		const dateStr = this.date || new Date().toISOString().slice(0, 10)
		const messages = await chat.listDay(dateStr)
		return result({ ok: true, date: dateStr, messages })
	}
}

/**
 * Subcommand: Crystallize a chat message into a document or todo.md.
 */
export class CrystallizeCommand extends ModelAsApp {
	static alias = 'crystallize'
	static UI = { crystallized: 'Crystallized into {$targetDocUri}' }
	static msgUri = { help: 'Source message URI', default: '' }
	static targetDocUri = { help: 'Target document URI', default: '' }
	static kind = { help: 'Entry kind: todo | note', default: 'todo' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Source message URI */ this.msgUri
		/** @type {string} Target document URI */ this.targetDocUri
		/** @type {string} Entry kind */ this.kind
	}

	async *run() {
		const crystallizer = new CrystallizeModel({}, { db: this.$db })
		const entry = await crystallizer.crystallize({
			msgUri: this.msgUri,
			targetDocUri: this.targetDocUri,
			kind: this.kind === 'todo' ? 'todo' : 'note',
		})
		yield show(this._.t(CrystallizeCommand.UI.crystallized, { targetDocUri: this.targetDocUri }), 'success')
		return result({ ok: true, entry })
	}
}

/**
 * Subcommand: Inspect peer branch sync state.
 */
export class SyncCommand extends ModelAsApp {
	static alias = 'sync'
	static UI = { synced: 'Sync state: {$count} peer branches' }
	static repo = { help: 'Explicit repository URI', default: '' }
	static chatId = { help: 'Chat ID for prefix sharding', default: '' }

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Explicit repository URI */ this.repo
		/** @type {string} Chat ID for prefix sharding */ this.chatId
	}

	async *run() {
		const targetRepo = resolveTargetRepo(this.repo, this.chatId)
		const sync = new PeerGitSyncModel({ repo: targetRepo }, { db: this.$db })
		const state = await sync.getSyncState()
		const count = Object.keys(state.branches).length
		yield show(this._.t(SyncCommand.UI.synced, { count }), 'info')
		return result({ ok: true, state })
	}
}

/**
 * Main polymorphic OLMUI application controller for @nan0web/communication.app.
 */
export class CommunicationApp extends ModelAsApp {
	static alias = 'nan0com'
	static UI = { title: '7iOS.CoCreation — Sovereign Git Messenger' }

	static command = {
		help: 'Command to execute',
		options: [InitCommand, SendCommand, ViewCommand, CrystallizeCommand, SyncCommand],
		positional: true,
		default: ViewCommand,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} Active subcommand instance */ this.command
	}

	/**
	 * Delegates execution polymorphically to the active subcommand model.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}
		return yield* this.command.run()
	}
}
