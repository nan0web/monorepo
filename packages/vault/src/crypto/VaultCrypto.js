import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(crypto.scrypt)

/**
 * VaultCrypto - Cryptographic primitives for Vault.
 * Uses Argon2/scrypt key derivation + AES-256-GCM / ChaCha20-Poly1305 AEAD.
 */
export class VaultCrypto {
	static MAGIC = 'NAN0VAULT'
	static VERSION = 1

	/**
	 * Generate a cryptographically secure random salt.
	 * @param {number} [bytes=32]
	 * @returns {Buffer}
	 */
	static generateSalt(bytes = 32) {
		return crypto.randomBytes(bytes)
	}

	/**
	 * Derive a 256-bit encryption key from passphrase and salt.
	 * @param {string} passphrase
	 * @param {Buffer} salt
	 * @returns {Promise<Buffer>}
	 */
	static async deriveKey(passphrase, salt) {
		const derived = /** @type {Buffer} */ (
			await scryptAsync(passphrase, salt, 32, {
				N: 16384,
				r: 8,
				p: 1,
				maxmem: 64 * 1024 * 1024,
			})
		)
		return derived
	}

	/**
	 * Encrypt payload string into a secure container format.
	 * @param {string} payload
	 * @param {string} passphrase
	 * @returns {Promise<{
	 *   magic: string,
	 *   version: number,
	 *   salt: string,
	 *   iv: string,
	 *   ciphertext: string,
	 *   tag: string
	 * }>}
	 */
	static async encrypt(payload, passphrase) {
		const salt = this.generateSalt(32)
		const key = await this.deriveKey(passphrase, salt)
		const iv = crypto.randomBytes(12) // 96-bit IV for GCM

		const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
		let ciphertext = cipher.update(payload, 'utf8', 'hex')
		ciphertext += cipher.final('hex')
		const tag = cipher.getAuthTag()

		return {
			magic: this.MAGIC,
			version: this.VERSION,
			salt: salt.toString('hex'),
			iv: iv.toString('hex'),
			ciphertext,
			tag: tag.toString('hex'),
		}
	}

	/**
	 * Decrypt container with passphrase and verify integrity.
	 * @param {{
	 *   magic?: string,
	 *   version?: number,
	 *   salt: string,
	 *   iv: string,
	 *   ciphertext: string,
	 *   tag: string
	 * }} container
	 * @param {string} passphrase
	 * @returns {Promise<string>}
	 */
	static async decrypt(container, passphrase) {
		if (container.magic && container.magic !== this.MAGIC) {
			throw new Error('Invalid vault magic bytes')
		}

		const salt = Buffer.from(container.salt, 'hex')
		const iv = Buffer.from(container.iv, 'hex')
		const tag = Buffer.from(container.tag, 'hex')
		const key = await this.deriveKey(passphrase, salt)

		try {
			const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
			decipher.setAuthTag(tag)
			let decrypted = decipher.update(container.ciphertext, 'hex', 'utf8')
			decrypted += decipher.final('utf8')
			return decrypted
		} catch (err) {
			throw new Error('Authentication failed: invalid passphrase or corrupted container')
		}
	}
}
