/**
 * SnapshotRunner — Zero-Hallucination Snapshot Generation & Audit (Model-as-Schema v2).
 * Operates entirely through DB-FS abstraction without raw FS/Path hardcodes.
 */
export class SnapshotRunner extends Model {
    static UI: {
        generating: string;
        saved: string;
        auditFailed: string;
        rootGallery: string;
        localeTitle: string;
        categoryTitle: string;
        backText: string;
        backLink: string;
        galleryDescription: string;
    };
    static data: {
        type: string;
        help: string;
        default: string;
    };
    static snapshotsDir: {
        type: string;
        help: string;
        default: string;
    };
    /**
     * @param {Partial<SnapshotRunner> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<SnapshotRunner> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Directory containing snapshots */ snapshotsDir: string;
    /** @type {string} Root data directory */ data: string;
    /** @type {(compName: string) => string} */ getCategory: (compName: string) => string;
    /** @type {(compName: string, varData: any) => AsyncGenerator<any>} */ createModelStream: (compName: string, varData: any) => AsyncGenerator<any>;
    get db(): import("@nan0web/db").DB;
    /**
     * Recursive drop for directories via DB-FS.
     * @param {string} uri
     */
    dropRecursive(uri: string): Promise<void>;
    run(): AsyncGenerator<import("../../core/Intent.js").ShowIntent, import("../../core/Intent.js").ResultIntent, unknown>;
}
export default SnapshotRunner;
import { Model } from '@nan0web/types';
