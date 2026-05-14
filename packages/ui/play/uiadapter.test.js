import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { NoConsole } from '@nan0web/log'
import UiAdapter from '../src/core/UiAdapter.js'

describe('Playground UiAdapter example', () => {
	it('should work', () => {
		const console = new NoConsole()
		class ExampleUiAdapter extends UiAdapter {
			render(message) {
				console.info(message, 'Rendered')
			}
		}

		const adapter = new ExampleUiAdapter()
		adapter.render('Hello')
		assert.deepStrictEqual(console.output(), [['info', 'Hello', 'Rendered']])
		assert.ok(adapter)
		assert.ok(adapter.isReady())
	})
})
