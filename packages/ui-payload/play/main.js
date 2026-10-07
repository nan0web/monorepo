#!/usr/bin/env node
/**
 * CLI Entry point for @nan0web/ui-payload playground.
 * Supports interactive menu & headless --demo=... execution for Golden Master snapshots.
 */
import process from 'node:process'
import DBFS from '@nan0web/db-fs'

const dataFs = new DBFS({ root: 'play/data', cwd: import.meta.dirname + '/..' })
let translations = {}

export async function loadLocale(locale = 'en') {
	const uri = locale === 'en' ? 'index' : `${locale}/index`
	try {
		const doc = await dataFs.fetch(uri)
		translations = doc?.t ?? {}
	} catch {
		translations = {}
	}
}

export function t(key) {
	return translations[key] || key
}

/**
 * Demo 1: Table & Cell components simulation
 */
export async function demoTable() {
	console.log(`\n📋 [DEMO] ${t('Payload CMS Cell Components Table')}:`)
	console.log('--------------------------------------------------------------------------------')
	console.log(`| ${t('Card/Item').padEnd(25)} | ${t('Image').padEnd(12)} | ${t('Active').padEnd(14)} | ${t('Location').padEnd(20)} |`)
	console.log('--------------------------------------------------------------------------------')
	console.log(`| Industrial Bank Premium   | 🖼️ [Photo]   | 🌐 Active      | 📍 Kyiv, Khreshchatyk |`)
	console.log(`| Smart Business Card       | 🖼️ Без фото  | 🙈 Hidden      | 📍 Lviv, Rynok sq     |`)
	console.log(`| Green Planet Sovereign    | 🖼️ [Photo]   | 🌐 Active      | 📍 Odesa, Derybasivska|`)
	console.log('--------------------------------------------------------------------------------\n')
}

/**
 * Demo 2: Payload Collection Template compilation
 */
export async function demoTemplate() {
	const { PayloadCollectionTemplate } = await import('../src/templates/PayloadCollectionTemplate.js')
	const tpl = new PayloadCollectionTemplate({
		collectionSlug: 'branches',
		useAsTitle: 'name',
		labels: { singular: 'Branch', plural: 'Branches' },
		group: 'Banking',
	})
	const code = await tpl.compile()
	console.log(`\n⚙️ [DEMO] Compiled PayloadCollectionTemplate for 'branches':\n`)
	console.log(code.slice(0, 320) + '\n... (truncated)')
}

/**
 * Demo 3: SeedModel with virtual DB
 */
export async function demoSeed() {
	const { SeedModel } = await import('../src/domain/SeedModel.js')
	const mockDb = {
		Directory: { isConfig: () => false, isDirectory: () => false },
		async *browse() {
			yield { path: '@cwd/data/cards.json' }
		},
		async fetch() {
			return [{ title: 'Platinum Card', slug: 'platinum', order: 1 }]
		},
	}
	const seedApp = new SeedModel({ dataDir: 'data' }, { db: mockDb })
	const items = await seedApp.readSeedFiles('data')
	console.log(`\n🌱 [DEMO] SeedModel read files:`, items)
}

/** @type {Record<string, () => Promise<void>>} */
export const DEMO_MAP = {
	table: demoTable,
	template: demoTemplate,
	seed: demoSeed,
	all: async () => {
		await demoTable()
		await demoTemplate()
		await demoSeed()
	},
}

function getArg(flag) {
	const prefix = `--${flag}=`
	const arg = process.argv.find((a) => a.startsWith(prefix))
	return arg ? arg.slice(prefix.length) : undefined
}

async function main() {
	const argLang = getArg('lang') || 'en'
	const argDemo = getArg('demo')
	await loadLocale(argLang)

	if (argDemo) {
		const fn = DEMO_MAP[argDemo]
		if (!fn) {
			console.error(`Unknown demo scenario: ${argDemo}`)
			process.exit(1)
		}
		await fn()
		return
	}

	// Interactive or default CLI execution
	console.log(`✨ NaN0Web UI-Payload Sandbox (${argLang})`)
	await DEMO_MAP.all()
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('play/main.js')) {
	main().catch((err) => {
		console.error(err)
		process.exit(1)
	})
}
