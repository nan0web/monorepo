#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { ModelAsApp, result, show, progress } from '@nan0web/ui'

export default class WorkspaceStatusApp extends ModelAsApp {
    static UI = {
        title: 'Workspace NPM Status',
        checking: 'Checking {pkg}...',
        upToDate: '✅ {pkg} is up to date ({version})',
        needsPublish: '🚀 {pkg} needs publish: {local} > {remote}',
        notPublished: '🆕 {pkg} is not published yet ({local})',
        error: '❌ Error checking {pkg}: {error}'
    }

    async *run() {
        const { t, db } = this._
        if (!db) return result({ error: 'No DB' })

        const packagesDir = 'packages'
        const entries = await db.readDir(packagesDir, { depth: 1, includeDirs: true })
        
        let count = 0
        for await (const entry of entries) {
            count++
            if (!entry.isDirectory) continue
            const name = entry.path.split('/').pop()
            const pkgJsonPath = `${entry.path}/package.json`
            
            const pkgJson = await db.loadDocument(pkgJsonPath)
            if (!pkgJson || pkgJson.private) continue

            yield progress(t(WorkspaceStatusApp.UI.checking, { pkg: pkgJson.name }))

            try {
                const remoteVersion = execSync(`npm view ${pkgJson.name} version`, { encoding: 'utf8', stdio: [] }).trim()
                if (pkgJson.version === remoteVersion) {
                    yield show(t(WorkspaceStatusApp.UI.upToDate, { pkg: pkgJson.name, version: pkgJson.version }))
                } else {
                    yield show(t(WorkspaceStatusApp.UI.needsPublish, { pkg: pkgJson.name, local: pkgJson.version, remote: remoteVersion }), 'warn')
                }
            } catch (err) {
                if (err.message.includes('404')) {
                    yield show(t(WorkspaceStatusApp.UI.notPublished, { pkg: pkgJson.name, local: pkgJson.version }), 'info')
                } else {
                    yield show(t(WorkspaceStatusApp.UI.error, { pkg: pkgJson.name, error: err.message }), 'error')
                }
            }
        }

        yield show(`Scanned ${count} items.`)
        return result({ ok: true })
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const db = new (await import('@nan0web/db-fs')).default()
    const app = new WorkspaceStatusApp({}, { db })
    const gen = app.run()
    let res = await gen.next()
    while (!res.done) {
        const intent = res.value
        if (intent && intent.payload) {
            console.log(intent.payload.content || intent.payload.message || '')
        }
        res = await gen.next()
    }
}
