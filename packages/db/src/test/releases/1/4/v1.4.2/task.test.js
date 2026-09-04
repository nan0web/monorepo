import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { Data, DB } from '../../../../../index.js'

describe('Release v1.4.2: Preserving literal slashes in keys', () => {
	describe('1. Data.flatten() — escapes literal delimiters in keys', () => {
		it('preserves keys containing "/" in flattened output', () => {
			const obj = { 'Manage / Update': 'value' }
			const flat = Data.flatten(obj)

			const keys = Object.keys(flat)
			assert.equal(keys.length, 1, 'Should create exactly one flat key')
			assert.equal(flat[keys[0]], 'value')
		})

		it('does not escape "/" used as real path delimiter', () => {
			const obj = { a: { b: 1 } }
			const flat = Data.flatten(obj)
			assert.deepEqual(flat, { 'a/b': 1 })
		})
	})

	describe('2. Data.unflatten() — roundtrip with literal delimiters', () => {
		it('roundtrip: flatten -> unflatten preserves keys with "/"', () => {
			const original = { 'Manage / Update Agent Workflows': 'translation' }
			const roundtripped = Data.unflatten(Data.flatten(original))
			assert.deepEqual(roundtripped, original)
		})

		it('roundtrip: mixed regular and slash keys', () => {
			const original = {
				title: 'Hello',
				'Manage / Update': 'Management',
				nested: { deep: 'value' },
				'Input / Output': 'I/O',
			}
			const roundtripped = Data.unflatten(Data.flatten(original))
			assert.deepEqual(roundtripped, original)
		})

		it('roundtrip: deeply nested object with slash keys at leaf level', () => {
			const original = {
				menu: {
					'File / Open': 'Open',
					'File / Save': 'Save',
					normal: 'regular',
				},
			}
			const roundtripped = Data.unflatten(Data.flatten(original))
			assert.deepEqual(roundtripped, original)
		})
	})

	describe('3. Data.find() — finds values by keys with "/"', () => {
		it('finds top-level key with "/" via array path', () => {
			const obj = { 'Manage / Update': 'value' }
			const result = Data.find(['Manage / Update'], obj)
			assert.equal(result, 'value')
		})

		it('finds nested key with "/" via array path', () => {
			const obj = { menu: { 'File / Open': 'Open' } }
			const result = Data.find(['menu', 'File / Open'], obj)
			assert.equal(result, 'Open')
		})

		it('finds nested key with "/" via parent string path', () => {
			const obj = { menu: { 'File / Open': 'Open' } }
			const result = Data.find('menu', obj)
			assert.equal(result['File / Open'], 'Open')
		})
	})

	describe('4. DB.resolveReferences() — fetch preserves slash keys', () => {
		it('resolveReferences roundtrip does not split slash keys', async () => {
			const db = new DB({ connected: true })
			const data = {
				'Manage / Update': 'Management',
				normal: 'regular',
			}
			const result = await db.resolveReferences(data)
			assert.deepEqual(result, data)
		})
	})

	describe('5. Backward compatibility — existing behavior preserved', () => {
		it('standard nested objects flatten and unflatten correctly', () => {
			const original = { a: { b: { c: 1 } } }
			assert.deepEqual(Data.unflatten(Data.flatten(original)), original)
		})

		it('arrays flatten and unflatten correctly', () => {
			const original = { items: [1, 2, 3] }
			assert.deepEqual(Data.unflatten(Data.flatten(original)), original)
		})

		it('empty objects and arrays are preserved', () => {
			const original = { empty: {}, arr: [] }
			assert.deepEqual(Data.unflatten(Data.flatten(original)), original)
		})
	})
})
