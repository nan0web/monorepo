import { bootstrapApp } from '@nan0web/ui-cli'
import SyncDocsApp from '../src/domain/app/SyncDocsApp.js'
import { DB } from '@nan0web/db'
import { DBFS } from '@nan0web/db-fs'

/**
 * Sovereign Documentation Sync (NaN•Web Platform Style)
 */
const db = new DB()
db.mount('@app', new DBFS('.'))

bootstrapApp(SyncDocsApp, { path: '@app/docs' }, { db }).catch(console.error)
