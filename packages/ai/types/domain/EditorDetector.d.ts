/**
 * Editor Definition
 * @typedef {Object} EditorDef
 * @property {string} id
 * @property {string} name
 * @property {string} configUri
 * @property {string} [globalSkillsDir]
 * @property {string} [localSkillsDir]
 * @property {string} [globalRuleUri]
 * @property {string[]} [detectionUris]
 * @property {boolean} detected
 * @property {'mcp' | 'settings' | 'antigravity'} [type]
 */
/**
 * EditorDetector — Shared domain model for discovering installed AI editors
 * and safely merging MCP server configurations without overwriting existing ones.
 */
export class EditorDetector extends Model {
    /**
     * Registry of supported AI editors using virtual DB mounts.
     * Add new editors (e.g. Aider, Vibe) here declaratively.
     * @type {Omit<EditorDef, 'detected'>[]}
     */
    static EDITORS: Omit<EditorDef, "detected">[];
    /**
     * @param {Partial<EditorDetector>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions & { db?: any }>} [options]
     */
    constructor(data?: Partial<EditorDetector>, options?: Partial<import("@nan0web/types").ModelOptions & {
        db?: any;
    }>);
    /** @type {any} Injected database provider */ $db: any;
    /**
     * Discovers supported AI editors via virtual DB mounts.
     * Completely agnostic to OS, process, or filesystem paths.
     * @returns {Promise<EditorDef[]>}
     */
    discoverEditors(): Promise<EditorDef[]>;
    /**
     * Checks if editor directory or config is present.
     * @param {EditorDef} def
     * @returns {Promise<boolean>}
     */
    isEditorPresent(def: EditorDef): Promise<boolean>;
    /**
     * Safely merges MCP server entries into an existing editor configuration object
     * without overwriting unrelated servers.
     * @param {Record<string, any>} existing
     * @param {'mcp' | 'settings' | 'antigravity'} [editorType]
     * @param {Record<string, object>} [servers]
     * @returns {Record<string, any>}
     */
    mergeMcpServers(existing?: Record<string, any>, editorType?: "mcp" | "settings" | "antigravity", servers?: Record<string, object>): Record<string, any>;
}
/**
 * Editor Definition
 */
export type EditorDef = {
    id: string;
    name: string;
    configUri: string;
    globalSkillsDir?: string;
    localSkillsDir?: string;
    globalRuleUri?: string;
    detectionUris?: string[];
    detected: boolean;
    type?: "mcp" | "settings" | "antigravity";
};
import { Model } from '@nan0web/types';
