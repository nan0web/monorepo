/**
 * DoctorApp — Health check and diagnostics for MCP cross-editor integration.
 */
export class DoctorApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
        diagnosing: string;
        checking_editor: string;
        all_green: string;
        no_configured: string;
        editor: string;
        detected: string;
        mcp_configured: string;
        config_path: string;
        yes: string;
        no: string;
        active: string;
        inactive: string;
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
     * @param {Partial<DoctorApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<DoctorApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Workspace root directory */ dir: string;
    /** @type {string} Home directory for user-level editor configs */ homedir: string;
    /**
     * Run the diagnostic doctor.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
