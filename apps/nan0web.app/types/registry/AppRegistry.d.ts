/**
 * @file AppRegistry — Scoped Registry for Micro-Apps.
 *
 * Discovers app capabilities from `package.json#exports`.
 * Routes are NOT declared in manifests — they come from
 * the `data/` file structure (Data-Driven Hub Routing).
 *
 * Lifecycle:
 *   1. AppRunner calls `registry.register(pkg)` for each app
 *   2. Registry reads `package.json#exports` to detect `./ui/*` adapters
 *   3. Manifest is hydrated into AppManifest model
 *   4. Engine queries: `registry.getByAdapter('cli')` → all cli-capable apps
 */
export default class AppRegistry {
    /** @returns {number} */
    get size(): number;
    /**
     * Register an app from its package.json.
     * Auto-detects UI adapters from `exports` map.
     *
     * @param {object} pkg - package.json content
     * @returns {AppManifest}
     */
    registerFromPackage(pkg: object): AppManifest;
    /**
     * Register a manifest directly (for testing or manual config).
     * @param {AppManifest | object} input
     * @returns {AppManifest}
     */
    register(input: AppManifest | object): AppManifest;
    /**
     * Get manifest by app name.
     * @param {string} name
     * @returns {AppManifest | undefined}
     */
    get(name: string): AppManifest | undefined;
    /**
     * Check if an app has a specific adapter.
     * @param {string} appName
     * @param {string} adapter - e.g. 'cli', 'api', 'chat', 'lit'
     * @returns {boolean}
     */
    hasAdapter(appName: string, adapter: string): boolean;
    /**
     * Get all apps that provide a specific UI adapter.
     * @param {string} adapter - e.g. 'cli', 'api', 'chat', 'lit', 'swift', 'kotlin', 'robo'
     * @returns {AppManifest[]}
     */
    getByAdapter(adapter: string): AppManifest[];
    /**
     * List all registered app names.
     * @returns {string[]}
     */
    list(): string[];
    #private;
}
import AppManifest from '../domain/AppManifest.js';
