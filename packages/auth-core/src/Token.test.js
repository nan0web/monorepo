import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Token from './Token.js'
import Crypto from './Crypto.js'

describe('Token', () => {
	const keys = Crypto.generateKeyPair()

	it('create() returns dot-separated 3-part string', () => {
		const token = Token.create({ sub: 'test' }, keys.privateKey)
		assert.equal(typeof token, 'string')
		assert.equal(token.split('.').length, 3)
	})

	it('verify() validates correct token', () => {
		const token = Token.create({ sub: 'test' }, keys.privateKey)
		const result = Token.verify(token, keys.publicKey)
		assert.equal(result.valid, true)
		assert.equal(result.payload.sub, 'test')
	})

	it('verify() rejects wrong key', () => {
		const other = Crypto.generateKeyPair()
		const token = Token.create({ sub: 'test' }, keys.privateKey)
		const result = Token.verify(token, other.publicKey)
		assert.equal(result.valid, false)
	})

	it('verify() rejects expired token', () => {
		const token = Token.create({ sub: 'test' }, keys.privateKey, { expiresIn: -1 })
		const result = Token.verify(token, keys.publicKey)
		assert.equal(result.valid, false)
	})

	it('verify() passes token without exp', () => {
		const token = Token.create({ sub: 'eternal' }, keys.privateKey)
		const result = Token.verify(token, keys.publicKey)
		assert.equal(result.valid, true)
	})

	it('decode() returns payload without verification', () => {
		const token = Token.create({ sub: 'peek', n: 42 }, keys.privateKey)
		const payload = Token.decode(token)
		assert.equal(payload.sub, 'peek')
		assert.equal(payload.n, 42)
	})

	it('decode() returns null for garbage', () => {
		assert.equal(Token.decode('garbage'), null)
		assert.equal(Token.decode('a.b'), null)
	})

	it('refresh() creates new token with same claims', () => {
		const original = Token.create({ sub: 'me' }, keys.privateKey, { expiresIn: 60 })
		const refreshed = Token.refresh(original, keys.privateKey, { expiresIn: 120 })
		assert.notEqual(refreshed, original)
		const result = Token.verify(refreshed, keys.publicKey)
		assert.equal(result.valid, true)
		assert.equal(result.payload.sub, 'me')
	})

	it('verify() returns object with error on malformed input', () => {
		const result = Token.verify('x', keys.publicKey)
		assert.equal(result.valid, false)
		assert.ok(result.error)
	})

	it('refresh() throws on malformed token', () => {
		assert.throws(() => Token.refresh('bad', keys.privateKey))
	})
})
