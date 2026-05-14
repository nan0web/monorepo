import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.resolve(__dirname, '../../../../../../')
const docsDir = path.join(pkgDir, 'dist')
const ideJsPath = path.join(docsDir, 'ui.js')
const indexHtmlPath = path.join(docsDir, 'index.html')
const ideHtmlPath = path.join(docsDir, 'ide.html')

describe('v1.6.1: Unified Navigation & Theme Editor', () => {
	it('Navbar labels are unified across index.html and ide.html', () => {
		const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')
		const ideHtml = fs.readFileSync(ideHtmlPath, 'utf-8')
		const indexNavLinks = indexHtml.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] || ''
		const ideNavLinks = ideHtml.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] || ''
		assert.ok(!indexNavLinks.includes('📖'), 'index.html navbar should not have emojis')
		assert.ok(!ideNavLinks.includes('📖'), 'ide.html navbar should not have emojis')
		assert.ok(indexNavLinks.includes('Документація'), 'index.html has Documentation')
		assert.ok(ideNavLinks.includes('Документація'), 'ide.html has Documentation')
		assert.ok(indexNavLinks.includes('Карта інтерфейсів'), 'index.html has Interface Map')
		assert.ok(ideNavLinks.includes('Карта інтерфейсів'), 'ide.html has Interface Map')
	})

	it('MasterIDE has a dedicated CSS variables view', () => {
		const ideJs = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(ideJs.includes('cssVars'), 'ide.js has cssVars')
		assert.ok(ideJs.includes('type="color"'), 'uses color inputs')
	})

	it('Modal triggers in IDE are localized', () => {
		const ideJs = fs.readFileSync(ideJsPath, 'utf-8')
		const renderMethod = ideJs.match(/_renderPreview\(\) \{([\s\S]*?)\n\s*\}\n/)?.[0] || ideJs
		assert.ok(!renderMethod.includes("'Open '"), 'No hardcoded English in render')
		assert.ok(renderMethod.includes('_t('), 'Localized via _t()')
	})

	it('Toggle border is scoped', () => {
		const ideJs = fs.readFileSync(ideJsPath, 'utf-8')
		const toggleStyles = ideJs.match(/ui-toggle\s*\{([^}]+)\}/g)
		if (toggleStyles) {
			toggleStyles.forEach((style) => {
				assert.ok(!style.includes('border: 1px solid'), 'Should not have global border')
			})
		}
	})

	it('SEO language detection in index.html', () => {
		const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')
		assert.ok(indexHtml.includes('window.location.pathname.startsWith'), 'Detects lang from URL')
	})
})
