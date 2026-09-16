import { test } from 'node:test'
import assert from 'node:assert/strict'
import { VisualAdapter } from './VisualAdapter.js'

test('VisualAdapter renders ask intent', () => {
	const intent = {
		type: 'ask',
		input: 'user_command',
		schema: { help: 'Say something' },
	}
	const result = VisualAdapter.render(intent)
	assert.match(result, /\[VOICE PROMPT\] "Say something"/)
})

test('VisualAdapter renders log intent', () => {
	const intent = {
		type: 'log',
		level: 'info',
		message: 'Audio playback started',
	}
	const result = VisualAdapter.render(intent)
	assert.equal(result, '[AUDIO LOG] INFO: "Audio playback started"')
})
