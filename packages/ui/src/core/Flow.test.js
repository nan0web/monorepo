import test from 'node:test'
import assert from 'node:assert'
import {
	runFlow,
	flow,
	View,
	Prompt,
	Stream,
	Action,
	Alert,
	Input,
	Select,
	Confirm,
	Beep,
	Move,
} from './Flow.js'

test('Flow.js — Yield-Based UI Architecture', async (t) => {
	await t.test('Component factories create correct types', () => {
		const view = View('Alert', { message: 'Hello' })
		assert.strictEqual(view.type, 'view')
		assert.strictEqual(view.name, 'Alert')
		assert.deepStrictEqual(view.props, { message: 'Hello' })

		const prompt = Prompt('Select', { choices: ['a', 'b'] })
		assert.strictEqual(prompt.type, 'prompt')
		assert.strictEqual(prompt.name, 'Select')

		const stream = Stream('Spinner', { message: 'Loading...' })
		assert.strictEqual(stream.type, 'stream')
		assert.strictEqual(stream.name, 'Spinner')
	})

	await t.test('Convenience factories work correctly', () => {
		const alert = Alert({ variant: 'success', message: 'Done!' })
		assert.strictEqual(alert.type, 'view')
		assert.strictEqual(alert.name, 'Alert')
		assert.strictEqual(alert.props.variant, 'success')

		const input = Input({ message: 'Enter name:' })
		assert.strictEqual(input.type, 'prompt')
		assert.strictEqual(input.name, 'Input')

		const select = Select({ message: 'Choose:', choices: [1, 2, 3] })
		assert.strictEqual(select.type, 'prompt')
		assert.strictEqual(select.name, 'Select')
		assert.deepStrictEqual(select.props.choices, [1, 2, 3])
	})

	await t.test('runFlow executes simple flow with mock adapter', async () => {
		const rendered = []
		const mockAdapter = {
			renderView: (component) => {
				rendered.push(component)
			},
			executePrompt: async (component) => {
				if (component.name === 'Input') {
					return { value: 'TestUser', cancelled: false }
				}
				if (component.name === 'Confirm') {
					return { value: true, cancelled: false }
				}
				return { value: null }
			},
		}

		async function* testFlow() {
			yield Alert({ message: 'Welcome!' })
			const name = yield Input({ message: 'Name:' })
			yield Alert({ message: `Hello, ${name}!` })
			const confirmed = yield Confirm({ message: 'Continue?' })
			return { name, confirmed }
		}

		const result = await runFlow(testFlow(), mockAdapter)

		assert.strictEqual(result.name, 'TestUser')
		assert.strictEqual(result.confirmed, true)
		assert.strictEqual(rendered.length, 2) // Two Alert components
		assert.strictEqual(rendered[0].props.message, 'Welcome!')
		assert.strictEqual(rendered[1].props.message, 'Hello, TestUser!')
	})

	await t.test('runFlow handles nested flows with yield*', async () => {
		const steps = []
		const mockAdapter = {
			renderView: (c) => steps.push(`view:${c.name}`),
			executePrompt: async (c) => ({ value: `value_${c.name}` }),
		}

		async function* childFlow() {
			yield Alert({ message: 'Child started' })
			const val = yield Input({ message: 'Child input' })
			return val
		}

		async function* parentFlow() {
			yield Alert({ message: 'Parent started' })
			const childResult = yield flow(childFlow)
			yield Alert({ message: `Child returned: ${childResult}` })
			return childResult
		}

		const result = await runFlow(parentFlow(), mockAdapter)

		assert.strictEqual(result, 'value_Input')
		assert.deepStrictEqual(steps, [
			'view:Alert', // Parent started
			'view:Alert', // Child started
			'view:Alert', // Child returned
		])
	})

	await t.test('runFlow throws CancelError when user cancels prompt', async () => {
		const mockAdapter = {
			renderView: () => {},
			executePrompt: async () => ({ value: null, cancelled: true }),
		}

		async function* cancelFlow() {
			yield Input({ message: 'This will be cancelled' })
		}

		await assert.rejects(
			runFlow(cancelFlow(), mockAdapter),
			(err) => err.name === 'CancelError' || err.message.includes('cancelled'),
		)
	})

	await t.test('runFlow handles string yields as Text view', async () => {
		const rendered = []
		const mockAdapter = {
			renderView: (c) => rendered.push(c),
		}

		async function* stringFlow() {
			yield 'Hello, World!'
			yield 'Another line'
		}

		await runFlow(stringFlow(), mockAdapter)

		assert.strictEqual(rendered.length, 2)
		assert.strictEqual(rendered[1].name, 'Text')
		assert.strictEqual(rendered[1].props.content, 'Another line')
	})

	await t.test('runFlow executes Action components', async () => {
		const actions = []
		const mockAdapter = {
			executeAction: async (c) => {
				actions.push(c.name)
				return 'action_result'
			},
		}

		async function* actionFlow() {
			const res = yield Beep()
			yield Move({ x: 10 })
			return res
		}

		const result = await runFlow(actionFlow(), mockAdapter)
		assert.strictEqual(result, 'action_result')
		assert.deepStrictEqual(actions, ['Beep', 'Move'])
	})

	await t.test('Simulation: Voice Interface Flow', async () => {
		const logs = []
		const voiceAdapter = {
			renderView: async (c) => logs.push(`TTS: ${c.props.message || c.props.content}`),
			executePrompt: async (c) => {
				logs.push(`TTS(Ask): ${c.props.message}`)
				return { value: 'User command' }
			},
			executeAction: async (c) => logs.push(`AUDIO: ${c.name}`),
		}

		async function* voiceBot() {
			yield Alert({ message: 'Hello! I am your voice assistant.' })
			yield Beep()
			const cmd = yield Input({ message: 'How can I help you?' })
			yield Alert({ message: `I heard: ${cmd}` })
		}

		await runFlow(voiceBot(), voiceAdapter)

		assert.deepStrictEqual(logs, [
			'TTS: Hello! I am your voice assistant.',
			'AUDIO: Beep',
			'TTS(Ask): How can I help you?',
			'TTS: I heard: User command',
		])
	})
})
