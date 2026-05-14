import AuthDB from '../AuthDB.js'

/**
 * Implements Facebook social authentication for AuthDB
 */
class FacebookAuthDB extends AuthDB {
	/**
	 * @param {string} accessToken - Facebook access token
	 * @returns {Promise<{token: string}>} Server response with authentication token
	 */
	async auth(accessToken) {
		const result = await this.saveDocument('auth/facebook', { token: accessToken })
		if (result?.token) this.token = result.token
		return result
	}
}

export default FacebookAuthDB
