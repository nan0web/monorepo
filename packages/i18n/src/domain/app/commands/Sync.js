import { I18nDb } from '@nan0web/i18n'
import { Model } from '@nan0web/types'

/** @typedef {import('@nan0web/ui').Intent} Intent */

export class SyncCommand extends Model {
	static $id = '@nan0web/i18n/SyncCommand'

	/**
	 * @returns {AsyncGenerator<Intent>}
	 */
	async *run() {
		this._.plugins
		const opts = /** @type {any} */ ({})
		const i18n = new I18nDb(opts)
		await i18n.connect()

		await i18n.syncModels('', opts)
	}
}
