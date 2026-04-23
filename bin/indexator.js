#!/usr/bin/env node
import process from 'node:process'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import FS from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { createOutputProgress, pause } from '../src/cli.js'

const logger = new Logger(Logger.detectLevel(process.argv))

/** Extract frontmatter, description and tags */
async function getModuleInfo(pkgPath) {
    const targets = ['project.md', 'docs/uk/project.md', 'seed.md', 'README.md', 'next.md']
    for (const t of targets) {
        try {
            const content = await readFile(path.join(pkgPath, t), 'utf-8')
            const lines = content.split('\n')
            let title = ''
            let tags = []
            let isYaml = false
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim()
                if (i === 0 && line === '---') { isYaml = true; continue; }
                if (isYaml) {
                    if (line === '---') { isYaml = false; continue; }
                    if (line.startsWith('description:')) {
                        title = line.slice(12).trim().replace(/^['"]|['"]$/g, '')
                    }
                    if (line.startsWith('tags:')) {
                        const tagsRaw = line.slice(5).trim()
                        // Extract array items from format like [ui, cli]
                        const match = tagsRaw.match(/\[(.*?)\]/)
                        if (match) {
                            tags = match[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
                        } else {
                            tags = tagsRaw.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
                        }
                    }
                    continue
                }
                if (!title && line.startsWith('# ')) {
                    title = line.slice(2).trim()
                    break
                }
            }
            if (title) return { description: title, tags }
        } catch (e) {}
    }
    return { description: '*No description found*', tags: [] }
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

			const { description, tags } = await getModuleInfo(pkgPath)
			items.push({ name, description, tags, workspace: subDir, path: `${subDir}/${name}` })
		}
	} catch (e) {
		logger.warn(`Failed to read ${rootPath}: ${e.message}`)
	}
    
    if (items.length === 0) return []

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
    
    return items
}

async function main() {
	logger.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))
	const packages = await generateIndex('packages')
	const apps = await generateIndex('apps')
    
    const allItems = [...(packages || []), ...(apps || [])]
    
    // Зберігаємо реєстр (Global Store CSV)
    const rootDb = new FS({ root: '.' })
    await rootDb.connect()
    
    const headers = ['name', 'workspace', 'path', 'tags', 'description']
    const escape = (str) => `"${String(str).replace(/"/g, '""')}"`
    
    const csvLines = [headers.join(',')]
    for (const item of allItems) {
        const row = [
            item.name,
            item.workspace,
            item.path,
            item.tags.join(' '),
            item.description
        ].map(escape).join(',')
        csvLines.push(row)
    }
    
    await rootDb.saveDocument('nan0web_store.csv', csvLines.join('\n'))
    logger.success(`Generated nan0web_store.csv with ${allItems.length} modules`)
}

main().catch(process.exit)
