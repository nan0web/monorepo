/**
 * AppManifest — Runtime representation of a micro-app's capabilities.
 *
 * NOT a separate file — derived from `package.json#exports`.
 * The engine reads `package.json` to discover what a micro-app provides:
 *
 *   package.json#exports:
 *     ".":          → domain + logic
 *     "./domain":   → domain models
 *     "./ui/cli":   → CLI adapter
 *     "./ui/api":   → API adapter
 *     "./ui/lit":   → Lit Web Components
 *     "./ui/chat":  → AI Chat adapter
 *     "./ui/voice": → Voice adapter
 *     "./ui/swift": → Swift adapter
 *     "./ui/kotlin": → Kotlin adapter
 *     "./ui/robo":  → Robotics adapter
 *
 * Pages/routes are NOT declared here — they are auto-built from
 * the `data/` file structure (Data-Driven Hub Routing).
 *
 * @property {string} appName Unique app identifier (from package.json#name)
 * @property {string} version From package.json#version
 * @property {string} description From package.json#description
 * @property {string} src Package source (npm name or local path)
 * @property {string[]} adapters Available UI adapters (auto-detected from exports)
 */
export default class AppManifest extends Model {
    static appName: {
        alias: string;
        help: string;
        placeholder: string;
        type: string;
        required: boolean;
        default: string;
    };
    static version: {
        help: string;
        placeholder: string;
        type: string;
        default: string;
    };
    static description: {
        help: string;
        type: string;
        default: string;
    };
    static src: {
        help: string;
        placeholder: string;
        type: string;
        default: string;
    };
    static adapters: {
        help: string;
        type: string;
        default: never[];
    };
    /**
     * Parse package.json exports to detect available UI adapters.
     * Exports matching `./ui/*` pattern are extracted as adapter names.
     *
     * @param {object} pkg - package.json content
     * @returns {AppManifest}
     */
    static fromPackageJson(pkg: object): AppManifest;
    /**
     * @param {object} [data]
     * @param {object} [options]
     */
    constructor(data?: object, options?: object);
    /** @returns {string} Alias accessor */
    get name(): string;
    /** @type {string} */ appName: string;
    /** @type {string} */ version: string;
    /** @type {string} */ description: string;
    /** @type {string} */ src: string;
    /** @type {string[]} */ adapters: string[];
    /**
     * Check if this app provides a specific UI adapter.
     * @param {string} adapter - e.g. 'cli', 'api', 'chat', 'lit', 'swift'
     * @returns {boolean}
     */
    hasAdapter(adapter: string): boolean;
}
import { Model } from '@nan0web/types';
