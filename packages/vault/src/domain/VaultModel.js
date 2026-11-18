import { Model } from '@nan0web/types'
import { VaultCrypto } from '../crypto/VaultCrypto.js'
import { SecretItemModel } from './SecretItemModel.js'
import { VaultHeaderModel } from './VaultHeaderModel.js'

/**
 * VaultModel - High-level sovereign vault manager with zero data-loss guarantees.
 */
export class VaultModel extends Model {
	static alias = 'vault'

	static UI = {
		errorNoDb: 'Database instance is required for Vault operations',
		errorNoPassphrase: 'Passphrase is required for encryption or decryption',
		errorNotFound: 'Vault file not found at path: {$path}',
		errorAuthFailed: 'Authentication failed: invalid passphrase or corrupted container',
	}

	static path = {
		help: 'Storage path for the vault container',
		default: 'secrets.vault',
	}

	static maxBackups = {
		help: 'Maximum rolling backup copies to maintain',
		default: 5,
	}

	/**
	 * @param {Partial<VaultModel>} [data]
	 * @param {import('@nan0web/types').ModelOptions & { db?: any }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Storage path */ this.path
		/** @type {number} Max rolling backups */ this.maxBackups
		/** @type {SecretItemModel[]} List of stored secrets */
		this.secrets = []
		/** @type {VaultHeaderModel} Container header */
		this.header = new VaultHeaderModel()
		/** @type {string | null} Decryption passphrase */
		this._passphrase = null
		/** @type {any} Injected db instance */
		this._db = options.db || null
	}

	/**
	 * Injected virtual database getter.
	 */
	get $db() {
		if (!this._db) {
			const { t } = this._
			throw new Error(t ? t(VaultModel.UI.errorNoDb) : VaultModel.UI.errorNoDb)
		}
		return this._db
	}

	/**
	 * Set master passphrase for encryption/decryption.
	 * @param {string} passphrase
	 */
	setPassphrase(passphrase) {
		this._passphrase = passphrase
	}

	/**
	 * Add or update secret item.
	 * @param {Partial<SecretItemModel>} item
	 * @returns {SecretItemModel}
	 */
	addSecret(item) {
		const existingIndex = this.secrets.findIndex((s) => s.id === item.id)
		const secretModel = new SecretItemModel(item)
		if (existingIndex >= 0) {
			this.secrets[existingIndex] = secretModel
		} else {
			this.secrets.push(secretModel)
		}
		this.header.updatedAt = new Date().toISOString()
		return secretModel
	}

	/**
	 * Get secret by id.
	 * @param {string} id
	 * @returns {SecretItemModel | undefined}
	 */
	getSecret(id) {
		return this.secrets.find((s) => s.id === id)
	}

	/**
	 * Remove secret by id.
	 * @param {string} id
	 * @returns {boolean}
	 */
	removeSecret(id) {
		const prevLen = this.secrets.length
		this.secrets = this.secrets.filter((s) => s.id !== id)
		return this.secrets.length !== prevLen
	}

	/**
	 * Save encrypted vault to database with rolling backup.
	 */
	async save() {
		if (!this._passphrase) {
			const { t } = this._
			throw new Error(t ? t(VaultModel.UI.errorNoPassphrase) : VaultModel.UI.errorNoPassphrase)
		}

		// Perform rolling backup if vault file already exists
		const existingData = await this.$db.loadDocument(this.path)
		if (existingData) {
			await this._createRollingBackup(existingData)
		}

		const payload = JSON.stringify({
			header: this.header,
			secrets: this.secrets,
		})

		const encrypted = await VaultCrypto.encrypt(payload, this._passphrase)
		await this.$db.saveDocument(this.path, encrypted)
		return true
	}

	/**
	 * Load and decrypt vault from database.
	 */
	async load() {
		if (!this._passphrase) {
			const { t } = this._
			throw new Error(t ? t(VaultModel.UI.errorNoPassphrase) : VaultModel.UI.errorNoPassphrase)
		}

		const encrypted = await this.$db.loadDocument(this.path)
		if (!encrypted) {
			const { t } = this._
			const msg = t
				? t(VaultModel.UI.errorNotFound, { path: this.path })
				: `Vault file not found at path: ${this.path}`
			throw new Error(msg)
		}

		const decrypted = await VaultCrypto.decrypt(encrypted, this._passphrase)
		const parsed = JSON.parse(decrypted)

		this.header = new VaultHeaderModel(parsed.header || {})
		this.secrets = (parsed.secrets || []).map((s) => new SecretItemModel(s))
		return true
	}

	/**
	 * Shift and write rolling backups (.bak.1, .bak.2, ...).
	 * @private
	 * @param {any} currentData
	 */
	async _createRollingBackup(currentData) {
		for (let i = this.maxBackups - 1; i >= 1; i--) {
			const source = `${this.path}.bak.${i}`
			const target = `${this.path}.bak.${i + 1}`
			const older = await this.$db.loadDocument(source)
			if (older) {
				await this.$db.saveDocument(target, older)
			}
		}
		await this.$db.saveDocument(`${this.path}.bak.1`, currentData)
	}
}
