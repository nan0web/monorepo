import { describe, it } from 'node:test'
import assert from 'node:assert'
import InterceptorInput from './InterceptorInput.js'
import MDElement from './MDElement.js'

describe('InterceptorInput', () => {
	it('should create instance with element and empty path by default', () => {
		const element = new MDElement({ content: 'test' })
		const interceptorInput = new InterceptorInput({ element })
		assert.strictEqual(interceptorInput.element, element)
		assert.deepStrictEqual(interceptorInput.path, [])
	})

	it('should create instance with custom path', () => {
		const element = new MDElement({ content: 'test' })
		const parent = new MDElement({ content: 'parent' })
		const path = [parent]
		const interceptorInput = new InterceptorInput({ element, path })
		assert.strictEqual(interceptorInput.element, element)
		assert.deepStrictEqual(interceptorInput.path, [parent])
	})

	it('should handle path with multiple elements', () => {
		const element = new MDElement({ content: 'child' })
		const parent1 = new MDElement({ content: 'parent1' })
		const parent2 = new MDElement({ content: 'parent2' })
		const path = [parent1, parent2]
		const interceptorInput = new InterceptorInput({ element, path })
		assert.strictEqual(interceptorInput.element, element)
		assert.deepStrictEqual(interceptorInput.path, [parent1, parent2])
	})
})
