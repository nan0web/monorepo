import AuthDB from '../AuthDB.js'

/**
 * Google auth provider for AuthDB
 */
class GoogleAuthDB extends AuthDB {
	/**
	 * @param {string} token
	 * @returns {Promise<{token: string}>}
	 */
	async auth(token) {
		const result = await this.saveDocument('auth/google', { token })
		if (result?.token) this.token = result.token
		return result
	}
}

export default GoogleAuthDB
