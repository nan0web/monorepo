/**
 * ListAuditorsApp — Lists registered auditors and their descriptions/scopes.
 */
export class ListAuditorsApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        description: string;
        header_alias: string;
        header_name: string;
        header_scope: string;
    };
    /**
     * Run the listing subcommand.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
