/**
 * Base class for auditor discovery.
 * Specific platforms (JS, Python) should extend this class.
 */
export class AuditorDiscovery extends Model {
    /**
     * @param {Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /**
     * Discovers auditors in the given directory.
     * @param {string} targetDir
     * @returns {Promise<Set<any>>}
     */
    discover(targetDir: string): Promise<Set<any>>;
    /**
     * Dynamic importer for auditors.
     * @param {string} specifier
     * @returns {Promise<any>}
     */
    importModule(specifier: string): Promise<any>;
    /**
     * Collects auditor classes from a module.
     * @param {any} mod Module or object containing exports.
     * @param {Set<typeof import('../AuditorModel.js').AuditorModel>} discoveredAuditors Set to add discovered auditors to.
     */
    collectAuditors(mod: any, discoveredAuditors: Set<typeof import("../AuditorModel.js").AuditorModel>): void;
    /**
     * Lazy-load AuditorModel to avoid circular dependencies.
     * @returns {{AuditorModel: typeof import('../AuditorModel.js').AuditorModel}}
     */
    importAuditorModel(): {
        AuditorModel: typeof import("../AuditorModel.js").AuditorModel;
    };
}
import { Model } from '@nan0web/types';
