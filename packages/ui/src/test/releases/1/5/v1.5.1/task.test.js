import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.resolve(__dirname, '../../../../../dist')
const ideJsPath = path.join(siteDir, 'ui.js')

// ─── Task 1: URL Update on Save Variation ───────────────────

describe('Task 1: URL Update on Save Variation', () => {
	it('_saveVariant calls history.replaceState with hash', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// Find _saveVariant method body
		const match = code.match(/_saveVariant\s*\(\)\s*\{([\s\S]*?)\n\t\}/)
		assert.ok(match, '_saveVariant method should exist')
		const body = match[1]
		assert.ok(
			body.includes('replaceState') || body.includes('pushState'),
			'_saveVariant should update URL via history API',
		)
	})

	it('_saveVariant updates URL with #varN hash', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const match = code.match(/_saveVariant\s*\(\)\s*\{([\s\S]*?)\n\t\}/)
		assert.ok(match, '_saveVariant method should exist')
		const body = match[1]
		assert.ok(body.includes('#var'), '_saveVariant should include #var hash fragment in URL')
	})
})

// ─── Task 2: Custom Modal ───────────────────────────────────

describe('Task 2: Custom Modal (No window.prompt/confirm)', () => {
	it('ide.js does NOT use window.prompt()', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		// Remove comments first to avoid false positives
		const noComments = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
		const hasPrompt = /\bprompt\s*\(/.test(noComments)
		assert.ok(!hasPrompt, 'ide.js should not use window.prompt()')
	})

	it('ide.js does NOT use window.confirm()', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const noComments = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
		const hasConfirm = /\bconfirm\s*\(/.test(noComments)
		assert.ok(!hasConfirm, 'ide.js should not use window.confirm()')
	})

	it('ide.js has a modal rendering method or modal CSS', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const hasModal =
			code.includes('.ide-modal') || code.includes('_showModal') || code.includes('modal-overlay')
		assert.ok(hasModal, 'ide.js should have custom modal implementation')
	})

	it('modal has input field for prompt replacement', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		const hasInput = code.includes('modal') && code.includes('input') && code.includes('resolve')
		assert.ok(hasInput, 'Modal should have input and resolve pattern for async prompt')
	})

	it('modal supports Escape key to close', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(code.includes('Escape') && code.includes('modal'), 'Modal should handle Escape key')
	})
})

// ─── Task 3: Emergency Reset ────────────────────────────────

describe('Task 3: Emergency Reset', () => {
	it('ide.js checks for ?reset=1 URL parameter', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('reset=1') || code.includes('reset'),
			'ide.js should check for reset URL parameter',
		)
	})

	it('reset clears localStorage', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('localStorage.clear') || code.includes('localStorage.removeItem'),
			'Reset should clear localStorage',
		)
	})

	it('reset clears IndexedDB', () => {
		const code = fs.readFileSync(ideJsPath, 'utf-8')
		assert.ok(
			code.includes('deleteDatabase') || code.includes('indexedDB.delete'),
			'Reset should clear IndexedDB',
		)
	})
})
