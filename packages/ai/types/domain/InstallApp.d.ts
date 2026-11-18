/**
 * InstallApp — Cross-Editor Installer for @nan0web/ai (MCP servers & Skills).
 */
export class InstallApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
        discovering: string;
        installing: string;
        installed: string;
        skills_synced: string;
        rule_synced: string;
        complete: string;
        editor: string;
        status: string;
        config_path: string;
        configured: string;
        not_detected: string;
    };
    static global: {
        type: string;
        help: string;
        alias: string;
        default: boolean;
    };
    static mcp: {
        type: string;
        help: string;
        default: boolean;
    };
    static skills: {
        type: string;
        help: string;
        default: boolean;
    };
    static rules: {
        type: string;
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<InstallApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<InstallApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {boolean} Install skills globally */ global: boolean;
    /** @type {boolean} Register MCP server */ mcp: boolean;
    /** @type {boolean} Sync skills */ skills: boolean;
    /** @type {boolean} Sync global cascade rule */ rules: boolean;
    /**
     * Returns canonical nan0web-knowledge MCP server declaration.
     * @returns {Record<string, object>}
     */
    getMcpServers(): Record<string, object>;
    /**
     * Safely merges nan0web-knowledge MCP configuration into target editor config.
     * @param {import('./EditorDetector.js').EditorDef} editor
     * @param {EditorDetector} detector
     * @returns {Promise<boolean>}
     */
    configureMcp(editor: import("./EditorDetector.js").EditorDef, detector: EditorDetector): Promise<boolean>;
    /**
     * Syncs skills from @app/docs/uk/workflows into the target editor directory.
     * @param {import('./EditorDetector.js').EditorDef} editor
     * @returns {Promise<{ count: number, targetDir: string | null }>}
     */
    syncSkills(editor: import("./EditorDetector.js").EditorDef): Promise<{
        count: number;
        targetDir: string | null;
    }>;
    /**
     * Returns canonical global cascade AGENTS.md rule content.
     * @returns {string}
     */
    getGlobalRuleContent(): string;
    /**
     * Syncs global cascade AGENTS.md rule into the target editor.
     * @param {import('./EditorDetector.js').EditorDef} editor
     * @returns {Promise<string | null>}
     */
    syncGlobalRule(editor: import("./EditorDetector.js").EditorDef): Promise<string | null>;
    /**
     * Run the installer.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
import { EditorDetector } from './EditorDetector.js';
