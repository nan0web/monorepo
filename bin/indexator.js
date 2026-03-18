#!/usr/bin/env node
import process from 'node:process'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import FS from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { createOutputProgress, pause } from '../src/cli.js'

const logger = new Logger(Logger.detectLevel(process.argv))

/** Simple frontmatter + title extractor */
async function getModuleInfo(pkgPath) {
    const targets = ['project.md', 'docs/uk/project.md', 'seed.md', 'README.md', 'next.md']
    for (const t of targets) {
        try {
            const content = await readFile(path.join(pkgPath, t), 'utf-8')
            const lines = content.split('\n')
            let title = ''
            let isYaml = false
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim()
                if (i === 0 && line === '---') { isYaml = true; continue; }
                if (isYaml) {
                    if (line === '---') { isYaml = false; continue; }
                    if (line.startsWith('description:')) title = line.slice(12).trim()
                    continue
                }
                if (!title && line.startsWith('# ')) {
                    title = line.slice(2).trim()
                    break
                }
            }
            if (title) return title
        } catch (e) {}
    }
    return '*No description found*'
}

async function generateIndex(subDir) {
	const rootPath = path.resolve(process.cwd(), subDir)
	const items = []
	try {
		const names = await readdir(rootPath)
		for (const name of names) {
			const pkgPath = path.join(rootPath, name)
			const st = await stat(pkgPath).catch(() => null)
			if (!st?.isDirectory() || name.startsWith('.') || name === 'node_modules') continue
            
            // Exclude packages that are known to be external or empty
            if (name === '_' || name === 'dist') continue

			const description = await getModuleInfo(pkgPath)
			items.push({ name, description })
		}
	} catch (e) {
		logger.warn(`Failed to read ${rootPath}: ${e.message}`)
	}
    
    if (items.length === 0) return

	items.sort((a,b) => a.name.localeCompare(b.name))
	
	let md = `# 🗂 Index: ${subDir}\n\n`
	md += `> Automatically generated on ${new Date().toLocaleDateString()}\n\n`
	md += `| Module | Description |\n`
	md += `|--------|-------------|\n`
	for (const item of items) {
		md += `| **[${item.name}](./${item.name})** | ${item.description.replace(/\|/g, '\\|')} |\n`
	}
	
	const rootDb = new FS({ root: '.' })
	await rootDb.connect()
	await rootDb.saveDocument(`${subDir}/index.md`, md)
	logger.success(`Generated ${subDir}/index.md`)
}

async function main() {
	logger.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))
	await generateIndex('packages')
	await generateIndex('apps')
}

main().catch(process.exit)
