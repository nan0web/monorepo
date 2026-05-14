import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Crypto from './Crypto.js'

describe('Crypto', () => {
	it('should generate valid Ed25519 key pair', () => {
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		assert.ok(publicKey, 'publicKey should exist')
		assert.ok(privateKey, 'privateKey should exist')
		assert.notEqual(publicKey, privateKey)

		// Base64 check
		assert.ok(Buffer.from(publicKey, 'base64').length > 32)
		assert.ok(Buffer.from(privateKey, 'base64').length > 32)
	})

	it('should sign and verify message', () => {
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const data = 'hello sovereign world'

		const signature = Crypto.sign(privateKey, data)
		assert.ok(signature, 'signature should exist')

		const ok = Crypto.verify(publicKey, data, signature)
		assert.strictEqual(ok, true, 'signature should be valid')
	})

	it('should fail verification with wrong message', () => {
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const data = 'hello sovereign world'
		const signature = Crypto.sign(privateKey, data)

		const ok = Crypto.verify(publicKey, 'wrong message', signature)
		assert.strictEqual(ok, false, 'signature should be invalid for wrong message')
	})

	it('should fail verification with wrong key', () => {
		const { privateKey } = Crypto.generateKeyPair()
		const { publicKey: otherPublicKey } = Crypto.generateKeyPair()
		const data = 'hello sovereign world'
		const signature = Crypto.sign(privateKey, data)

		const ok = Crypto.verify(otherPublicKey, data, signature)
		assert.strictEqual(ok, false, 'signature should be invalid for wrong public key')
	})

	it('should fail verification with malformed signature', () => {
		const { publicKey } = Crypto.generateKeyPair()
		const ok = Crypto.verify(publicKey, 'data', 'bm90IGEgc2lnbmF0dXJl') // "not a signature" in b64
		assert.strictEqual(ok, false, 'should handle malformed signature gracefully')
	})
})
