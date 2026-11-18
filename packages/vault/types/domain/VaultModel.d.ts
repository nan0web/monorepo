/**
 * VaultModel - High-level sovereign vault manager with zero data-loss guarantees.
 */
export class VaultModel extends Model {
    static alias: string;
    static UI: {
        errorNoDb: string;
        errorNoPassphrase: string;
        errorNotFound: string;
        errorAuthFailed: string;
    };
    static path: {
        help: string;
        default: string;
    };
    static maxBackups: {
        help: string;
        default: number;
    };
    /**
     * @param {Partial<VaultModel>} [data]
     * @param {import('@nan0web/types').ModelOptions & { db?: any }} [options]
     */
    constructor(data?: Partial<VaultModel>, options?: import("@nan0web/types").ModelOptions & {
        db?: any;
    });
    /** @type {string} Storage path */ path: string;
    /** @type {number} Max rolling backups */ maxBackups: number;
    /** @type {SecretItemModel[]} List of stored secrets */
    secrets: SecretItemModel[];
    /** @type {VaultHeaderModel} Container header */
    header: VaultHeaderModel;
    /** @type {string | null} Decryption passphrase */
    _passphrase: string | null;
    /** @type {any} Injected db instance */
    _db: any;
    /**
     * Injected virtual database getter.
     */
    get $db(): any;
    /**
     * Set master passphrase for encryption/decryption.
     * @param {string} passphrase
     */
    setPassphrase(passphrase: string): void;
    /**
     * Add or update secret item.
     * @param {Partial<SecretItemModel>} item
     * @returns {SecretItemModel}
     */
    addSecret(item: Partial<SecretItemModel>): SecretItemModel;
    /**
     * Get secret by id.
     * @param {string} id
     * @returns {SecretItemModel | undefined}
     */
    getSecret(id: string): SecretItemModel | undefined;
    /**
     * Remove secret by id.
     * @param {string} id
     * @returns {boolean}
     */
    removeSecret(id: string): boolean;
    /**
     * Save encrypted vault to database with rolling backup.
     */
    save(): Promise<boolean>;
    /**
     * Load and decrypt vault from database.
     */
    load(): Promise<boolean>;
    /**
     * Shift and write rolling backups (.bak.1, .bak.2, ...).
     * @private
     * @param {any} currentData
     */
    private _createRollingBackup;
}
import { Model } from '@nan0web/types';
import { SecretItemModel } from './SecretItemModel.js';
import { VaultHeaderModel } from './VaultHeaderModel.js';
