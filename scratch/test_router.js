import { DBwithFSDriver } from '../packages/db-fs/src/DBFS.js'
import { buildNavTree } from '../apps/nan0web.app/src/utils/buildNavTree.js'
import PagesRouter from '../apps/nan0web.app/src/router/PagesRouter.js'
import path from 'path'

async function test() {
    const db = new DBwithFSDriver({ dsn: path.resolve('packages/ui/docs') })
    await db.connect()
    const pages = await buildNavTree(db, '.', { directoryIndex: 'README' })
    const router = new PagesRouter()
    router.load({ pages })
    
    console.log('Routes:', router.paths())
    console.log('Resolve "/":', router.resolve('/'))
}

test()
