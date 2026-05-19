import { SyncIntent } from './SyncIntent.js'

/**
 * UploadIntent (або ShareIntent) — Модель, що описує намір перетворити
 * локальний `.md` документ на серію медіа і опублікувати їх у X, YT, FB.
 * Підтримує концепт побудови тредів (ланцюжків).
 */
export class UploadIntent extends SyncIntent {
	static source = { type: 'string', default: '' }
	static pipeline = { type: 'array', default: () => [] }

	constructor(data = {}, options = {}) {
		super(data, options)

		/**
		 * @type {string} Вказівник на першоджерело локального контенту (наприклад, ID або шлях до .md)
		 */
		this.source

		/**
		 * @type {string[]} Ланцюжок трансформацій до публікації (наприклад: ["text", "to-tts", "publish"])
		 */
		this.pipeline
	}
}
