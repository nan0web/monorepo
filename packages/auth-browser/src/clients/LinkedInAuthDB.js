import AuthDB from '../AuthDB.js'

/**
 * LinkedIn auth provider for AuthDB
 */
class LinkedInAuthDB extends AuthDB {
	/**
	 * @param {string} token
	 * @returns {Promise<{token: string}>}
	 */
	async auth(token) {
		const result = await this.saveDocument('auth/linkedin', { token })
		if (result?.token) this.token = result.token
		return result
	}
}

export default LinkedInAuthDB
