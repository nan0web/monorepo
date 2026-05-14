/**
 * @module @nan0web/auth.app/ui-api
 * API Module exports for App-in-App integration.
 */

/**
 * Creates and Configures the Auth API Middleware
 */
export const AuthMiddleware = {
	// Implementation will use AuthPolicy.js
}

/**
 * Extension for registering auth routes to a host router
 */
export async function setupApi(router, options = {}) {
	const { default: createApiServer } = await import('./main.js')
	// ... logic to apply routes and middleware ...
}
