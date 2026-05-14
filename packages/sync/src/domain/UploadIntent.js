import { SyncIntent } from './SyncIntent.js'
import { List } from '@nan0web/types'

/**
 * UploadIntent (або ShareIntent) — Модель, що описує намір перетворити
 * локальний `.md` документ на серію медіа і опублікувати їх у X, YT, FB.
 * Підтримує концепт побудови тредів (ланцюжків).
 */
export class UploadIntent extends SyncIntent {
  constructor (data = {}) {
    super(data)

    /**
     * @type {string} Вказівник на першоджерело локального контенту (наприклад, ID або шлях до .md)
     */
    this.source = this.init('source', String)

    /**
     * @type {List} Ланцюжок трансформацій до публікації (наприклад: ["text", "to-tts", "publish"])
     */
    this.pipeline = this.init('pipeline', List, { of: String })
  }
}
