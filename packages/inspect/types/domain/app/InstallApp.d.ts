/**
 * Editor Definition
 * @typedef {Object} EditorDef
 * @property {string} id
 * @property {string} name
 * @property {string} configUri
 * @property {boolean} detected
 * @property {'mcp' | 'settings' | 'antigravity'} [type]
 */
/**
 * InstallApp — Cross-Editor Zero-Hallucination Installer & MCP Bridge.
 */
export class InstallApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
        discovering: string;
        installing: string;
        installed: string;
        already_configured: string;
        no_editors: string;
        complete: string;
        editor: string;
        status: string;
        config_path: string;
        configured: string;
        not_detected: string;
    };
    static dir: {
        type: string;
        help: string;
        positional: boolean;
        default: string;
    };
    static homedir: {
        type: string;
        help: string;
        default: string;
    };
    /**
     * @param {Partial<InstallApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<InstallApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Workspace root directory */ dir: string;
    /** @type {string} Home directory for user-level editor configs */ homedir: string;
    /**
     * Resolves user home directory path.
     * @returns {string}
     */
    getHomedir(): string;
    /**
     * Discovers supported AI editors in the workspace and user environment.
     * Supports macOS, Linux, and Windows path conventions.
     * @returns {Promise<EditorDef[]>}
     */
    discoverEditors(): Promise<EditorDef[]>;
    /**
     * Checks if editor directory or config is present.
     * @private
     * @param {EditorDef} def
     * @returns {Promise<boolean>}
     */
    private _isEditorPresent;
    /**
     * Generates canonical nan0web-inspect MCP server declaration.
     * @returns {object}
     */
    getMcpServerConfig(): object;
    /**
     * Safely merges MCP configuration into target file.
     * @param {EditorDef} editor
     * @returns {Promise<boolean>} true if changed, false if already configured
     */
    configureEditor(editor: EditorDef): Promise<boolean>;
    /**
     * Run the installer.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
/**
 * Editor Definition
 */
export type EditorDef = {
    id: string;
    name: string;
    configUri: string;
    detected: boolean;
    type?: "mcp" | "settings" | "antigravity";
};
import { ModelAsApp } from '@nan0web/ui';
