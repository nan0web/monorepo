import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function loadConfig() {
    const config = { aliases: {} }
    try {
        const globalRc = await fs.readFile(path.join(os.homedir(), ".llimorc"), "utf-8")
        Object.assign(config.aliases, JSON.parse(globalRc).aliases || {})
    } catch (e) {}
    try {
        const localRc = await fs.readFile(path.join(process.cwd(), ".llimorc"), "utf-8")
        Object.assign(config.aliases, JSON.parse(localRc).aliases || {})
    } catch (e) {}
    return config
}

async function main() {
    const config = await loadConfig()
    const targetAlias = '@workflow'
    const targetDirRel = config.aliases[targetAlias]

    if (!targetDirRel) {
        console.error(`❌ Alias '${targetAlias}' not found in .llimorc`)
        process.exit(1)
    }

    const dir = path.resolve(process.cwd(), targetDirRel)
    
    let files
    try {
        files = await fs.readdir(dir)
    } catch (err) {
        console.error(`❌ Cannot read directory: ${dir}`)
        process.exit(1)
    }

    let indexMd = '# 📚 LLiMo Workflows Index\n\n'
    indexMd += 'Цей файл містить короткий опис усіх доступних шаблонів (Workflows).\n'
    indexMd += 'Якщо вам потрібен один з них, використовуйте команду `!include @workflow/назва.md`.\n\n'

    const workflows = []

    for (const file of files) {
        if (!file.endsWith('.md')) continue
        const content = await fs.readFile(path.join(dir, file), 'utf-8')
        const match = content.match(/^---\n([\s\S]*?)\n---/)
        let desc = 'Без опису'
        if (match) {
            const rawYaml = match[1]
            const descMatch = rawYaml.match(/description:\s*(.+)/)
            if (descMatch) {
                desc = descMatch[1].trim()
            }
        }
        workflows.push({ file, desc })
    }

    workflows.sort((a, b) => a.file.localeCompare(b.file))

    for (const w of workflows) {
        indexMd += `- **[${targetAlias}/${w.file}]** — ${w.desc}\n`
    }

    const outPath = path.join(dir, '../workflows-index.md')
    await fs.writeFile(outPath, indexMd, 'utf-8')
    console.log(`✅ Згенеровано індекс шаблонів: ${outPath}`)
}
main()
