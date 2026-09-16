import { test } from 'node:test'
import assert from 'node:assert/strict'
import { VisualAdapter } from './VisualAdapter.js'

test('VisualAdapter renders ask intent', () => {
	const intent = {
		type: 'ask',
		input: 'sensor_reading',
		schema: { help: 'Read temperature' },
	}
	const result = VisualAdapter.render(intent)
	assert.match(result, /\[ROBO SENSE\] "Read temperature"/)
})

test('VisualAdapter renders log intent', () => {
	const intent = {
		type: 'log',
		level: 'info',
		message: 'Moving arm forward',
	}
	const result = VisualAdapter.render(intent)
	assert.equal(result, '[ROBO ACT] "Moving arm forward"')
})
