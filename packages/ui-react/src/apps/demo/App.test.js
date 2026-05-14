import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import DemoApp from './App.js'
import { NoConsole } from '@nan0web/log'

// Моки додатків для ізольованого тестування
const mockDB = new DB({
	console: new NoConsole(),
	predefined: [
		['play/index.json', { $content: [] }],
		['apps/navigation/data/main.json', { $app: 'navigation', $content: [] }],
	],
})

/**
 * @todo fix the issue with the proper DB version in dependency to understand instanceof
 */
describe.skip('DemoApp', () => {
	let app

	beforeEach(async () => {
		await mockDB.connect()
		app = new DemoApp({
			db: mockDB,
			theme: { mode: 'light' },
			setTheme: () => {},
			navigate: () => {},
			uri: '/play/index.json',
		})
	})

	it('should initialize with required dependencies', () => {
		assert.ok(app.db, 'DB instance is required')
		assert.ok(app.theme, 'Theme is required')
		assert.ok(app.setTheme, 'setTheme function is required')
		assert.ok(app.navigate, 'navigate function is required')
		assert.strictEqual(app.uri, '/play/index.json')
	})

	it('should register all demo applications in registry', () => {
		const registeredApps = app.apps
		assert.ok(registeredApps.has('SimpleApp'), 'SimpleApp should be registered')
		assert.ok(registeredApps.has('CustomRendererApp'), 'CustomRendererApp should be registered')
		assert.ok(registeredApps.has('NavigationApp'), 'NavigationApp should be registered')
		assert.ok(registeredApps.has('ThemeSwitcherApp'), 'ThemeSwitcherApp should be registered')
	})

	it('should return valid result structure on run', async () => {
		const result = await app.run()

		assert.ok(result.content, 'Result should have $content')
		assert.ok(Array.isArray(result.content), '$content should be an array')

		const [firstBlock] = result.content
		assert.ok(firstBlock.div, 'First block should be a div container')
		assert.ok(Array.isArray(firstBlock.div), 'Div content should be an array')

		const [simpleAppBlock, customRendererBlock] = firstBlock.div
		assert.strictEqual(simpleAppBlock.App, 'SimpleApp', 'Should include SimpleApp')
		assert.strictEqual(
			customRendererBlock.App,
			'CustomRendererApp',
			'Should include CustomRendererApp',
		)
	})

	it('should handle navigation properly', async () => {
		const newUri = '/play/about.json'
		app.handleNavigation(newUri)

		assert.strictEqual(app.uri, newUri, 'URI should be updated')
		// Перевіряємо, що navigate викликався через конструктор
		// (в реальному тесті це треба мокувати через assert)
	})
})
