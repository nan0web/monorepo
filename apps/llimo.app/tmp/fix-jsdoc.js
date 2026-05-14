import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/domain')

async function fix() {
    const files = await fs.readdir(dir)
    for (const f of files) {
        if (!f.endsWith('.js') && !f.endsWith('.ts')) continue
        const filepath = path.join(dir, f)
        let content = await fs.readFile(filepath, 'utf-8')
        
        // Extract static field help texts: static prop = { help: 'Some text', ... }
        const helptRegex = /static\s+([a-zA-Z0-9_]+)\s*=\s*{[^}]*help:\s*['"`](.*?)['"`]/gs
        const helps = {}
        let match
        while ((match = helptRegex.exec(content)) !== null) {
            helps[match[1]] = match[2]
        }
        
        let changed = false
        
        // Find /** @type {any} */ this.prop
        const propRegex = /\/\*\*\s*@type\s*{([^}]+)}\s*\*\/\s*this\.([a-zA-Z0-9_]+)/g
        
        content = content.replace(propRegex, (fullMatch, typeDef, propName) => {
            // Only replace if there's no description
            const alreadyHasEnglish = /[a-zA-Z]{3,}/.test(fullMatch.replace(`@type {${typeDef}}`, ''))
            // If it's literally `/** @type {Type} */ this.prop` or similar
            if (!fullMatch.includes('*/ this.') && alreadyHasEnglish) return fullMatch
            
            const desc = helps[propName]
            if (desc) {
                changed = true
                return `/** @type {${typeDef}} ${desc} */ this.${propName}`
            }
            return fullMatch
        })
        
        if (changed) {
            await fs.writeFile(filepath, content, 'utf-8')
            console.log(`Updated ${f}`)
        }
    }
}
fix().catch(console.error)
