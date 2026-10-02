/**
 * ModuleItem represents an inspected module/package in the workspace.
 * Wraps package.json and tsconfig.json metadata with canonical UI and profile detection.
 */
export class ModuleItem {
    /**
     * @param {object} options
     * @param {string} options.dir - Directory of the module relative to workspace (e.g. 'packages/foo')
     * @param {Record<string, any>} [options.pkg] - Parsed package.json
     * @param {Record<string, any>} [options.tsconfig] - Parsed tsconfig.json
     * @param {import('@nan0web/db').DB} [options.db] - DB instance
     */
    constructor({ dir, pkg, tsconfig, db }: {
        dir: string;
        pkg?: Record<string, any>;
        tsconfig?: Record<string, any>;
        db?: import("@nan0web/db").DB;
    });
    dir: string;
    pkg: Record<string, any>;
    tsconfig: Record<string, any>;
    db: import("@nan0web/db").default;
    _dirty: boolean;
    warnings: any[];
    ui: string[];
    profile: "node" | "react" | "lit";
    get name(): any;
    get version(): any;
    get private(): boolean;
    /**
     * Resolves canonical UI tags strictly from package.json exports,
     * falling back to canonical package name pattern (@nan0web/ui-*).
     *
     * Subpaths:
     * - ./ui/react or ./react -> 'ui-react'
     * - ./ui/lit or ./lit -> 'ui-lit'
     * - ./ui/cli or ./cli -> 'ui-cli'
     * - ./ui/web, ./web, or ./dom -> 'ui-web'
     *
     * @returns {string[]}
     * @private
     */
    private _resolveCanonicalUi;
    /**
     * Detects TypeScript profile (node, react, lit)
     * @returns {'node' | 'react' | 'lit'}
     * @private
     */
    private _resolveProfile;
    /**
     * Deeply updates/merges a top-level key in package.json
     * @param {string} key
     * @param {any | ((currentValue: any) => any)} updaterOrValue
     * @returns {this}
     */
    updatePackage(key: string, updaterOrValue: any | ((currentValue: any) => any)): this;
    /**
     * Replaces a nested value by dot-notation path (e.g. 'engines.node')
     * @param {string} jsonPath
     * @param {any | ((val: any) => any)} valueOrUpdater
     * @returns {this}
     */
    replaceValue(jsonPath: string, valueOrUpdater: any | ((val: any) => any)): this;
    /**
     * Merges top-level patch object into package.json
     * @param {Record<string, any>} patch
     * @returns {this}
     */
    setPackage(patch: Record<string, any>): this;
    /**
     * Deletes a nested key by dot-notation path
     * @param {string} jsonPath
     * @returns {this}
     */
    deleteKey(jsonPath: string): this;
    /**
     * Saves modified package.json back via injected DB
     * @returns {Promise<void>}
     */
    save(): Promise<void>;
}
