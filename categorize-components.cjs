const fs = require('fs')
const path = require('path')

const groups = {
	Actions: ['Button', 'Toggle'],
	Forms: ['Input', 'Select', 'Slider', 'Autocomplete', 'Color', 'Shadow'],
	Data: ['Accordion', 'Card', 'Sortable', 'Table', 'Tree', 'CodeBlock', 'Markdown', 'Badge'],
	Feedback: ['Alert', 'Confirm', 'Modal', 'ProgressBar', 'Spinner', 'Toast'],
	System: ['LangSelect', 'ThemeToggle'],
}

const langs = ['uk', 'en']
const docsDir = path.join(__dirname, 'packages', 'ui', 'docs')

function getCategoryForComponent(name) {
	for (const [cat, comps] of Object.entries(groups)) {
		if (comps.includes(name)) return cat
	}
	return 'Core'
}

for (const lang of langs) {
	const componentsDir = path.join(docsDir, lang, 'components')
	if (!fs.existsSync(componentsDir)) continue

	const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.yaml'))
	for (const file of files) {
		const compName = file.replace('.yaml', '')
		const category = getCategoryForComponent(compName)
		
		const targetDir = path.join(docsDir, lang, category)
		fs.mkdirSync(targetDir, { recursive: true })
		
		fs.renameSync(
			path.join(componentsDir, file),
			path.join(targetDir, file)
		)
	}
	
	// Try to remove empty components directory
	try {
        if (fs.readdirSync(componentsDir).length === 0) {
		    fs.rmdirSync(componentsDir)
        }
	} catch (e) {}
}

console.log('Successfully reorganized components into category directories!')
