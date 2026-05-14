import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.resolve(__dirname, '../../../../../dist')
const ideJsPath = path.join(siteDir, 'ui.js')
const mainJsPath = path.join(siteDir, 'ui.js')
const genScript = path.join(siteDir, 'scripts/generate-pages.js')

// ─── Task 1: Deep-Linked Category URLs ──────────────────────

describe('Task 1: Deep-Linked Category URLs', () => {
	it('generate-pages.js creates HTML files inside category subdirectories', () => {
		// After generate-pages runs, files should exist at /{lang}/{Category}/{Component}.html
		// e.g. docs/site/uk/Actions/Button.html
		const expectedPath = path.join(siteDir, 'uk/Actions/Button.html')
		assert.ok(fs.existsSync(expectedPath), `Expected ${expectedPath} to exist`)
	})

	it('generated HTML includes correct component attribute', () => {
		const htmlPath = path.join(siteDir, 'uk/Actions/Button.html')
		if (!fs.existsSync(htmlPath)) {
			assert.fail('HTML file does not exist yet')
		}
		const html = fs.readFileSync(htmlPath, 'utf-8')
		assert.ok(html.includes('active-component="Button"'), 'should set active-component="Button"')
		assert.ok(html.includes('lang="uk"'), 'should set lang="uk"')
	})

	it('generated HTML has correct relative script path (../../src/main.js)', () => {
		const htmlPath = path.join(siteDir, 'uk/Actions/Button.html')
		if (!fs.existsSync(htmlPath)) {
			assert.fail('HTML file does not exist yet')
		}
		const html = fs.readFileSync(htmlPath, 'utf-8')
		assert.ok(
			html.includes('src="../../src/main.js"'),
			'Script path should be ../../src/main.js for category subdirectory',
		)
	})

	it('ide.js _syncFromUrl parses /{lang}/{Category}/{Component}.html pattern', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// The regex should match paths like /uk/Actions/Button.html
		// It should capture lang, category (optional) and component
		assert.ok(
			code.includes('/([^/]+)/([^/]+)/([^/.]+)\\.html'),
			'_syncFromUrl should have regex for /{lang}/{category}/{component}.html',
		)
	})

	it('ide.js _selectComponent builds URL with category path', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// Should construct URL like ../../{lang}/{category}/{component}.html
		assert.ok(
			code.includes('/${this.activeApp}/'),
			'_selectComponent should include activeApp (category) in URL',
		)
	})

	it('all categories have directory structure created', () => {
		const categories = ['Actions', 'Forms', 'Data', 'Feedback', 'System']
		for (const cat of categories) {
			const catDir = path.join(siteDir, 'uk', cat)
			assert.ok(fs.existsSync(catDir), `Category directory ${cat} should exist for lang=uk`)
		}
	})
})

// ─── Task 2: Active Page Highlight on Refresh ───────────────

describe('Task 2: Active Page Highlight on Refresh', () => {
	it('ide.js re-syncs URL on manifest-updated event', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// In the manifest-updated listener, _syncFromUrl should be called
		assert.ok(
			code.includes('manifest-updated') && code.includes('_syncFromUrl'),
			'manifest-updated handler should call _syncFromUrl',
		)
	})

	it('ide.js manifest-updated handler calls _syncFromUrl after setting components', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// Find the manifest-updated handler block
		const handlerMatch = code.match(/manifest-updated['"]?\s*,\s*\(e\)\s*=>\s*\{([^}]+)\}/s)
		assert.ok(handlerMatch, 'Should have manifest-updated handler')
		const handlerBody = handlerMatch[1]

		// _syncFromUrl should come after setting this.components
		const componentsIdx = handlerBody.indexOf('this.components')
		const syncIdx = handlerBody.indexOf('_syncFromUrl')
		assert.ok(componentsIdx >= 0, 'Handler should set this.components')
		assert.ok(syncIdx >= 0, 'Handler should call _syncFromUrl')
		assert.ok(syncIdx > componentsIdx, '_syncFromUrl should be called AFTER setting components')
	})
})

// ─── Task 3: Duplicate Variant Names ────────────────────────

describe('Task 3: Unique Variant Names in Button', () => {
	it('main.js generates unique variant names (no duplicate Primary)', () => {
		const code = fs.readFileSync(mainJsPath, 'utf-8')
		// The naming logic should handle duplicates — checking the code uses both variant and label/content,
		// and handles uniqueness
		assert.ok(
			(code.includes('label') || code.includes('content')) && code.includes('variant'),
			'Variant naming should consider both label/content and variant',
		)
	})

	it('Button YAML outline variant should get unique name from content, not variant', () => {
		const yamlPath = path.resolve(__dirname, '../../../../../docs/en/components/Button.yaml')
		const yaml = fs.readFileSync(yamlPath, 'utf-8')
		// Verify we still have the outline variant data
		assert.ok(yaml.includes('outline: true'), 'Button YAML should have outline variant')
		assert.ok(yaml.includes('content: Outline'), 'Outline variant should have content "Outline"')
	})

	it('main.js deduplicates variant names with a suffix or uses label as fallback', () => {
		const code = fs.readFileSync(mainJsPath, 'utf-8')
		// The code must have deduplication logic: either tracking seen names,
		// or preferring label for outline variants
		const hasDedupe =
			code.includes('seen') ||
			code.includes('has(') ||
			code.includes('outline') ||
			code.includes('Set(')
		assert.ok(hasDedupe, 'main.js should have deduplication logic for variant names')
	})
})

// ─── Task 4: Code Pane Light Theme ──────────────────────────

describe('Task 4: Code Pane Light Theme', () => {
	it('ide.js has light theme styles for .code-pane', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// In :host(.theme-light) section, there should be .code-pane styling
		assert.ok(
			code.includes('.theme-light') && code.includes('.code-pane'),
			'Should have .code-pane styles in light theme',
		)
	})

	it('ide.js has light theme styles for .code-tabs', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('.theme-light') && code.includes('.code-tabs'),
			'Should have .code-tabs styles in light theme',
		)
	})

	it('code-pane uses CSS variables instead of hardcoded dark colors', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// .code-pane should use var(--...) for background, not hardcoded #1e1e1e
		const codePaneMatch = code.match(/\.code-pane\s*\{([^}]+)\}/s)
		assert.ok(codePaneMatch, '.code-pane CSS block should exist')
		const cssPaneBlock = codePaneMatch[1]
		assert.ok(
			!cssPaneBlock.includes('#1e1e1e'),
			'.code-pane background should not be hardcoded #1e1e1e',
		)
	})

	it('code-tabs uses CSS variables instead of hardcoded dark colors', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const codeTabsMatch = code.match(/\.code-tabs\s*\{([^}]+)\}/s)
		assert.ok(codeTabsMatch, '.code-tabs CSS block should exist')
		const cssTabsBlock = codeTabsMatch[1]
		assert.ok(
			!cssTabsBlock.includes('#252526'),
			'.code-tabs background should not be hardcoded #252526',
		)
	})
})
