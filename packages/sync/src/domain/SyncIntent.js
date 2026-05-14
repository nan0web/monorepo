import { Model } from '@nan0web/types'

/**
 * SyncIntent — Базова абстракція для універсальної синхронізації 
 * між OLMUI середовищем та зовнішнім світом. Забезпечує фундамент
 * для завантаження (Download) та дистрибуції (Upload).
 */
export class SyncIntent extends Model {
  constructor (data = {}) {
    super(data)

    /**
     * @type {string} Універсальний ідентифікатор цілі / джерела (напр., https://youtube.com/...)
     */
    this.url = this.init('url', String)

    /**
     * @type {string} Цільовий формат (напр., 'mp3', 'video', 'json', 'markdown')
     */
    this.format = this.init('format', String)

    /**
     * @type {object} Дані для авторизації (API ключі, OAuth токени, Credentials)
     */
    this.auth = this.init('auth', Object)

    /**
     * @type {string} Статус виконання ("pending", "active", "completed", "error")
     */
    this.status = this.init('status', String)

    /**
     * @type {number} Прогрес виконання від 0 до 100 для біндингу з UI-CLI (ProgressBar)
     */
    this.progress = this.init('progress', Number)
  }
}
