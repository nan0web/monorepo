/**
 * ModuleRegistry represents a collection of inspected modules across workspace zones.
 * Provides Fluent API for batch mutations, querying, and index generation (CSV0 and Markdown).
 */
export class ModuleRegistry {
    /**
     * Asynchronously discovers and loads modules from the specified zones via injected DB.
     * @param {object} options
     * @param {import('@nan0web/db').DB} options.db
     * @param {string[]} [options.zones]
     * @returns {Promise<ModuleRegistry>}
     */
    static create({ db, zones }: {
        db: import("@nan0web/db").DB;
        zones?: string[];
    }): Promise<ModuleRegistry>;
    /**
     * @param {object} options
     * @param {ModuleItem[]} options.items
     * @param {import('@nan0web/db').DB} [options.db]
     * @param {string[]} [options.zones]
     */
    constructor({ items, db, zones }: {
        items: ModuleItem[];
        db?: import("@nan0web/db").DB;
        zones?: string[];
    });
    items: ModuleItem[];
    db: import("@nan0web/db").default;
    zones: string[];
    /**
     * Returns items matching a given zone prefix.
     * More specific zones (like apps/3rdparty) take precedence over parent zones (apps).
     * @param {string} zone
     * @returns {ModuleItem[]}
     */
    byZone(zone: string): ModuleItem[];
    /**
     * Filters modules and returns a new ModuleRegistry instance (Fluent chaining).
     * @param {(module: ModuleItem) => boolean} predicate
     * @returns {ModuleRegistry}
     */
    filter(predicate: (module: ModuleItem) => boolean): ModuleRegistry;
    /**
     * Finds the first matching module.
     * @param {(module: ModuleItem) => boolean} predicate
     * @returns {ModuleItem | undefined}
     */
    find(predicate: (module: ModuleItem) => boolean): ModuleItem | undefined;
    /**
     * Deeply updates/merges a key in package.json for all matched modules.
     * @param {string} key
     * @param {any | ((currentValue: any) => any)} updaterOrValue
     * @returns {this}
     */
    updatePackage(key: string, updaterOrValue: any | ((currentValue: any) => any)): this;
    /**
     * Replaces a nested value by dot-notation path in all matched modules.
     * @param {string} jsonPath
     * @param {any | ((val: any) => any)} valueOrUpdater
     * @returns {this}
     */
    replaceValue(jsonPath: string, valueOrUpdater: any | ((val: any) => any)): this;
    /**
     * Sets top-level package properties for all matched modules.
     * @param {Record<string, any>} patch
     * @returns {this}
     */
    setPackage(patch: Record<string, any>): this;
    /**
     * Deletes a nested key in all matched modules.
     * @param {string} jsonPath
     * @returns {this}
     */
    deleteKey(jsonPath: string): this;
    /**
     * Saves all dirty modules back to DB.
     * @returns {Promise<void>}
     */
    save(): Promise<void>;
    /**
     * Serializes modules in the given zone (or all) to CSV string.
     * @param {string} [zone]
     * @returns {string}
     */
    toCsv(zone?: string): string;
    /**
     * Serializes modules in the given zone (or all) to CSV0 string with FrontMatter and 0/1 boolean representation.
     * @param {string} [zone]
     * @returns {string}
     */
    toCsv0(zone?: string): string;
    /**
     * Generates a structured Markdown table index for a zone.
     * @param {string} zone
     * @returns {string}
     */
    toMarkdown(zone: string): string;
    /**
     * Generates and writes modules.csv and index.md for all configured zones.
     * @returns {Promise<void>}
     */
    writeIndexes(): Promise<void>;
    /**
     * @returns {Iterator<ModuleItem>}
     */
    [Symbol.iterator](): Iterator<ModuleItem>;
}
import { ModuleItem } from './ModuleItem.js';
