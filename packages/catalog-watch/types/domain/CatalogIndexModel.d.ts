/**
 * @file CatalogIndexModel — Server-side catalog index generator.
 *
 * Generates a plain-text `.index.txt` file for a single catalog in a single locale.
 * Format: comment headers (# key: value) + one file path per line.
 *
 * Output path: dist/@catalog/{locale}/{catalog}.index.txt
 */
export class CatalogIndexModel extends Model {
    static catalog: {
        help: string;
        default: string;
        type: string;
        hint: string;
    };
    static locale: {
        help: string;
        default: string;
        type: string;
        hint: string;
    };
    static version: {
        help: string;
        default: number;
        type: string;
    };
    static hash: {
        help: string;
        default: string;
        type: string;
    };
    static itemCount: {
        help: string;
        default: number;
        type: string;
    };
    static updatedAt: {
        help: string;
        default: string;
        type: string;
    };
    static files: {
        help: string;
        default: any[];
        hidden: boolean;
    };
    static UI: {
        progress_scanning: string;
        progress_hashing: string;
        progress_writing: string;
        log_generated: string;
        log_empty: string;
        error_no_catalog: string;
        error_no_root: string;
        label_version: string;
        label_items: string;
        label_hash: string;
    };
    /**
     * Parse `.index.txt` content back into CatalogIndexModel.
     *
     * @param {string} text - Raw content of .index.txt file
     * @returns {CatalogIndexModel}
     */
    static parse(text: string): CatalogIndexModel;
    /**
     * Build catalog index from a directory listing.
     *
     * @param {{ listFiles: (path: string) => Promise<string[]>, hash: (files: string[]) => Promise<string>, readVersion?: (catalog: string, locale: string) => Promise<number> }} env
     * Environment-injected dependencies (no hardcoded fs/crypto imports).
     */
    run(env: {
        listFiles: (path: string) => Promise<string[]>;
        hash: (files: string[]) => Promise<string>;
        readVersion?: (catalog: string, locale: string) => Promise<number>;
    }): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").LogIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
    files: string[];
    itemCount: number;
    hash: string;
    version: number;
    updatedAt: string;
}
import { Model } from '@nan0web/types';
