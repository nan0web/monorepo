import { ModelError } from '@nan0web/types'
import { ModelAsApp } from '@nan0web/ui'

/**
 * Formats soulId into a branch-safe slug.
 * @param {string} soulId
 * @returns {string}
 */
function slugifySoul(soulId) {
	return String(soulId || 'anon')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/**
 * Conflict-free peer branch synchronization model (refs/heads/peers/<soulId>).
 */
export class PeerGitSyncModel extends ModelAsApp {
	static BATCH_MODES = ['realtime', 'debounce', 'manual-close']
	static MERGE_POLICIES = ['auto-ort', 'pr-in-chat', 'owner-only']

	static repo = {
		help: 'Repository base URI',
		default: 'we/7i/default',
	}

	static batchMode = {
		help: 'Commit batching mode: realtime | debounce | manual-close',
		default: 'realtime',
	}

	static mergePolicy = {
		help: 'Document merge policy: auto-ort | pr-in-chat | owner-only',
		default: 'auto-ort',
	}

	/**
	 * @param {Partial<PeerGitSyncModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Repository base URI */ this.repo
		/** @type {string} Commit batching mode */ this.batchMode
		/** @type {string} Document merge policy */ this.mergePolicy
	}

	/**
	 * Records a peer message commit into refs/heads/peers/<soulId> without conflicts.
	 * @param {{ soulId: string, messageUri: string }} input
	 * @returns {Promise<{ branch: string, messageUri: string }>}
	 */
	async recordPeerCommit(input) {
		const { soulId, messageUri } = input || {}
		if (!soulId || !messageUri) {
			throw new ModelError({ sync: 'soulId and messageUri are required' })
		}
		if (!PeerGitSyncModel.BATCH_MODES.includes(this.batchMode)) {
			throw new ModelError({ batchMode: `Invalid batchMode: ${this.batchMode}` })
		}
		const branch = `refs/heads/peers/${slugifySoul(soulId)}`
		const stateUri = this.$db.normalize(this.repo, '.sync-state')
		const state = (await this.$db.loadDocument(stateUri, null)) || { branches: {} }
		if (!state.branches[branch]) {
			state.branches[branch] = []
		}
		if (!state.branches[branch].includes(messageUri)) {
			state.branches[branch].push(messageUri)
		}
		await this.$db.saveDocument(stateUri, state)
		return { branch, messageUri }
	}

	/**
	 * Returns current peer branches synchronization state.
	 * @returns {Promise<{ branches: Record<string, string[]> }>}
	 */
	async getSyncState() {
		const stateUri = this.$db.normalize(this.repo, '.sync-state')
		return (await this.$db.loadDocument(stateUri, null)) || { branches: {} }
	}
}
