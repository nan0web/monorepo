import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.resolve(__dirname, '../../../..')

// === 1. Badge: Slot support ===
import UIBadge from '../../../../packages/core/badge.js'

// === 2. Slider: Track fill ===
import UISlider from '../../../../packages/core/slider.js'

// === 3. Sortable: Numbered ===
import UISortable from '../../../../packages/core/sortable.js'

// === 4. Toast: Auto-dismiss ===
import UIToast from '../../../../packages/core/toast.js'

describe('Release v1.1.0 — Playground Interactivity & Component Polish', () => {
	// --- Badge ---
	describe('UIBadge', () => {
		it('should have render method that uses <slot>', () => {
			const proto = UIBadge.prototype
			assert.equal(typeof proto.render, 'function')
		})

		it('CSS should contain semantic variants: unread, complete, dangerous, not-found', () => {
			const css = UIBadge.styles.cssText || String(UIBadge.styles)
			for (const v of ['unread', 'complete', 'dangerous', 'not-found']) {
				assert.ok(css.includes(v), `Badge CSS must include variant "${v}"`)
			}
		})

		it('CSS should NOT contain old variants: info, success, warning, error', () => {
			const css = UIBadge.styles.cssText || String(UIBadge.styles)
			// These were the old variant selectors like :host([variant='info'])
			for (const v of ['info', 'success', 'warning', 'error']) {
				assert.ok(
					!css.includes(`variant='${v}'`),
					`Badge CSS must NOT include old selector variant='${v}'`,
				)
			}
		})
	})

	// --- Slider ---
	describe('UISlider', () => {
		it('should have _getPercentage method', () => {
			assert.equal(typeof UISlider.prototype._getPercentage, 'function')
		})

		it('_getPercentage should return correct percentage for mid-value', () => {
			const inst = { value: 50, min: 0, max: 100 }
			const pct = UISlider.prototype._getPercentage.call(inst)
			assert.equal(pct, 50)
		})

		it('_getPercentage should return 0 for min value', () => {
			const inst = { value: 0, min: 0, max: 100 }
			const pct = UISlider.prototype._getPercentage.call(inst)
			assert.equal(pct, 0)
		})

		it('_getPercentage should return 100 for max value', () => {
			const inst = { value: 100, min: 0, max: 100 }
			const pct = UISlider.prototype._getPercentage.call(inst)
			assert.equal(pct, 100)
		})

		it('_getPercentage should handle custom range', () => {
			const inst = { value: 50000, min: 1000, max: 100000 }
			const pct = UISlider.prototype._getPercentage.call(inst)
			const expected = ((50000 - 1000) / (100000 - 1000)) * 100
			assert.ok(Math.abs(pct - expected) < 0.01, `Expected ~${expected}, got ${pct}`)
		})
	})

	// --- Sortable ---
	describe('UISortable', () => {
		it('should have "numbered" in static properties', () => {
			assert.ok(UISortable.properties.numbered, 'Sortable must have numbered property')
			assert.equal(UISortable.properties.numbered.type, Boolean)
		})

		it('CSS should include .number class', () => {
			const css = UISortable.styles.cssText || String(UISortable.styles)
			assert.ok(css.includes('.number'), 'Sortable CSS must include .number class')
		})
	})

	// --- Toast ---
	describe('UIToast', () => {
		it('default duration should be > 0 (auto-dismiss)', () => {
			const inst = new UIToast()
			assert.ok(inst.duration > 0, `Toast default duration must be > 0, got ${inst.duration}`)
		})
	})

	// --- Playground setup ---
	describe('Playground Setup', () => {
		it('playground-setup.js should initialize all secondary e2e elements', async () => {
			const setupPath = path.resolve(pkgRoot, 'e2e/playground-setup.js')
			const code = await fs.readFile(setupPath, 'utf-8')

			const requiredIds = [
				'e2e-nav-min',
				'e2e-sidebar-simple',
				'e2e-markdown-code',
				'e2e-code-block-yaml',
				'e2e-table-simple',
				'e2e-select-presel',
				'e2e-accordion-closed',
				'e2e-autocomplete-hint',
				'e2e-sortable-num',
				'e2e-tree-simple',
			]

			for (const id of requiredIds) {
				assert.ok(code.includes(id), `playground-setup.js must reference "${id}"`)
			}
		})

		it('playground-setup.js should use querySelectorAll for theme toggles', async () => {
			const setupPath = path.resolve(pkgRoot, 'e2e/playground-setup.js')
			const code = await fs.readFile(setupPath, 'utf-8')
			assert.ok(
				code.includes("querySelectorAll('ui-theme-toggle')"),
				'Must use querySelectorAll for ui-theme-toggle',
			)
		})

		it('playground-setup.js should use querySelectorAll for lang selects', async () => {
			const setupPath = path.resolve(pkgRoot, 'e2e/playground-setup.js')
			const code = await fs.readFile(setupPath, 'utf-8')
			assert.ok(
				code.includes("querySelectorAll('ui-lang-select')"),
				'Must use querySelectorAll for ui-lang-select',
			)
		})
	})

	// --- Data Layer ---
	describe('Data Layer', () => {
		it('index.yaml should NOT contain duration="0" for toasts', async () => {
			const yamlPath = path.resolve(pkgRoot, 'data/play/index.yaml')
			const yaml = await fs.readFile(yamlPath, 'utf-8')
			assert.ok(!yaml.includes('duration="0"'), 'index.yaml must not have duration="0" on toasts')
		})

		it('index.yaml should contain new badge variants', async () => {
			const yamlPath = path.resolve(pkgRoot, 'data/play/index.yaml')
			const yaml = await fs.readFile(yamlPath, 'utf-8')
			for (const v of ['unread', 'complete', 'dangerous', 'not-found']) {
				assert.ok(yaml.includes(v), `index.yaml must reference badge variant "${v}"`)
			}
		})

		it('index.yaml should contain sortable with numbered attribute', async () => {
			const yamlPath = path.resolve(pkgRoot, 'data/play/index.yaml')
			const yaml = await fs.readFile(yamlPath, 'utf-8')
			assert.ok(
				yaml.includes('numbered'),
				'index.yaml must contain sortable with "numbered" attribute',
			)
		})
	})

	// --- Unit test integrity ---
	describe('Test Integrity', () => {
		it('badge.test.js should use new variant names', async () => {
			const testPath = path.resolve(pkgRoot, 'packages/core/test/badge.test.js')
			const code = await fs.readFile(testPath, 'utf-8')
			for (const v of ['unread', 'complete', 'dangerous', 'not-found']) {
				assert.ok(code.includes(v), `badge.test.js must reference variant "${v}"`)
			}
		})
	})
})
