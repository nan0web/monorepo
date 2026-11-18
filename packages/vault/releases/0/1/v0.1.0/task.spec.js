import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { VaultModel } from '../../../../src/domain/VaultModel.js'
import { VaultCrypto } from '../../../../src/crypto/VaultCrypto.js'

describe('vault v0.1.0: Cryptographic Core & Zero Data-Loss Contract', () => {
	it('VaultCrypto generates key from passphrase and salt', async () => {
		const salt = VaultCrypto.generateSalt()
		assert.equal(salt.length, 32, 'Salt length must be 32 bytes')

		const key = await VaultCrypto.deriveKey('master-secret-passphrase', salt)
		assert.ok(Buffer.isBuffer(key), 'Key must be a Buffer')
		assert.equal(key.length, 32, 'Derived key must be 32 bytes (256-bit)')
	})

	it('VaultCrypto encrypts and decrypts payload with integrity authentication', async () => {
		const passphrase = 'correct-horse-battery-staple'
		const payload = JSON.stringify({
			secrets: [{ id: 'github', username: 'architechnomag', secret: 'ghp_secret_token_123' }],
		})

		const encryptedContainer = await VaultCrypto.encrypt(payload, passphrase)
		assert.ok(encryptedContainer.magic, 'Container must have magic signature')
		assert.ok(encryptedContainer.iv, 'Container must have IV')
		assert.ok(encryptedContainer.salt, 'Container must have Salt')
		assert.ok(encryptedContainer.ciphertext, 'Container must have Ciphertext')
		assert.ok(encryptedContainer.tag, 'Container must have Auth Tag')

		const decrypted = await VaultCrypto.decrypt(encryptedContainer, passphrase)
		assert.equal(decrypted, payload, 'Decrypted payload must match original')
	})

	it('VaultCrypto throws error when decrypting with invalid passphrase', async () => {
		const passphrase = 'valid-passphrase'
		const payload = 'sensitive-data'
		const container = await VaultCrypto.encrypt(payload, passphrase)

		await assert.rejects(
			async () => {
				await VaultCrypto.decrypt(container, 'wrong-passphrase')
			},
			/invalid passphrase|bad auth|authentication failed/i,
			'Must reject invalid passphrase with auth error'
		)
	})

	it('VaultModel manages secrets, saves with rolling backup via injected db', async () => {
		/** @type {Record<string, any>} */
		const mockStorage = {}
		const mockDb = {
			async loadDocument(path) {
				return mockStorage[path] || null
			},
			async saveDocument(path, data) {
				mockStorage[path] = data
				return true
			},
			async deleteDocument(path) {
				delete mockStorage[path]
				return true
			},
			dirname(p) {
				const parts = p.split('/')
				parts.pop()
				return parts.join('/') || '.'
			},
			basename(p) {
				return p.split('/').pop() || p
			},
			resolveSync(...args) {
				return args.filter(Boolean).join('/')
			},
		}

		const vault = new VaultModel({ path: 'secure/secrets.vault' }, { db: mockDb })

		vault.setPassphrase('sovereign-vault-key-2026')
		vault.addSecret({
			id: 'root-account',
			title: 'Cloudflare Zero Trust',
			username: 'root@ea.nan0',
			password: 'Ultra-Secure-Password-42!',
		})

		await vault.save()

		assert.ok(mockStorage['secure/secrets.vault'], 'Vault file must be saved in db')

		// Make a mutation and save again -> triggers rolling backup .bak
		vault.addSecret({
			id: 'ssh-key',
			title: 'VPS Master Key',
			secret: 'ssh-ed25519 AAAAC3...',
		})
		await vault.save()

		assert.ok(mockStorage['secure/secrets.vault.bak.1'], 'Rolling backup .bak.1 must be created')

		// Create a fresh vault instance and load saved container
		const loadedVault = new VaultModel({ path: 'secure/secrets.vault' }, { db: mockDb })
		loadedVault.setPassphrase('sovereign-vault-key-2026')
		await loadedVault.load()

		assert.equal(loadedVault.secrets.length, 2, 'Loaded vault must restore both secrets')
		assert.equal(loadedVault.getSecret('root-account')?.username, 'root@ea.nan0')
	})
})
