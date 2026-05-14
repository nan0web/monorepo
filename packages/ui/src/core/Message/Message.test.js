import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import UiMessage from './Message.js'

import CLIInputAdapter from '../InputAdapter.js'

describe.skip('UiMessage', () => {
	it('should create basic instance', () => {
		const msg = new UiMessage({ type: 'form', body: { field: 'value' } })
		assert.equal(msg.type, 'form')
		assert.equal(msg.body.field, 'value')
		assert.ok(msg.id)
	})

	it('should validate message', () => {
		class TestMessage extends UiMessage {
			static Body = {
				name: { required: true },
			}
		}
		const msg = new TestMessage({ body: { name: 'test' } })
		const errors = msg.validate()
		assert.equal(errors.size, 0)

		const invalidMsg = new TestMessage({ body: { name: '' } })
		const invalidErrors = invalidMsg.validate()
		assert.equal(invalidErrors.size, 1)
	})

	it('should parse body from input', () => {
		class TestBody {
			name = ''
			static name = { defaultValue: 'default' }
		}
		const body = UiMessage.parseBody({ name: 'custom' }, TestBody)
		assert.equal(body.name, 'custom')

		const defaultBody = UiMessage.parseBody({}, TestBody)
		assert.equal(defaultBody.name, 'default')
	})
})

class DemoBody {
	static color = {
		help: 'Favorite colour',
		options: ['Red', 'Green', 'Blue'],
		defaultValue: 'Red',
	}
	constructor(input = {}) {
		this.color = input.color || DemoBody.color.defaultValue
	}
}

class DemoMessage extends UiMessage {
	static Body = DemoBody
	/** @type {DemoBody} */
	body
	constructor(input = {}) {
		super(input)
		this.body = new DemoBody(input.body ?? {})
	}
}

describe.skip('UiMessage with select field', () => {
	let inputAdapter, outputAdapter, mockConsole

	beforeEach(() => {
		mockConsole = new NoConsole()
		inputAdapter = new CLIInputAdapter({ console: mockConsole, stdout: mockConsole })
		outputAdapter = {
			render: async (component, props) => {
				if (component === 'Alert' && props.variant === 'error') {
					mockConsole.error(props.content)
				}
			},
			console: mockConsole,
		}
	})

	it('should show select options and accept predefined answer', async () => {
		// Setup: Initialize the message and UI
		const msg = new DemoMessage()
		const ui = { input: inputAdapter, output: outputAdapter }

		// Force predefined answer
		inputAdapter[`#` + 'answers'] = ['1']
		inputAdapter[`#` + 'cursor'] = 0

		// Capture all console.info calls
		const spy = []
		mockConsole.info = function (...args) {
			spy.push(args.join(' '))
		}

		// Action: Run requireInput
		const result = await ui.requireInput(msg)

		// Assertion: Correct field value selected
		assert.strictEqual(result.color, 'Red', "Selected color should be 'Red' for answer '1'")

		// Verify output
		const output = spy.join('\n')
		assert.ok(output.includes('Favorite colour'), 'Should display field label')
		assert.ok(output.includes('1) Red'), "Should list option 'Red'")
		assert.ok(output.includes('2) Green'), "Should list option 'Green'")
		assert.ok(output.includes('3) Blue'), "Should list option 'Blue'")
	})
})
