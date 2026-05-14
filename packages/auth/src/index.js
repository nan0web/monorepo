export { default as Scope } from './core/Scope.js'

/**
 * The Main Auth Gateway.
 */
export const Auth = {
	/**
	 * Creates a Consent Request Flow.
	 *
	 * @param {Object} req - The authorization request
	 * @param {string} req.clientId - Who is asking?
	 * @param {string[]} req.scopes - What do they want?
	 * @returns {AsyncGenerator} The flow to yield to the user.
	 */
	async *askConsent(req) {
		// Mock implementation for now
		// In real life, this yields an AuthPrompt component
		const { Prompt } = await import('../../ui/src/core/Flow.js')

		const confirmed = yield Prompt('Confirm', {
			message: `${req.clientId} requests access to: ${req.scopes.join(', ')}`,
		})

		if (!confirmed) {
			throw new Error('Access Denied by Sovereign')
		}

		return {
			token: 'mock_sovereign_token_' + Date.now(),
			expiresIn: 3600,
		}
	},
}
