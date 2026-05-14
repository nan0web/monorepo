import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { BreadcrumbModel } from './index.js'

describe('BreadcrumbModel', () => {
	// ── Construction ──

	it('creates empty breadcrumb by default', () => {
		const bc = new BreadcrumbModel()
		assert.equal(bc.depth, 0)
		assert.equal(bc.path, '/')
		assert.equal(bc.toString(), '')
		assert.equal(bc.canGoBack(), false)
	})

	it('accepts items as strings and auto-slugifies paths', () => {
		const bc = new BreadcrumbModel({ items: ['Home', 'Sandbox'] })
		assert.equal(bc.depth, 2)
		assert.equal(bc.items[0].label, 'Home')
		assert.equal(bc.items[0].path, 'home')
		assert.equal(bc.items[1].path, 'sandbox')
	})

	it('accepts items as {label, path} objects', () => {
		const bc = new BreadcrumbModel({
			items: [
				{ label: '🏖 Sandbox', path: 'sandbox' },
				{ label: 'Кнопка', path: 'button' },
			],
		})
		assert.equal(bc.path, '/sandbox/button')
		assert.equal(bc.toString(), '🏖 Sandbox › Кнопка')
	})

	// ── Navigation API ──

	it('push() adds items to the stack', () => {
		const bc = new BreadcrumbModel()
		bc.push('Home', 'home')
		bc.push('Sandbox')
		bc.push('Button')

		assert.equal(bc.depth, 3)
		assert.equal(bc.path, '/home/sandbox/button')
		assert.deepEqual(bc.labels, ['Home', 'Sandbox', 'Button'])
		assert.deepEqual(bc.segments, ['home', 'sandbox', 'button'])
	})

	it('pop() removes and returns the last item', () => {
		const bc = new BreadcrumbModel()
		bc.push('Home', 'home')
		bc.push('Sandbox')

		const popped = bc.pop()
		assert.equal(popped?.label, 'Sandbox')
		assert.equal(bc.depth, 1)
		assert.equal(bc.path, '/home')
	})

	it('pop() returns undefined on empty stack', () => {
		const bc = new BreadcrumbModel()
		assert.equal(bc.pop(), undefined)
	})

	it('canGoBack() is true only when depth > 1', () => {
		const bc = new BreadcrumbModel()
		assert.equal(bc.canGoBack(), false)

		bc.push('Root')
		assert.equal(bc.canGoBack(), false) // 1 item — nowhere to go back

		bc.push('Child')
		assert.equal(bc.canGoBack(), true) // 2 items — can pop to Root
	})

	it('navigateTo() truncates the stack to target depth', () => {
		const bc = new BreadcrumbModel()
		bc.push('A').push('B').push('C').push('D')
		assert.equal(bc.depth, 4)

		bc.navigateTo(1)
		assert.equal(bc.depth, 2)
		assert.deepEqual(bc.labels, ['A', 'B'])
	})

	it('current returns the last item', () => {
		const bc = new BreadcrumbModel()
		assert.equal(bc.current, undefined)

		bc.push('Home')
		assert.equal(bc.current?.label, 'Home')

		bc.push('Sub')
		assert.equal(bc.current?.label, 'Sub')
	})

	// ── Path / URL Serialization ──

	it('path returns "/" for empty stack', () => {
		assert.equal(new BreadcrumbModel().path, '/')
	})

	it('path joins segments with /', () => {
		const bc = new BreadcrumbModel()
		bc.push('App', 'app').push('Settings', 'settings')
		assert.equal(bc.path, '/app/settings')
	})

	it('toURL() returns segments without leading /', () => {
		const bc = new BreadcrumbModel()
		bc.push('App', 'app').push('Settings', 'settings')
		assert.equal(bc.toURL(), 'app/settings')
	})

	it('toURI() returns DBFS document URI (no extension)', () => {
		const bc = new BreadcrumbModel()
		bc.push('Sandbox', 'sandbox').push('Button', 'button')
		assert.equal(bc.toURI(), 'sandbox/button/index')
		assert.equal(bc.toURI('config'), 'sandbox/button/config')
	})

	it('toURI() handles empty stack', () => {
		assert.equal(new BreadcrumbModel().toURI(), 'index')
	})

	it('toDataPath() returns path relative to db.root', () => {
		const bc = new BreadcrumbModel()
		bc.push('Sandbox', 'sandbox').push('Button', 'button')
		assert.equal(bc.toDataPath(), 'sandbox/button/index.yaml')
		assert.equal(bc.toDataPath('t.yaml'), 'sandbox/button/t.yaml')
	})

	it('toDataPath() handles empty stack', () => {
		assert.equal(new BreadcrumbModel().toDataPath(), 'index.yaml')
	})

	// ── Static: fromPath() ──

	it('fromPath() reconstructs from URL path', () => {
		const bc = BreadcrumbModel.fromPath('/sandbox/button/export')
		assert.equal(bc.depth, 3)
		assert.deepEqual(bc.segments, ['sandbox', 'button', 'export'])
		assert.deepEqual(bc.labels, ['sandbox', 'button', 'export']) // no label map
	})

	it('fromPath() uses labelMap for display names', () => {
		const bc = BreadcrumbModel.fromPath('/sandbox/button', {
			sandbox: '🏖 Sandbox',
			button: 'Кнопка',
		})
		assert.equal(bc.toString(), '🏖 Sandbox › Кнопка')
		assert.equal(bc.path, '/sandbox/button')
	})

	it('fromPath() handles leading slash or no slash', () => {
		const a = BreadcrumbModel.fromPath('/a/b')
		const b = BreadcrumbModel.fromPath('a/b')
		assert.deepEqual(a.segments, b.segments)
	})

	// ── Static: slugify() ──

	it('slugify() handles Latin labels', () => {
		assert.equal(BreadcrumbModel.slugify('My App'), 'my-app')
		assert.equal(BreadcrumbModel.slugify('Hello World!'), 'hello-world')
	})

	it('slugify() handles Cyrillic labels', () => {
		assert.equal(BreadcrumbModel.slugify('Кнопка'), 'кнопка')
		assert.equal(BreadcrumbModel.slugify('Моя Кнопка'), 'моя-кнопка')
	})

	it('slugify() handles emoji by stripping them', () => {
		assert.equal(BreadcrumbModel.slugify('🏖 Sandbox'), 'sandbox')
	})

	// ── toString() ──

	it('toString() uses custom separator', () => {
		const bc = new BreadcrumbModel({ separator: '>' })
		bc.push('A').push('B').push('C')
		assert.equal(bc.toString(), 'A > B > C')
	})

	// ── Generator ──

	it('run() yields show intent with breadcrumb display then returns path data', async () => {
		const bc = new BreadcrumbModel()
		bc.push('Home', 'home').push('Sub', 'sub')

		const gen = bc.run()

		const log = await gen.next()
		assert.equal(log.value.type, 'show')
		assert.equal(log.value.component, 'Breadcrumbs')
		assert.equal(log.value.model.path, '/home/sub')
		assert.equal(log.value.message, 'Navigated to Context')

		const result = await gen.next()
		assert.equal(result.done, true)
		assert.equal(result.value.data.path, '/home/sub')
		assert.equal(result.value.data.depth, 2)
	})
})
