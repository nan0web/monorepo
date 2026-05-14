import { SyncIntent } from './SyncIntent.js'

/**
 * DownloadIntent (або LoadIntent) — Модель, що описує намір "втягнути" дані
 * із зовнішнього світу (YouTube відео, субтитри, коментарі з соцмереж)
 * та зберегти їх у локальну галерею OLMUI.
 */
export class DownloadIntent extends SyncIntent {
  constructor (data = {}) {
    super(data)
  }
}
