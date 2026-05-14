import test from 'node:test'
import assert from 'node:assert'
import { Auth } from './index.js'
import { Scope } from './core/Scope.js'
// Importing directly from source to bypass package resolution issues during dev
import { runFlow } from '../../ui/src/core/Flow.js'

test('Auth.askConsent flow', async (t) => {
	await t.test('issues token on user confirmation', async () => {
		const request = {
			clientId: 'test.app',
			scopes: [Scope.IDENTITY_EMAIL],
		}

		// Adapter that says "YES"
		const sovereignAdapter = {
			executePrompt: async (p) => {
				if (p.name === 'Confirm') {
					return { value: true }
				}
			},
		}

		const result = await runFlow(Auth.askConsent(request), sovereignAdapter)

		assert.ok(result.token.startsWith('mock_sovereign_token_'))
		assert.strictEqual(result.expiresIn, 3600)
	})

	await t.test('throws error on user denial', async () => {
		const request = {
			clientId: 'malicious.app',
			scopes: [Scope.PAYMENT_CHARGE],
		}

		// Adapter that says "NO"
		const sovereignAdapter = {
			executePrompt: async () => ({ value: false }),
		}

		await assert.rejects(runFlow(Auth.askConsent(request), sovereignAdapter), /Access Denied/)
	})
})
