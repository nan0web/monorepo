import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import UIStream from './Stream.js'
import StreamEntry from './StreamEntry.js'

describe('UIStream', () => {
	it('should create processor async generator', async () => {
		const signal = new AbortController().signal
		const processorFn = async () => new StreamEntry({ value: 'result' })
		const generatorFn = UIStream.createProcessor(signal, processorFn)
		const generator = generatorFn()
		const result = await generator.next()
		assert.equal(result.value.value, 'result')
		assert.equal(result.done, false)
		const done = await generator.next()
		assert.equal(done.done, true)
	})

	it('should process stream and call callbacks', async () => {
		const signal = new AbortController().signal
		const generatorFn = async function* () {
			yield new StreamEntry({ value: 'step1' })
			yield new StreamEntry({ done: true })
		}
		let progressCount = 0
		let completeCount = 0
		await UIStream.process(
			signal,
			generatorFn,
			(progress, item) => {
				if (!progress) progressCount++
			},
			() => {},
			() => completeCount++,
		)
		assert.equal(progressCount, 1)
		assert.equal(completeCount, 1)
	})

	it('should handle abort signal', async () => {
		const controller = new AbortController()
		const generatorFn = async function* () {
			controller.abort()
			await new Promise((resolve) => setTimeout(resolve, 10)) // Simulate delay
			throw new Error('should not reach')
		}
		let errorMessage = ''
		try {
			await UIStream.process(
				controller.signal,
				generatorFn,
				() => {},
				(error) => (errorMessage = error),
				() => {},
			)
		} catch (/** @type {any} */ error) {
			errorMessage = error.message
		}
		assert.equal(errorMessage, 'The operation was aborted')
	})
})
