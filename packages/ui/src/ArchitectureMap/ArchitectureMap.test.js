import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import ArchitectureMap from './ArchitectureMap.js'

describe('ArchitectureMap', () => {
	it('creates an empty map', () => {
		const map = new ArchitectureMap()
		assert.deepEqual(map.getPackages(), [])
		assert.deepEqual(map.getComponents(), [])
		assert.deepEqual(map.getMatrix(), {})
	})

	it('register() adds package with components', () => {
		const map = new ArchitectureMap()
		map.register('ui-lit', ['Button', 'Input'])

		assert.deepEqual(map.getPackages(), ['ui-lit'])
		assert.deepEqual(map.getComponents(), ['Button', 'Input'])
	})

	it('register() merges components from multiple packages', () => {
		const map = new ArchitectureMap()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])

		assert.deepEqual(map.getPackages(), ['ui-lit', 'ui-cli'])
		assert.deepEqual(map.getComponents(), ['Button', 'Input', 'Select'])
	})

	it('getMatrix() returns correct readiness matrix', () => {
		const map = new ArchitectureMap()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])

		const matrix = map.getMatrix()
		assert.equal(matrix.Button['ui-lit'], true)
		assert.equal(matrix.Button['ui-cli'], true)
		assert.equal(matrix.Input['ui-lit'], true)
		assert.equal(matrix.Input['ui-cli'], true)
		assert.equal(matrix.Select['ui-lit'], true)
		assert.equal(matrix.Select['ui-cli'], false)
	})

	it('getReadiness() is true only when component is in ALL packages', () => {
		const map = new ArchitectureMap()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])

		assert.equal(map.getReadiness('Button'), true)
		assert.equal(map.getReadiness('Input'), true)
		assert.equal(map.getReadiness('Select'), false)
		assert.equal(map.getReadiness('Unknown'), false)
	})

	it('getReadiness() returns false for empty map', () => {
		const map = new ArchitectureMap()
		assert.equal(map.getReadiness('Button'), false)
	})

	it('getSummary() returns stats', () => {
		const map = new ArchitectureMap()
		map.register('ui-lit', ['Button', 'Input', 'Select'])
		map.register('ui-cli', ['Button', 'Input'])

		const summary = map.getSummary()
		assert.equal(summary.total, 3)
		assert.equal(summary.ready, 2)
		assert.equal(summary.notReady, 1)
		assert.equal(summary.readyPercent, 67)
	})

	it('handles 22 core components', () => {
		const map = new ArchitectureMap()
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
		map.register('ui-cli', ['Button', 'Input', 'Select', 'Toggle', 'Confirm', 'Table', 'Tree'])
		map.register('ui-react-bootstrap', [
			'Button',
			'Input',
			'Card',
			'Modal',
			'Autocomplete',
			'Accordion',
			'LangSelect',
			'Markdown',
			'Sortable',
			'ThemeToggle',
			'Tree',
		])

		const matrix = map.getMatrix()
		assert.equal(Object.keys(matrix).length, 22)

		const summary = map.getSummary()
		assert.equal(summary.total, 22)
		// Only Button, Input, Tree are in all 3 packages
		assert.equal(summary.ready, 3)
	})
})
