import { Model } from '@nan0web/core'

/**
 * PlaygroundModel (Golden Standard v2)
 *
 * Pure Data Schema for Vite dev server configuration.
 * Runner logic lives in `scripts/play.js` — infrastructure, not Intent Flow.
 *
 * @example
 * const pg = new PlaygroundModel({ port: 4246 })
 * // pg.port → 4246
 * // pg.stateFile → '.port'
 */
export class PlaygroundModel extends Model {
	static label = 'playground'
	static label_starting = 'playground.starting'
	static label_ready = 'playground.ready'
	static label_stopped = 'playground.stopped'
	static error_no_db = 'playground.error_no_db'

	static port = { help: 'playground.port_help', default: 4246, type: 'number' }
	static stateFile = { help: 'playground.state_file_help', default: '.port' }
	static viteArgs = { help: 'playground.vite_args_help', default: [], type: 'array' }

	/**
	 * @param {Partial<PlaygroundModel> | Record<string, any>} [data]
	 * @param {object} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} */ this.port
		/** @type {string} */ this.stateFile
		/** @type {string[]} */ this.viteArgs
	}
}
