import { generateKeyPairSync, sign, verify, createPrivateKey, createPublicKey } from 'node:crypto'

/**
 * @module Crypto
 * @description Universal cryptographic primitives for nan0web.
 *
 * Supports Ed25519 signing and verification.
 * Compact mode: raw 64-byte hex signatures for Mesh identity.
 *
 * @example
 * const { publicKey, privateKey } = Crypto.generateKeyPair()
 * const signature = Crypto.sign(privateKey, 'hello sovereign')
 * const ok = Crypto.verify(publicKey, 'hello sovereign', signature) // true
 *
 * // Compact mode (raw 64-byte hex):
 * const sig = Crypto.sign(privateKey, 'mesh', { compact: true })
 * const valid = Crypto.verify(publicKey, 'mesh', sig, { compact: true })
 */
export default class Crypto {
	/**
	 * Whether running in Node.js environment (vs browser).
	 * @type {boolean}
	 */
	static isNode =
		typeof process !== 'undefined' &&
		typeof process.versions !== 'undefined' &&
		typeof process.versions.node !== 'undefined'

	/**
	 * Generate a new Ed25519 key pair.
	 *
	 * @returns {{ publicKey: string, privateKey: string }} Base64 encoded keys in DER format (SPKI/PKCS8)
	 */
	static generateKeyPair() {
		const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
			publicKeyEncoding: { type: 'spki', format: 'der' },
			privateKeyEncoding: { type: 'pkcs8', format: 'der' },
		})
		return {
			publicKey: publicKey.toString('base64'),
			privateKey: privateKey.toString('base64'),
		}
	}

	/**
	 * Sign data using Ed25519 private key.
	 *
	 * @param {string} privateKeyB64 - Base64 encoded PKCS8 DER private key
	 * @param {string|Buffer|Uint8Array} data - Data to sign
	 * @param {{ compact?: boolean }} [options] - Options. compact=true for raw 64-byte hex output.
	 * @returns {string} Signature (Base64 default, or lowercase hex if compact)
	 */
	static sign(privateKeyB64, data, options = {}) {
		const key = createPrivateKey({
			key: Buffer.from(privateKeyB64, 'base64'),
			format: 'der',
			type: 'pkcs8',
		})
		const signature = sign(null, Buffer.from(data), key)

		if (options.compact) {
			return signature.toString('hex')
		}
		return signature.toString('base64')
	}

	/**
	 * Verify Ed25519 signature.
	 *
	 * @param {string} publicKeyB64 - Base64 encoded SPKI DER public key
	 * @param {string|Buffer|Uint8Array} data - Original data
	 * @param {string} signatureStr - Signature string (Base64 default, or hex if compact)
	 * @param {{ compact?: boolean }} [options] - Options. compact=true for raw hex input.
	 * @returns {boolean}
	 */
	static verify(publicKeyB64, data, signatureStr, options = {}) {
		try {
			const key = createPublicKey({
				key: Buffer.from(publicKeyB64, 'base64'),
				format: 'der',
				type: 'spki',
			})
			const encoding = options.compact ? 'hex' : 'base64'
			return verify(null, Buffer.from(data), key, Buffer.from(signatureStr, encoding))
		} catch {
			return false
		}
	}
}
