import { Model } from '@nan0web/types'

/**
 * SyncIntent — Базова абстракція для універсальної синхронізації 
 * між OLMUI середовищем та зовнішнім світом. Забезпечує фундамент
 * для завантаження (Download) та дистрибуції (Upload).
 */
export class SyncIntent extends Model {
	static url = { type: 'string', default: '' }
	static format = { type: 'string', default: '' }
	static auth = { type: 'object', default: () => ({}) }
	static status = { type: 'string', default: '' }
	static progress = { type: 'number', default: 0 }

	constructor(data = {}, options = {}) {
		super(data, options)

		/**
		 * @type {string} Універсальний ідентифікатор цілі / джерела (напр., https://youtube.com/...)
		 */
		this.url

		/**
		 * @type {string} Цільовий формат (напр., 'mp3', 'video', 'json', 'markdown')
		 */
		this.format

		/**
		 * @type {object} Дані для авторизації (API ключі, OAuth токени, Credentials)
		 */
		this.auth

		/**
		 * @type {string} Статус виконання ("pending", "active", "completed", "error")
		 */
		this.status

		/**
		 * @type {number} Прогрес виконання від 0 до 100 для біндингу з UI-CLI (ProgressBar)
		 */
		this.progress
	}
}
