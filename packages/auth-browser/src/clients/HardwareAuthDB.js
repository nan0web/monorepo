import AuthDB from '../AuthDB.js'

/**
 * Hardware key auth provider for AuthDB
 */
class HardwareAuthDB extends AuthDB {
	/**
	 * @param {string} keyId
	 * @param {string} challenge
	 * @returns {Promise<{token: string}>}
	 */
	async auth(keyId, challenge) {
		const result = await this.saveDocument('auth/hardware', { keyId, challenge })
		if (result?.token) this.token = result.token
		return result
	}
}

export default HardwareAuthDB
