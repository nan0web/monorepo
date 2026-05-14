import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import DemoApp from '../src/apps/demo/App.js'
import SimpleApp from '../src/apps/demo/SimpleApp.js'
import CustomRendererApp from '../src/apps/demo/CustomRendererApp.js'

const mockDB = new DB({
	predefined: [
		['play/index.json', { $content: [] }],
		['apps/navigation/data/main.json', { $app: 'navigation', $content: [] }],
	],
})

// Інтеграційний тест перевіряє взаємодію додатків через патерн реєстрації та запуску
describe('App Integration via AppCore and run()', () => {
	it('should properly register and execute SimpleApp', async () => {
		const app = new SimpleApp({ title: 'Integration Test', uri: '/test.html' })
		const result = await app.run()

		assert.ok(result.$content, 'SimpleApp should return content')
		assert.strictEqual(result.Renderer, undefined, 'SimpleApp should not have Renderer')
	})

	it('should properly register and execute CustomRendererApp with Renderer', async () => {
		const app = new CustomRendererApp({ title: 'Integration Test', uri: '/test.html' })
		const result = await app.run()

		assert.ok(result.$content, 'CustomRendererApp should return content')
		assert.ok(result.Renderer, 'CustomRendererApp should return Renderer function')
		assert.strictEqual(typeof result.Renderer, 'function', 'Renderer should be a function')
	})

	it('should allow DemoApp to orchestrate multiple applications', async () => {
		const demoApp = new DemoApp({
			db: mockDB,
			theme: { mode: 'light' },
			setTheme: () => {},
			navigate: () => {},
			uri: '/test.html',
		})

		const result = await demoApp.run()
		const [container] = result.$content
		const [simpleAppBlock, customRendererBlock] = container.div

		assert.ok(simpleAppBlock.App === 'SimpleApp', 'Should include SimpleApp reference')
		assert.ok(
			customRendererBlock.App === 'CustomRendererApp',
			'Should include CustomRendererApp reference',
		)
		assert.ok(customRendererBlock.$title === 'Interactive Demo', 'Should pass title to sub-app')
	})
})
