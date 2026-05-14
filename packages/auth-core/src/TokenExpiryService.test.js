import { suite, describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import TokenExpiryService from './TokenExpiryService.js'

suite('TokenExpiryService', () => {
	/** @type {TokenExpiryService} */
	let service

	beforeEach(() => {
		service = new TokenExpiryService(1000) // 1 second default lifetime
	})

	describe('constructor', () => {
		it('should create with default lifetime', () => {
			const defaultService = new TokenExpiryService()
			assert.ok(defaultService instanceof TokenExpiryService)
		})

		it('should create with custom lifetime', () => {
			const customService = new TokenExpiryService(5000)
			assert.equal(String(customService), '5.000s')
		})
	})

	describe('isValid', () => {
		it('should validate fresh tokens', () => {
			const freshToken = new Date(Date.now() - 500) // 0.5 seconds old
			assert.equal(service.isValid(freshToken), true)
		})

		it('should invalidate expired tokens', () => {
			const expiredToken = new Date(Date.now() - 1500) // 1.5 seconds old
			assert.equal(service.isValid(expiredToken), false)
		})

		it('should use custom lifetime', () => {
			const token = new Date(Date.now() - 1500) // 1.5 seconds old
			assert.equal(service.isValid(token, 2000), true) // Valid with 2s lifetime
		})

		it('should reject non-Date inputs', () => {
			assert.throws(() => service.isValid('not-a-date'), TypeError)
		})
	})

	describe('getExpiryDate', () => {
		it('should calculate expiry date correctly', () => {
			const issuedAt = new Date('2023-01-01T00:00:00Z')
			const expiry = service.getExpiryDate(issuedAt, 1000)
			const expectedExpiry = new Date('2023-01-01T00:00:01Z')
			assert.equal(expiry.getTime(), expectedExpiry.getTime())
		})

		it('should use default issuedAt and lifetime', () => {
			const expiry = service.getExpiryDate()
			const expectedExpiry = new Date(Date.now() + 1000)
			// Allow small time difference due to execution time
			assert.ok(Math.abs(expiry.getTime() - expectedExpiry.getTime()) < 100)
		})
	})

	describe('extendLifetime', () => {
		it('should extend lifetime but no more than a defaultLifetime', () => {
			const issuedAt = new Date(Date.now() - 500) // 0.5 seconds old
			const extended = service.extendLifetime(issuedAt, 1000) // Add 1 second
			assert.equal(extended, 1000) // because defaultLifetime is 1000
		})

		it('should extend lifetime by specified milliseconds', () => {
			const issuedAt = new Date(Date.now() - 500) // 0.5 seconds old
			const service = new TokenExpiryService(100_000) // 1 second default lifetime
			const extended = service.extendLifetime(issuedAt, 1000) // Add 1 second
			assert.equal(extended, 1500)
		})

		it('should not exceed maxLifetime', () => {
			const issuedAt = new Date(Date.now() - 500) // 0.5 seconds old
			const extended = service.extendLifetime(issuedAt, 2000, 1000) // Try to add 2s with 1s max
			assert.equal(extended, 1000) // Should be capped at 1s
		})
	})

	describe('from', () => {
		it('should return existing instance', () => {
			const existing = new TokenExpiryService(2000)
			const fromInstance = TokenExpiryService.from(existing)
			assert.equal(fromInstance, existing)
		})

		it('should create new instance from number', () => {
			const fromNumber = TokenExpiryService.from(3000)
			assert.ok(fromNumber instanceof TokenExpiryService)
			assert.equal(String(fromNumber), '3.000s')
		})
	})
})
