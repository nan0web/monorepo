import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { processI18n } from './processI18n.js'

describe('processI18n utility', () => {
	it('should return content as-is if no t function provided', () => {
		const content = 'Hello'
		assert.equal(processI18n(content, null), content)
	})

	it('should replace content with t() result when $t key is present', () => {
		const input = { $t: 'hello.world' }
		const t = (key) => (key === 'hello.world' ? 'Привіт, світе!' : key)
		assert.equal(processI18n(input, t), 'Привіт, світе!')
	})

	it('should substitute variables in string using data', () => {
		const content = 'User: {{name}}, Age: {{age}}'
		const data = { name: 'Іван', age: '30' }
		const result = processI18n(content, null, data)
		assert.equal(result, 'User: Іван, Age: 30')
	})

	it('should substitute missing variables with "—" placeholder', () => {
		const content = 'User: {{name}}, Role: {{role}}'
		const data = { name: 'Іван' }
		const result = processI18n(content, null, data)
		assert.equal(result, 'User: Іван, Role: —')
	})

	it('should recursively process array items', () => {
		const content = ['Name: {{name}}', { $t: 'welcome' }, [{ $t: 'nested' }]]
		const t = (key) => (key === 'welcome' ? 'Вітаємо' : 'Вкладений')
		const data = { name: 'Іван' }

		const result = processI18n(content, t, data)
		assert.deepEqual(result, ['Name: Іван', 'Вітаємо', ['Вкладений']])
	})

	it('should process objects with $t property without t function', () => {
		const input = { $t: 'hello.world' }
		const result = processI18n(input, null)
		assert.equal(result, 'hello.world')
	})

	it('should return input unchanged for other types', () => {
		assert.equal(processI18n(42), 42)
		assert.equal(processI18n(true), true)
		assert.equal(processI18n(null), null)
	})
})
