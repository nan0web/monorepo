/**
 * StatsReportModel — Reports performance, tokens usage and efficiency index of models from local logs.
 */
export class StatsReportModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        noData: string;
        header: string;
        separator: string;
    };
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
