/**
 * @docs
 * # UI Components Registry (Lit)
 *
 * Web Components implementation for authentication interfaces.
 */

// Register components with the browser simply by importing
import './auth/LoginForm.js'

export default {
	/**
	 * Allows declarative rendering in apps
	 * and registers them programmatically if needed.
	 */
	bootstrap() {
		return {
			'Auth.LoginForm': 'auth-login-form',
		}
	},
}
