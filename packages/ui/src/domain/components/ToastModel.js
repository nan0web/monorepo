import { Model } from '@nan0web/types'
import { show, result } from '../../core/Intent.js'

/**
 * Model-as-Schema for Toast notification.
 */
export class ToastModel extends Model {
	static $id = '@nan0web/ui/ToastModel'

	static UI = {
		toastLog: '{message}',
	}

	static variant = {
		help: 'Notification color scheme',
		default: 'info',
		options: ['info', 'success', 'warn', 'error'],
	}

	static message = {
		help: 'Text content of the notification',
		default: 'Notification message',
		type: 'string',
	}

	static duration = {
		help: 'Auto-dismiss timeout (0 for manual only)',
		default: 3000,
		type: 'number',
	}

	/**
	 * @param {Partial<ToastModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {'info'|'success'|'warn'|'error'} Notification color scheme */ this.variant
		/** @type {string} Text displayed in the toast */ this.message
		/** @type {number} Auto-dismiss timeout in ms */ this.duration
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		yield show(this._.t(ToastModel.UI.toastLog, { message: this.message }), this.variant === 'error' ? 'error' : 'info', {
			component: 'Toast',
			model: this,
		})

		return result({ dismissed: true })
	}
}
