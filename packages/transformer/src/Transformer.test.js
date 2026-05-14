import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import Transformer from './index.js'

describe('Transformer', () => {
	let transformer

	beforeEach(() => {
		transformer = new Transformer()
	})

	describe('addTransformer', () => {
		it('should add a transformer to the list', () => {
			const mockTransformer = { encode: () => {}, decode: () => {} }
			transformer.addTransformer(mockTransformer)
			assert.ok(transformer.transformers.includes(mockTransformer))
		})
	})

	describe('removeTransformer', () => {
		it('should remove a transformer from the list', () => {
			const mockTransformer = { encode: () => {}, decode: () => {} }
			transformer.addTransformer(mockTransformer)
			transformer.removeTransformer(mockTransformer)
			assert.ok(!transformer.transformers.includes(mockTransformer))
		})

		it('should do nothing if transformer not in list', () => {
			const mockTransformer = { encode: () => {}, decode: () => {} }
			transformer.removeTransformer(mockTransformer)
			assert.deepEqual(transformer.transformers, [])
		})
	})

	describe('encode', () => {
		it('should process data through all transformers with encode method', async () => {
			const t1 = { encode: async (data) => data + '1' }
			const t2 = { encode: async (data) => data + '2' }
			transformer.addTransformer(t1)
			transformer.addTransformer(t2)

			const result = await transformer.encode('start')
			assert.strictEqual(result, 'start12')
		})

		it('should skip transformers without encode method', async () => {
			const t1 = { decode: () => {} }
			const t2 = { encode: async (data) => data + 'X' }
			transformer.addTransformer(t1)
			transformer.addTransformer(t2)

			const result = await transformer.encode('data')
			assert.strictEqual(result, 'dataX')
		})

		it('should handle asynchronous encode methods', async () => {
			const t1 = { encode: async (data) => data + 'A' }
			transformer.addTransformer(t1)
			const result = await transformer.encode('foo')
			assert.strictEqual(result, 'fooA')
		})
	})

	describe('decode', () => {
		it('should process data through all transformers with decode method', async () => {
			const t1 = { decode: async (data) => data + '1' }
			const t2 = { decode: async (data) => data + '2' }
			transformer.addTransformer(t1)
			transformer.addTransformer(t2)

			const result = await transformer.decode('start')
			assert.strictEqual(result, 'start12')
		})

		it('should skip transformers without decode method', async () => {
			const t1 = { encode: () => {} }
			const t2 = { decode: async (data) => data + 'X' }
			transformer.addTransformer(t1)
			transformer.addTransformer(t2)

			const result = await transformer.decode('data')
			assert.strictEqual(result, 'dataX')
		})

		it('should handle asynchronous decode methods', async () => {
			const t1 = { decode: async (data) => data + 'A' }
			transformer.addTransformer(t1)
			const result = await transformer.decode('foo')
			assert.strictEqual(result, 'fooA')
		})
	})
})
