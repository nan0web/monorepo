import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import InterfaceTemplate from './InterfaceTemplate.js'

describe('InterfaceTemplate', () => {
	it('is a class that can be instantiated', () => {
		const tmpl = new InterfaceTemplate()
		assert.ok(tmpl instanceof InterfaceTemplate)
	})

	it('has static requiredMethods', () => {
		assert.ok(Array.isArray(InterfaceTemplate.requiredMethods))
		assert.ok(InterfaceTemplate.requiredMethods.includes('render'))
		assert.ok(InterfaceTemplate.requiredMethods.includes('ask'))
	})

	it('render() throws when not overridden', () => {
		const tmpl = new InterfaceTemplate()
		assert.throws(() => tmpl.render(), /must be overridden/)
	})

	it('ask() rejects when not overridden', async () => {
		const tmpl = new InterfaceTemplate()
		await assert.rejects(() => tmpl.ask('test'), /must be overridden/)
	})

	it('validate() returns missing methods for base class', () => {
		const tmpl = new InterfaceTemplate()
		const missing = tmpl.validate()
		assert.ok(missing.includes('render'))
		assert.ok(missing.includes('ask'))
	})

	it('validate() returns empty array for complete subclass', () => {
		class CliUI extends InterfaceTemplate {
			name = 'cli'
			render(data) {
				return String(data)
			}
			async ask(prompt) {
				return 'answer'
			}
		}
		const cli = new CliUI()
		const missing = cli.validate()
		assert.equal(missing.length, 0)
	})

	it('info() returns interface metadata', () => {
		const tmpl = new InterfaceTemplate()
		const info = tmpl.info()
		assert.equal(info.name, 'base')
		assert.ok(Array.isArray(info.requiredMethods))
		assert.equal(info.isComplete, false)
	})

	it('subclass can override and work correctly', () => {
		class WebUI extends InterfaceTemplate {
			name = 'web'
			render(data) {
				return `<div>${data}</div>`
			}
			async ask(prompt) {
				return prompt
			}
		}
		const web = new WebUI()
		assert.equal(web.name, 'web')
		assert.equal(web.render('Hello'), '<div>Hello</div>')
		assert.equal(web.info().isComplete, true)
	})
})
