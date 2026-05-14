import { describe, it, expect } from 'vitest'

describe('Testing output', () => {
	it.todo('should print todo with error', () => {
		throw new Error('error')
	})

	it.todo('should print todo with fail', () => {
		expect(1).toBe(0)
	})

	it.todo('should print todo with success', () => {
		expect(1).toBe(1)
	})

	it.skip('should print skip with error', () => {
		throw new Error('error')
	})

	it.skip('should print skip with fail', () => {
		expect(1).toBe(0)
	})

	it.skip('should print skip with success', () => {
		expect(1).toBe(1)
	})

	it.fails('should print error', () => {
		throw new Error('error')
	})

	it.fails('should print fail', () => {
		expect(1).toBe(0)
	})

	it('should print success', () => {
		expect(1).toBe(1)
	})
})
