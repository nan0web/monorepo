/**
 * Registration contract for auth application
 * Defines integration points for all UI surfaces
 *
 * @example
 * // Default integration
 * const setup = AuthApp.register()
 *
 * // Custom API prefix
 * const setup = AuthApp.register({ api: { prefix: 'auth2' } })
 */
export default {
	/**
	 * Create registration configuration
	 * @param {Object} [configuration] - Custom integration settings
	 * @param {Object} [configuration.api] - API configuration
	 * @param {string} [configuration.api.prefix] - Custom API prefix
	 * @param {Object} [configuration.cli] - CLI configuration
	 * @param {string} [configuration.cli.command] - Custom CLI command
	 * @returns {Object} Integration setup objects
	 */
	register(configuration = {}) {
		const namespace = configuration.namespace || 'auth'

		return {
			api: {
				prefix: configuration.api?.prefix || namespace,
				setup: async (router) => {
					const { default: createApiServer } = await import('./ui-api/main.js')
					createApiServer().applyRoutes(router)
				},
				owner: '@nan0web/auth.app',
			},
			cli: {
				command: configuration.cli?.command || namespace,
				setup: async () => {
					const { default: cliMain } = await import('./ui-cli/main.js')
					return cliMain
				},
				owner: '@nan0web/auth.app',
			},
			react: {
				namespace,
				setup: (componentRegistry) => {
					componentRegistry.register(
						'Auth.LoginForm',
						() => import('./ui-react/auth/LoginForm.jsx'),
					)
				},
				owner: '@nan0web/auth.app',
			},
			service: {
				setup: async (options = {}) => {
					const { default: AuthApp } = await import('./AuthApp.js')
					const app = new AuthApp(options)
					await app.init()
					return app
				},
				owner: '@nan0web/auth.app',
			},
		}
	},
}
