import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AuthPolicy } from '../../../../../domain/AuthPolicy.js'

/**
 * Note: User Stories US-01 to US-23, and US-33 to US-35 (Registrations, Logins, CLI, etc.)
 * are covered by canonical tests located in:
 * - src/AuthApp.test.js
 * - src/ui-cli/AuthCLI.test.js
 */

describe('Release v1.1.0: AuthPolicy & URL Access Control', () => {
	describe('US-24, 25, 26, 27: isProtected & Override rules', () => {
		const policy = new AuthPolicy({
			protectedPaths: ['/api/**'],
			publicPaths: ['/api/health', '/api/status'],
		})

		it('US-24: Protected path requires authentication', () => {
			assert.equal(policy.isProtected('/api/users'), true)
		})

		it('US-25: Public path is always accessible', () => {
			assert.equal(policy.isProtected('/api/health'), false)
			assert.equal(policy.isProtected('/api/status'), false)
		})

		it('US-26: Public path overrides protected path', () => {
			// '/api/health' matches both '/api/**' and '/api/health'
			// Expected to return false because public wins
			assert.equal(policy.isProtected('/api/health'), false)
		})

		it('US-27: Unprotected path outside of rules remains accessible', () => {
			assert.equal(policy.isProtected('/public/page'), false)
		})
	})

	describe('US-28: Glob matching (** vs *)', () => {
		it('** covers any depth', () => {
			const policy = new AuthPolicy({ protectedPaths: ['/api/**'] })
			assert.equal(policy.isProtected('/api/users'), true)
			assert.equal(policy.isProtected('/api/v2/users/123'), true)
		})

		it('* covers only a single segment', () => {
			const policy = new AuthPolicy({ protectedPaths: ['/*/users'] })
			assert.equal(policy.isProtected('/api/users'), true)
			// Must be false because /api/v2 has two segments before /users
			assert.equal(policy.isProtected('/api/v2/users'), false)
		})
	})

	describe('US-32: Custom strategies', () => {
		it('supports generating an AuthPolicy with custom apikey strategy', () => {
			const policy = new AuthPolicy({ strategy: 'apikey' })
			assert.equal(policy.strategy, 'apikey')
		})
	})

	describe('US-36: App-in-App export validation', () => {
		it('Module exports the middleware setup in src/ui-api/index.js', async () => {
			let apiModule
			try {
				apiModule = await import('../../../../../ui-api/index.js')
			} catch (e) {
				assert.fail('src/ui-api/index.js does not exist or fails to load: ' + e.message)
			}

			// We expect the module to export something that can setup the router middleware
			assert.ok(apiModule.setupApi, 'Expected exported setupApi function')
			// Assuming there's AuthMiddleware we can import or verify
			assert.ok(apiModule.AuthMiddleware, 'Expected AuthMiddleware export')
		})
	})
})
