/**
 * Showcase App Playground.
 * Loads data/index.yaml manifest, resolves section YAML files, drives via CLI adapter.
 */
import { ShowcaseAppModel } from '../src/domain/components/ShowcaseAppModel.js'
import { runGenerator } from '../src/index.js'
// TODO: switch to '@nan0web/ui-cli' after v2.10.0 (with OLMUI log/progress/result handlers)
import { CLiInputAdapter as InputAdapter } from '@nan0web/ui-cli'
import Logger from '@nan0web/log'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const yaml = require('js-yaml')

const log = new Logger()
const dataDir = path.resolve(process.cwd(), 'data')
const locale = process.env.LANG?.split('_')[0]?.split('-')[0] || 'uk'

/**
 * Component name → YAML filename (kebab-case)
 */
const FILE_MAP = {
	Banner: 'banner', Hero: 'hero', Stats: 'stats',
	PricingSection: 'pricing', Testimonials: 'testimonials',
	Timeline: 'timeline', FAQ: 'faq', Gallery: 'gallery',
	EmptyState: 'empty-state', Header: 'header', Footer: 'footer',
}

function loadYaml(filePath) {
	try { return yaml.load(fs.readFileSync(filePath, 'utf8')) }
	catch { return null }
}

async function main() {
	const manifest = loadYaml(path.join(dataDir, 'index.yaml'))
	if (!manifest) {
		log.error('Cannot load data/index.yaml')
		process.exit(1)
	}

	const sections = (manifest.$content || []).map(entry => {
		const [name, flag] = Object.entries(entry).find(([k]) => !k.startsWith('$')) || []
		if (!name || !flag) return null

		const file = FILE_MAP[name] || name.toLowerCase()
		const localePath = path.join(dataDir, locale, `${file}.yaml`)
		const fallbackPath = path.join(dataDir, 'en', `${file}.yaml`)
		const data = loadYaml(localePath) || loadYaml(fallbackPath)
		if (!data) {
			log.warn(`⚠ No data for section "${name}" (tried ${locale}/${file}.yaml)`)
			return null
		}
		return { [name]: data }
	}).filter(Boolean)

	const model = new ShowcaseAppModel({ title: manifest.title, sections })

	log.info(Logger.style(`\n  ${model.title}  \n`, { color: 'magenta' }))
	log.info(Logger.style(`  ${sections.length} sections | locale: ${locale}  `, { color: 'cyan' }))
	log.info('')

	const adapter = new InputAdapter({ console: log })
	await runGenerator(model.run(), adapter)
	log.success('\n✅ Showcase completed.')
}

main().catch(e => { log.error('\nShowcase failed:', e); process.exit(1) })
