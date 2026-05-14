/**
 * @module v1.2.0 Release Contract — Token & Compact Mesh
 *
 * RED tests — all must FAIL before implementation begins.
 * After implementation, all must PASS (no spec modifications allowed).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// --- AUTH-1: Token class ---

describe('AUTH-1: Token class', () => {
	it('Token is exported from auth-core', async () => {
		const { Token } = await import('../../../../../index.js')
		assert.ok(Token, 'Token should be exported')
		assert.equal(typeof Token.create, 'function')
		assert.equal(typeof Token.verify, 'function')
		assert.equal(typeof Token.decode, 'function')
	})

	it('Token.create() produces a valid JWT-like string with 3 parts', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'user@yaro.page', role: 'admin' }, privateKey)

		assert.equal(typeof token, 'string')
		const parts = token.split('.')
		assert.equal(parts.length, 3, 'Token must have 3 dot-separated parts')
	})

	it('Token.create() header contains alg=EdDSA, typ=JWT', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'test' }, privateKey)

		const headerB64 = token.split('.')[0]
		const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString())
		assert.equal(header.alg, 'EdDSA')
		assert.equal(header.typ, 'JWT')
	})

	it('Token.create() payload includes iat automatically', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { privateKey } = Crypto.generateKeyPair()
		const before = Math.floor(Date.now() / 1000)
		const token = Token.create({ sub: 'test' }, privateKey)

		const payloadB64 = token.split('.')[1]
		const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
		assert.ok(payload.iat >= before, 'iat should be set automatically')
	})

	it('Token.create() with exp option sets expiry', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'test' }, privateKey, { expiresIn: 3600 })

		const payloadB64 = token.split('.')[1]
		const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
		assert.ok(payload.exp, 'exp should be set')
		assert.equal(payload.exp, payload.iat + 3600)
	})

	it('Token.verify() returns valid=true for correct signature', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'user@yaro.page' }, privateKey)

		const result = Token.verify(token, publicKey)
		assert.equal(result.valid, true)
		assert.equal(result.payload.sub, 'user@yaro.page')
		assert.equal(result.error, undefined)
	})

	it('Token.verify() returns valid=false for wrong key', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const keys1 = Crypto.generateKeyPair()
		const keys2 = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'test' }, keys1.privateKey)

		const result = Token.verify(token, keys2.publicKey)
		assert.equal(result.valid, false)
		assert.ok(result.error, 'error message should be present')
	})

	it('Token.verify() returns valid=false for expired token', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		// Create token that already expired (expiresIn = -1 second)
		const token = Token.create({ sub: 'test' }, privateKey, { expiresIn: -1 })

		const result = Token.verify(token, publicKey)
		assert.equal(result.valid, false)
		assert.ok(
			result.error?.includes('expired') || result.error?.includes('exp'),
			'should mention expiry',
		)
	})

	it('Token.verify() without exp does not expire', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'eternal' }, privateKey)

		const result = Token.verify(token, publicKey)
		assert.equal(result.valid, true)
		assert.equal(result.payload.sub, 'eternal')
	})

	it('Token.decode() returns payload without verification', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { privateKey } = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'peek', custom: 42 }, privateKey)

		const payload = Token.decode(token)
		assert.equal(payload.sub, 'peek')
		assert.equal(payload.custom, 42)
	})

	it('Token.decode() returns null for malformed token', async () => {
		const { Token } = await import('../../../../../index.js')
		const payload = Token.decode('not.a.valid-token')
		assert.equal(payload, null)
	})

	it('Token.refresh() creates new token with updated iat/exp', async () => {
		const { Token, Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const original = Token.create({ sub: 'refresh-me' }, privateKey, { expiresIn: 3600 })

		const refreshed = Token.refresh(original, privateKey, { expiresIn: 7200 })
		assert.notEqual(refreshed, original, 'refreshed token should differ')

		const result = Token.verify(refreshed, publicKey)
		assert.equal(result.valid, true)
		assert.equal(result.payload.sub, 'refresh-me')

		const origPayload = Token.decode(original)
		assert.ok(result.payload.iat >= origPayload.iat, 'new iat should be >= original')
		assert.equal(result.payload.exp, result.payload.iat + 7200)
	})
})

// --- AUTH-2: Compact Signatures ---

describe('AUTH-2: Compact Signatures', () => {
	it('Crypto.sign() with compact=true returns hex string (128 chars for 64 bytes)', async () => {
		const { Crypto } = await import('../../../../../index.js')
		const { privateKey } = Crypto.generateKeyPair()
		const signature = Crypto.sign(privateKey, 'hello sovereign', { compact: true })

		assert.equal(typeof signature, 'string')
		assert.equal(signature.length, 128, 'Ed25519 raw sig = 64 bytes = 128 hex chars')
		assert.match(signature, /^[0-9a-f]+$/, 'must be lowercase hex')
	})

	it('Crypto.verify() with compact=true verifies hex signature', async () => {
		const { Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const sig = Crypto.sign(privateKey, 'mesh identity', { compact: true })
		const ok = Crypto.verify(publicKey, 'mesh identity', sig, { compact: true })

		assert.equal(ok, true)
	})

	it('compact signature (hex) is 128 chars while base64 is 88 chars', async () => {
		const { Crypto } = await import('../../../../../index.js')
		const { privateKey } = Crypto.generateKeyPair()
		const data = 'size comparison test'

		const b64sig = Crypto.sign(privateKey, data)
		const hexSig = Crypto.sign(privateKey, data, { compact: true })

		assert.equal(hexSig.length, 128, 'compact (hex) should be exactly 128 chars')
		assert.equal(b64sig.length, 88, 'base64 should be exactly 88 chars')
	})

	it('existing base64 API still works unchanged', async () => {
		const { Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const sig = Crypto.sign(privateKey, 'backward compat')
		const ok = Crypto.verify(publicKey, 'backward compat', sig)

		assert.equal(ok, true)
	})
})

// --- AUTH-3: Isomorphic Crypto ---

describe('AUTH-3: Isomorphic Crypto (Node.js path)', () => {
	it('Crypto works in Node.js without globalThis.crypto.subtle', async () => {
		const { Crypto } = await import('../../../../../index.js')
		const { publicKey, privateKey } = Crypto.generateKeyPair()
		const sig = Crypto.sign(privateKey, 'node env test')
		const ok = Crypto.verify(publicKey, 'node env test', sig)

		assert.equal(ok, true, 'Node.js crypto path must work')
	})

	it('Crypto exposes isomorphic detection property', async () => {
		const { Crypto } = await import('../../../../../index.js')
		assert.equal(typeof Crypto.isNode, 'boolean', 'isNode should be a boolean')
	})

	it('Crypto.isNode is true in Node.js environment', async () => {
		const { Crypto } = await import('../../../../../index.js')
		assert.equal(Crypto.isNode, true, 'should be true when running in Node.js')
	})
})
