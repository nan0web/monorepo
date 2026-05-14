import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '../../../../../../')
const siteDir = path.join(root, 'dist')
const dataDir = path.join(root, 'docs')
const ideFile = path.join(siteDir, 'ui.js')
const ideSrc = fs.readFileSync(ideFile, 'utf-8')

// ─── T1: YAML → JSON пакування ────────────────────────────

describe('T1: YAML → JSON data packaging', () => {
	it('generate-data.js script exists', () => {
		const script = path.join(siteDir, 'scripts/generate-data.js')
		assert.ok(fs.existsSync(script), 'scripts/generate-data.js must exist')
	})

	it('docs:build-data script is in package.json', () => {
		const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
		assert.ok(pkg.scripts['docs:build-data'], 'package.json must have docs:build-data script')
	})

	it('JSON files are generated for each YAML component', () => {
		const langs = ['uk', 'en']
		for (const lang of langs) {
			const yamlDir = path.join(dataDir, lang, 'components')
			if (!fs.existsSync(yamlDir)) continue
			const yamls = fs.readdirSync(yamlDir).filter((f) => f.endsWith('.yaml'))
			for (const yaml of yamls) {
				const jsonFile = path.join(siteDir, 'public/data', lang, yaml.replace('.yaml', '.json'))
				assert.ok(
					fs.existsSync(jsonFile),
					`Missing JSON: ${lang}/${yaml.replace('.yaml', '.json')}`,
				)
			}
		}
	})
})

// ─── T2: Dynamic manifest per language ─────────────────────

describe('T2: Dynamic manifest per language (db.fetch)', () => {
	it('IDE fetches component data via HTTP, not static import', () => {
		assert.ok(
			ideSrc.includes('fetch(') || ideSrc.includes('db.fetch('),
			'ide.js must use fetch() for component data loading',
		)
	})

	it('IDE reloads component data on language change', () => {
		// When lang attribute changes, the component data should re-fetch
		assert.ok(
			ideSrc.includes('attributeChangedCallback') || ideSrc.includes('updated('),
			'ide.js must react to lang attribute changes',
		)
		// Must have fetch call within lang-change handler or observed attributes
		const hasFetchOnLang =
			ideSrc.includes("'lang'") &&
			(ideSrc.includes('_loadManifest') || ideSrc.includes('_fetchComponent'))
		assert.ok(hasFetchOnLang, 'IDE must reload data when lang changes')
	})
})

// ─── T3: Theme Settings page ───────────────────────────────

describe('T3: Theme Settings dedicated page', () => {
	it('theme.html exists', () => {
		const themePage = path.join(siteDir, 'theme.html')
		assert.ok(fs.existsSync(themePage), 'theme.html must exist')
	})

	it('Theme page has 50+ CSS variable editors', () => {
		const themePage = path.join(siteDir, 'theme.html')
		if (!fs.existsSync(themePage)) {
			assert.fail('theme.html missing')
			return
		}
		const content = fs.readFileSync(themePage, 'utf-8')
		// Count color/number inputs or CSS variable references
		const varCount = (content.match(/--[\w-]+/g) || []).length
		assert.ok(varCount >= 50, `Theme page must reference 50+ CSS variables, found ${varCount}`)
	})
})

// ─── T4: UIForm for complex props ──────────────────────────

describe('T4: UIForm for complex props (array-of-objects)', () => {
	it('Props editor renders array-of-objects editor for langs', () => {
		// IDE should detect array-of-objects type and render sub-form
		assert.ok(
			ideSrc.includes('array-editor') ||
				ideSrc.includes('_renderArrayEditor') ||
				ideSrc.includes('renderObjectArray'),
			'ide.js must have array-of-objects editor renderer',
		)
	})

	it('Array editor supports add/remove items', () => {
		const hasAdd =
			ideSrc.includes('_addArrayItem') || ideSrc.includes('add-item') || ideSrc.includes('➕')
		const hasRemove =
			ideSrc.includes('_removeArrayItem') || ideSrc.includes('remove-item') || ideSrc.includes('🗑')
		assert.ok(hasAdd, 'Array editor must support adding items')
		assert.ok(hasRemove, 'Array editor must support removing items')
	})
})

// ─── T5: Tree keyboard navigation ─────────────────────────

describe('T5: Tree keyboard navigation (Arrow keys)', () => {
	// SKIP: Requires changes to @nan0web/ui-lit package (separate release scope)
	it.skip('ui-tree component handles ArrowUp/ArrowDown', () => {
		const treeSrc = (() => {
			try {
				return fs.readFileSync(
					path.join(root, 'node_modules/@nan0web/ui-lit/packages/core/tree.js'),
					'utf-8',
				)
			} catch {
				return ''
			}
		})()
		assert.ok(treeSrc, 'ui-tree source must be readable')
		assert.ok(
			treeSrc.includes('ArrowUp') || treeSrc.includes('ArrowDown'),
			'ui-tree must handle ArrowUp/ArrowDown for keyboard navigation',
		)
	})

	// SKIP: Requires changes to @nan0web/ui-lit package (separate release scope)
	it.skip('ui-tree component handles ArrowLeft/ArrowRight for collapse/expand', () => {
		const treeSrc = (() => {
			try {
				return fs.readFileSync(
					path.join(root, 'node_modules/@nan0web/ui-lit/packages/core/tree.js'),
					'utf-8',
				)
			} catch {
				return ''
			}
		})()
		assert.ok(
			treeSrc.includes('ArrowLeft') || treeSrc.includes('ArrowRight'),
			'ui-tree must handle ArrowLeft/ArrowRight for collapse/expand',
		)
	})
})

// ─── T6: Modal footer slot injection ──────────────────────

describe('T6: Modal footer slot injection', () => {
	it('IDE injects footer slot with buttons for ui-modal', () => {
		assert.ok(
			ideSrc.includes('slot="footer"') || ideSrc.includes("slot='footer'"),
			'ide.js must inject footer slot content for ui-modal',
		)
	})
})
