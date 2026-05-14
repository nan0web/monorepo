import Crypto from './Crypto.js'

/**
 * @module Token
 * @description Sovereign JWT-compatible token built on Ed25519.
 *
 * Zero-dependency, compact, stateless authentication primitive.
 * Format: base64url(header).base64url(payload).base64url(signature)
 *
 * @example
 * const { publicKey, privateKey } = Crypto.generateKeyPair()
 * const token = Token.create({ sub: 'user@yaro.page' }, privateKey, { expiresIn: 3600 })
 * const result = Token.verify(token, publicKey)
 * // { valid: true, payload: { sub: 'user@yaro.page', iat: ..., exp: ... } }
 */
export default class Token {
	/**
	 * Create a signed JWT-compatible token.
	 *
	 * @param {Record<string, unknown>} payload - Claims (sub, iss, custom, etc.)
	 * @param {string} privateKeyB64 - Base64-encoded Ed25519 PKCS8 DER private key
	 * @param {{ expiresIn?: number }} [options] - Options. expiresIn = seconds until expiry.
	 * @returns {string} Signed token (header.payload.signature)
	 */
	static create(payload, privateKeyB64, options = {}) {
		const header = { alg: 'EdDSA', typ: 'JWT' }
		const now = Math.floor(Date.now() / 1000)

		/** @type {Record<string, unknown>} */
		const claims = { ...payload, iat: now }
		if (options.expiresIn !== undefined) {
			claims.exp = now + options.expiresIn
		}

		const headerB64 = Token.#toBase64Url(JSON.stringify(header))
		const payloadB64 = Token.#toBase64Url(JSON.stringify(claims))
		const signingInput = `${headerB64}.${payloadB64}`

		const signatureB64 = Crypto.sign(privateKeyB64, signingInput)
		const signatureB64Url = Token.#b64ToB64Url(signatureB64)

		return `${headerB64}.${payloadB64}.${signatureB64Url}`
	}

	/**
	 * Verify a token's signature and expiry.
	 *
	 * @param {string} token - The signed token string
	 * @param {string} publicKeyB64 - Base64-encoded Ed25519 SPKI DER public key
	 * @returns {{ valid: boolean, payload?: Record<string, unknown>, error?: string }}
	 */
	static verify(token, publicKeyB64) {
		try {
			const parts = token.split('.')
			if (parts.length !== 3) {
				return { valid: false, error: 'malformed token' }
			}

			const [headerB64, payloadB64, signatureB64Url] = parts
			const signingInput = `${headerB64}.${payloadB64}`
			const signatureB64 = Token.#b64UrlToB64(signatureB64Url)

			const isValid = Crypto.verify(publicKeyB64, signingInput, signatureB64)
			if (!isValid) {
				return { valid: false, error: 'invalid signature' }
			}

			const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())

			if (payload.exp !== undefined) {
				const now = Math.floor(Date.now() / 1000)
				if (now >= payload.exp) {
					return { valid: false, error: 'token expired', payload }
				}
			}

			return { valid: true, payload }
		} catch {
			return { valid: false, error: 'verification failed' }
		}
	}

	/**
	 * Decode a token's payload without verifying signature.
	 *
	 * @param {string} token - The token string
	 * @returns {Record<string, unknown> | null} Decoded payload or null if malformed
	 */
	static decode(token) {
		try {
			const parts = token.split('.')
			if (parts.length !== 3) return null
			return JSON.parse(Buffer.from(parts[1], 'base64url').toString())
		} catch {
			return null
		}
	}

	/**
	 * Refresh a token — creates a new token with the same claims but updated iat/exp.
	 *
	 * @param {string} token - Original signed token
	 * @param {string} privateKeyB64 - Private key for re-signing
	 * @param {{ expiresIn?: number }} [options] - New expiry options
	 * @returns {string} New signed token
	 */
	static refresh(token, privateKeyB64, options = {}) {
		const payload = Token.decode(token)
		if (!payload) throw new Error('Cannot refresh malformed token')

		const { iat, exp, ...claims } = payload
		return Token.create(claims, privateKeyB64, options)
	}

	/**
	 * @param {string} str
	 * @returns {string}
	 */
	static #toBase64Url(str) {
		return Buffer.from(str).toString('base64url')
	}

	/**
	 * @param {string} b64
	 * @returns {string}
	 */
	static #b64ToB64Url(b64) {
		return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
	}

	/**
	 * @param {string} b64url
	 * @returns {string}
	 */
	static #b64UrlToB64(b64url) {
		let s = b64url.replace(/-/g, '+').replace(/_/g, '/')
		while (s.length % 4) s += '='
		return s
	}
}
