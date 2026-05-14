import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../../../../../..')
const srcDir = path.join(rootDir, 'src')
const siteDir = path.join(rootDir, 'dist')
const ideJsPath = path.join(siteDir, 'ui.js')

// ─── Task 1: Architecture UI Map ──────────────────────────────

describe('Task 1: ArchitectureMap module', () => {
	const mapDir = path.join(srcDir, 'ArchitectureMap')
	const mapPath = path.join(mapDir, 'ArchitectureMap.js')
	const mapTestPath = path.join(mapDir, 'ArchitectureMap.test.js')

	it('ArchitectureMap.js exists', () => {
		assert.ok(fs.existsSync(mapPath), 'src/ArchitectureMap/ArchitectureMap.js should exist')
	})

	it('ArchitectureMap.test.js exists', () => {
		assert.ok(
			fs.existsSync(mapTestPath),
			'src/ArchitectureMap/ArchitectureMap.test.js should exist',
		)
	})

	it('ArchitectureMap exports a class with register method', async () => {
		const mod = await import(mapPath)
		const MapClass = mod.default || mod.ArchitectureMap
		assert.ok(MapClass, 'ArchitectureMap should be exported')
		const instance = new MapClass()
		assert.equal(typeof instance.register, 'function', 'register() method should exist')
	})

	it('ArchitectureMap.register() accepts packageName and componentsList', async () => {
		const mod = await import(mapPath)
		const MapClass = mod.default || mod.ArchitectureMap
		const map = new MapClass()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])
		// Should not throw
		assert.ok(true)
	})

	it('ArchitectureMap.getMatrix() returns component-package readiness matrix', async () => {
		const mod = await import(mapPath)
		const MapClass = mod.default || mod.ArchitectureMap
		const map = new MapClass()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])

		const matrix = map.getMatrix()
		assert.ok(matrix, 'getMatrix() should return a value')
		assert.ok(matrix.Button, 'Matrix should contain Button entry')
		assert.equal(matrix.Button['ui-lit'], true, 'Button should be ready in ui-lit')
		assert.equal(matrix.Button['ui-cli'], true, 'Button should be ready in ui-cli')
		assert.equal(matrix.Select['ui-lit'], true, 'Select should be ready in ui-lit')
		assert.equal(matrix.Select['ui-cli'], false, 'Select should NOT be ready in ui-cli')
	})

	it('ArchitectureMap.getReadiness() checks if component is in all target packages', async () => {
		const mod = await import(mapPath)
		const MapClass = mod.default || mod.ArchitectureMap
		const map = new MapClass()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])

		assert.equal(map.getReadiness('Button'), true, 'Button is in all packages → ready')
		assert.equal(map.getReadiness('Select'), false, 'Select is only in ui-lit → not ready')
	})

	it('ArchitectureMap tracks all 22 core components from YAML data', async () => {
		const mod = await import(mapPath)
		const MapClass = mod.default || mod.ArchitectureMap
		const map = new MapClass()

		const coreComponents = [
			'Accordion',
			'Alert',
			'Autocomplete',
			'Badge',
			'Button',
			'Card',
			'CodeBlock',
			'Confirm',
			'Input',
			'LangSelect',
			'Markdown',
			'Modal',
			'ProgressBar',
			'Select',
			'Slider',
			'Sortable',
			'Spinner',
			'Table',
			'ThemeToggle',
			'Toast',
			'Toggle',
			'Tree',
		]

		map.register('ui-lit', coreComponents)
		const matrix = map.getMatrix()

		for (const comp of coreComponents) {
			assert.ok(
				matrix[comp],
				`Matrix should contain ${comp} entry after registering all core components`,
			)
		}
	})

	it('ArchitectureMap.getPackages() returns list of registered packages', async () => {
		const mod = await import(mapPath)
		const MapClass = mod.default || mod.ArchitectureMap
		const map = new MapClass()
		map.register('ui-lit', ['Button'])
		map.register('ui-cli', ['Button'])
		map.register('ui-react-bootstrap', ['Button'])

		const packages = map.getPackages()
		assert.ok(Array.isArray(packages), 'getPackages() should return an array')
		assert.equal(packages.length, 3, 'Should have 3 registered packages')
		assert.ok(packages.includes('ui-lit'), 'Should include ui-lit')
		assert.ok(packages.includes('ui-cli'), 'Should include ui-cli')
		assert.ok(packages.includes('ui-react-bootstrap'), 'Should include ui-react-bootstrap')
	})

	it('ArchitectureMap has index.js barrel export', () => {
		const indexPath = path.join(mapDir, 'index.js')
		assert.ok(fs.existsSync(indexPath), 'src/ArchitectureMap/index.js should exist')
	})
})

// ─── Task 2: Full Docs Standard ──────────────────────────────

describe('Task 2: Docs tab in Master IDE', () => {
	it('IDE has a Docs tab or docs-related UI element', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('Docs') || code.includes('docs') || code.includes('📖'),
			'IDE should have a Docs tab or documentation-related UI element',
		)
	})

	it('IDE has method or logic to load markdown documentation', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('_loadDocs') ||
				code.includes('_renderDocs') ||
				code.includes('fetchDoc') ||
				code.includes('README.md'),
			'IDE should have logic to load/render markdown documentation',
		)
	})

	it('IDE docs pane supports language switching (uk/en)', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// Docs should reference language/locale for doc paths
		const hasLangDocs =
			(code.includes('docs/uk') || code.includes('docs/en') || code.includes('docsLang')) &&
			(code.includes('_loadDocs') || code.includes('_renderDocs') || code.includes('README.md'))
		assert.ok(hasLangDocs, 'IDE docs should support language switching for documentation paths')
	})

	it('IDE has a docsContent or docsHtml reactive property for rendering', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('docsContent') || code.includes('docsHtml') || code.includes('docsMarkdown'),
			'IDE should have a reactive property for rendered docs content',
		)
	})
})

// ─── Task 3: Universal Interface Template ─────────────────────

describe('Task 3: InterfaceTemplate module', () => {
	const tmplDir = path.join(srcDir, 'InterfaceTemplate')
	const tmplPath = path.join(tmplDir, 'InterfaceTemplate.js')
	const tmplTestPath = path.join(tmplDir, 'InterfaceTemplate.test.js')

	it('InterfaceTemplate.js exists', () => {
		assert.ok(fs.existsSync(tmplPath), 'src/InterfaceTemplate/InterfaceTemplate.js should exist')
	})

	it('InterfaceTemplate.test.js exists', () => {
		assert.ok(
			fs.existsSync(tmplTestPath),
			'src/InterfaceTemplate/InterfaceTemplate.test.js should exist',
		)
	})

	it('InterfaceTemplate exports a class', async () => {
		const mod = await import(tmplPath)
		const TmplClass = mod.default || mod.InterfaceTemplate
		assert.ok(TmplClass, 'InterfaceTemplate should be exported')
		assert.equal(typeof TmplClass, 'function', 'InterfaceTemplate should be a class/function')
	})

	it('InterfaceTemplate has render() method that must be overridden', async () => {
		const mod = await import(tmplPath)
		const TmplClass = mod.default || mod.InterfaceTemplate
		const instance = new TmplClass()

		assert.equal(typeof instance.render, 'function', 'Should have render() method')

		// Base class render should throw or return placeholder indicating override needed
		try {
			const result = instance.render()
			// Either throws or returns indication to override
			assert.ok(
				result === undefined || result === null || typeof result === 'string',
				'Base render() should return fallback or null',
			)
		} catch (err) {
			// Throwing is also valid — means "override me"
			assert.ok(err instanceof Error && err.message, 'Error should have a message')
		}
	})

	it('InterfaceTemplate has ask() method for input', async () => {
		const mod = await import(tmplPath)
		const TmplClass = mod.default || mod.InterfaceTemplate
		const instance = new TmplClass()
		assert.equal(typeof instance.ask, 'function', 'Should have ask() method for user input')
	})

	it('InterfaceTemplate has static requiredMethods list', async () => {
		const mod = await import(tmplPath)
		const TmplClass = mod.default || mod.InterfaceTemplate
		assert.ok(
			TmplClass.requiredMethods || TmplClass.REQUIRED_METHODS,
			'InterfaceTemplate should define static requiredMethods for documentation',
		)
	})

	it('InterfaceTemplate has index.js barrel export', () => {
		const indexPath = path.join(tmplDir, 'index.js')
		assert.ok(fs.existsSync(indexPath), 'src/InterfaceTemplate/index.js should exist')
	})
})
