import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), 'docs/uk/workflows')

if (!fs.existsSync(dir)) {
    console.error('Directory does not exist:', dir)
    process.exit(1)
}

const files = fs.readdirSync(dir)

// Rename files
for (const file of files) {
    if (file.startsWith('pipeline-no')) {
        const numMatch = file.match(/pipeline-no(\d+)/)
        if (numMatch) {
            const num = numMatch[1].padStart(2, '0')
            const newName = file.replace(/pipeline-no\d+/, `app-pipeline-${num}`)
            const oldPath = path.join(dir, file)
            const newPath = path.join(dir, newName)
            fs.renameSync(oldPath, newPath)
            console.log(`Renamed ${file} to ${newName}`)
        }
    }
}

// Search and replace content in ALL md files
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
for (const file of allFiles) {
    const filePath = path.join(dir, file)
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    
    // Replace references
    const updatedContent = content.replace(/pipeline-no(\d+)/g, (match, p1) => {
        modified = true
        return `app-pipeline-${p1.padStart(2, '0')}`
    })
    
    if (modified) {
        fs.writeFileSync(filePath, updatedContent, 'utf8')
        console.log(`Updated references in ${file}`)
    }
}
