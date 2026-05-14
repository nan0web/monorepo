import path from 'path'
import { fileURLToPath } from 'url'
import { SnapshotRunner } from './SnapshotRunner.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../')
const dataDir = path.resolve(rootDir, 'docs/data')
const snapshotsDir = path.resolve(rootDir, 'snapshots/core')

const groups = {
	Actions: ['Button', 'Toggle'],
	Forms: ['Input', 'Select', 'Slider', 'Autocomplete', 'Color', 'Shadow'],
	Data: ['Accordion', 'Card', 'Sortable', 'Table', 'Tree', 'CodeBlock', 'Markdown', 'Badge'],
	Feedback: ['Alert', 'Confirm', 'Modal', 'ProgressBar', 'Spinner', 'Toast'],
	System: ['LangSelect', 'ThemeToggle'],
}

function getCategory(comp) {
	for (const [cat, comps] of Object.entries(groups)) {
		if (comps.includes(comp)) return cat
	}
	return 'Other'
}

SnapshotRunner.generateAndAudit({
	dataDir,
	snapshotsDir,
	getCategory,
}).catch(console.error)
