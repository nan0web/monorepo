/**
 * @module Password
 * @description Secure password hashing and verification using scrypt.
 *
 * Uses Node.js built-in crypto (scryptSync + randomBytes + timingSafeEqual).
 * Timing-safe comparison prevents timing attacks.
 *
 * @example
 * const hash = Password.hash('sovereign')
 * Password.verify('sovereign', hash) // true
 * Password.verify('wrong', hash)     // false
 *
 * @example
 * // With project-level salt (multi-tenant)
 * const hash = Password.hash('test', 'MY_PROJECT_SALT')
 * Password.verify('test', hash, 'MY_PROJECT_SALT') // true
 * Password.verify('test', hash, '')                 // false
 */

import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

const SCRYPT_KEYLEN = 32
const SCRYPT_COST = { N: 16384, r: 8, p: 1 }

export default class Password {
	/**
	 * Hash a plaintext password using scrypt.
	 *
	 * @param {string} plain - plaintext password
	 * @param {string} [projectSalt=''] - optional project-level salt prefix
	 * @returns {string} - "salt_hex:hash_hex" format
	 */
	static hash(plain, projectSalt = '') {
		const salt = randomBytes(16).toString('hex')
		const input = projectSalt + plain
		const derived = scryptSync(input, salt, SCRYPT_KEYLEN, SCRYPT_COST)
		return `${salt}:${derived.toString('hex')}`
	}

	/**
	 * Verify a password against a stored hash.
	 *
	 * Supports two formats:
	 *   1. scrypt hash — "salt_hex:hash_hex" (production)
	 *   2. plain string — direct comparison (dev/migration fallback)
	 *
	 * @param {string} input - user-provided password
	 * @param {string} stored - stored hash or plain string
	 * @param {string} [projectSalt=''] - same salt used during hash()
	 * @returns {boolean}
	 */
	static verify(input, stored, projectSalt = '') {
		if (!input || !stored) return false

		// Check if stored is scrypt format (salt:hash)
		if (stored.includes(':')) {
			const [salt, hash] = stored.split(':')
			if (salt.length === 32 && hash.length === 64) {
				const salted = projectSalt + input
				const derived = scryptSync(salted, salt, SCRYPT_KEYLEN, SCRYPT_COST)
				const expected = Buffer.from(hash, 'hex')
				return timingSafeEqual(derived, expected)
			}
		}

		// Fallback: plain string comparison (dev/migration)
		return input === stored
	}
}
